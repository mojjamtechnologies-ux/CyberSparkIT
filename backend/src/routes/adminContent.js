import { Router } from 'express';
import { z } from 'zod';
import { db } from '../supabase.js';
import { requireAuth } from '../auth.js';
import { mailConfigured, sendMail } from '../mailer.js';
import { emit } from '../automation.js';

const r = Router();
r.use(requireAuth());
const adminOnly = requireAuth(['admin']);

// ---------- validation helpers ----------
const txt = (max) => z.string().trim().max(max).nullish().transform((v) => v || null);
const url = z.union([z.literal('').transform(() => null), z.string().trim().max(500).url().refine((u) => /^https?:\/\//i.test(u), 'Must start with http:// or https://')]).nullish();
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes').max(80);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const lines = z.array(z.string().trim().min(1).max(200)).max(30);
const int = z.number().int();

function crud(path, table, schema, order = [['created_at', false]]) {
  r.get(path, async (_q, res) => {
    let q = db.from(table).select('*');
    for (const [c, asc] of order) q = q.order(c, { ascending: asc });
    const { data, error } = await q.limit(1000);
    if (error) { console.error(error.message); return res.status(500).json({ error: 'Could not load data' }); }
    res.json(data);
  });
  r.post(path, adminOnly, async (req, res) => {
    const p = schema.safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'Please check the form', fields: p.error.flatten().fieldErrors });
    const { data, error } = await db.from(table).insert(p.data).select().single();
    if (error) return res.status(400).json({ error: error.code === '23505' ? 'That slug already exists' : 'Could not save' });
    res.status(201).json(data);
  });
  r.patch(`${path}/:id`, adminOnly, async (req, res) => {
    const p = schema.partial().safeParse(req.body);
    if (!p.success || !Object.keys(p.data).length) return res.status(400).json({ error: 'Invalid update', fields: p.success ? {} : p.error.flatten().fieldErrors });
    const { data, error } = await db.from(table).update(p.data).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(error ? 400 : 404).json({ error: error ? 'Could not save' : 'Not found' });
    res.json(data);
  });
  r.delete(`${path}/:id`, adminOnly, async (req, res) => {
    const { error } = await db.from(table).delete().eq('id', req.params.id);
    error ? res.status(400).json({ error: 'Could not delete' }) : res.status(204).end();
  });
}

const CATEGORIES = ['Websites', 'Mobile apps', 'E-commerce', 'Business utility systems', 'AI and automation', 'Training and educational platforms'];
crud('/projects', 'projects', z.object({ title: z.string().trim().min(2).max(160), category: z.enum(CATEGORIES), description: z.string().trim().min(5).max(2000), problem: txt(1500), solution: txt(1500), tech: lines.optional(), features: lines.optional(), image_url: url, live_url: url, github_url: url, service_slug: txt(80), published: z.boolean().optional(), sort: int.optional() }), [['sort', true], ['created_at', false]]);
crud('/testimonials', 'testimonials', z.object({ quote: z.string().trim().min(5).max(1000), name: z.string().trim().min(2).max(120), business: txt(160), published: z.boolean().optional(), sort: int.optional() }), [['sort', true]]);
crud('/faqs', 'faqs', z.object({ question: z.string().trim().min(5).max(300), answer: z.string().trim().min(2).max(3000), published: z.boolean().optional(), sort: int.optional() }), [['sort', true]]);
crud('/announcements', 'announcements', z.object({ message: z.string().trim().min(2).max(300), link_url: url, active: z.boolean().optional() }));
crud('/posts', 'blog_posts', z.object({ slug, title: z.string().trim().min(2).max(200), excerpt: txt(400), body: z.string().trim().min(1).max(50000), published: z.boolean().optional() }));
crud('/courses', 'courses', z.object({ slug, title: z.string().trim().min(2).max(160), category: txt(80), description: z.string().trim().min(5).max(3000), syllabus: txt(5000), prerequisites: txt(1000), duration: txt(80), mode: z.enum(['onsite', 'online', 'hybrid']), fee_ngn: int.min(0).nullish(), registration_open: z.boolean().optional(), published: z.boolean().optional(), sort: int.optional() }), [['sort', true]]);
crud('/schedules', 'course_schedules', z.object({ course_id: z.string().uuid(), starts_on: date, ends_on: date.nullish(), location: txt(160), notes: txt(500) }), [['starts_on', false]]);

// ---------- site settings ----------
const settingSchemas = {
  contact: z.object({ phones: z.array(z.string().trim().min(6).max(20)).min(1).max(4), email: z.string().trim().email(), address: z.string().trim().min(5).max(300) }),
  stats: z.array(z.object({ value: z.string().trim().min(1).max(20), label: z.string().trim().min(1).max(60) })).max(8),
};
r.get('/settings', async (_q, res) => {
  const { data } = await db.from('site_settings').select('key,value');
  res.json(Object.fromEntries((data || []).map((x) => [x.key, x.value])));
});
r.put('/settings/:key', adminOnly, async (req, res) => {
  const schema = settingSchemas[req.params.key];
  if (!schema) return res.status(404).json({ error: 'Unknown setting' });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Please check the form' });
  const { error } = await db.from('site_settings').upsert({ key: req.params.key, value: p.data, updated_at: new Date().toISOString() });
  error ? res.status(500).json({ error: 'Could not save' }) : res.json({ ok: true });
});

// ---------- consultation slots & bookings ----------
r.get('/slots', async (_q, res) => {
  const since = new Date(Date.now() - 7 * 86400e3).toISOString();
  const { data, error } = await db.from('consultation_slots').select('*, consultation_bookings(id,full_name,email,phone,topic,status,enquiry_id)').gte('starts_at', since).order('starts_at').limit(1000);
  error ? res.status(500).json({ error: 'Could not load slots' }) : res.json(data);
});
const genSchema = z.object({
  date_from: date, date_to: date,
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).min(1).max(24),
  duration_min: int.min(10).max(240).default(30),
  weekdays: z.array(int.min(0).max(6)).min(1).default([1, 2, 3, 4, 5]),
});
r.post('/slots/generate', adminOnly, async (req, res) => {
  const p = genSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Please check the form' });
  const g = p.data, rows = [], now = Date.now();
  const end = new Date(`${g.date_to}T00:00:00Z`);
  const days = (end - new Date(`${g.date_from}T00:00:00Z`)) / 86400e3;
  if (!(days >= 0) || days > 62) return res.status(400).json({ error: 'Choose a range of up to 62 days' });
  for (let d = new Date(`${g.date_from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (!g.weekdays.includes(d.getUTCDay())) continue;
    for (const t of g.times) {
      const at = new Date(`${d.toISOString().slice(0, 10)}T${t}:00+01:00`); // Lagos is UTC+1 all year
      if (at.getTime() > now) rows.push({ starts_at: at.toISOString(), duration_min: g.duration_min });
    }
  }
  if (!rows.length || rows.length > 1000) return res.status(400).json({ error: rows.length ? 'Too many slots at once' : 'No future slots in that range' });
  const { data, error } = await db.from('consultation_slots').upsert(rows, { onConflict: 'starts_at', ignoreDuplicates: true }).select('id');
  error ? res.status(500).json({ error: 'Could not create slots' }) : res.status(201).json({ created: data.length, skipped: rows.length - data.length });
});
r.patch('/slots/:id', adminOnly, async (req, res) => {
  const p = z.object({ is_open: z.boolean() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid update' });
  const { error } = await db.from('consultation_slots').update(p.data).eq('id', req.params.id);
  error ? res.status(400).json({ error: 'Could not update' }) : res.json({ ok: true });
});
r.delete('/slots/:id', adminOnly, async (req, res) => {
  const { data: b } = await db.from('consultation_bookings').select('id').eq('slot_id', req.params.id).eq('status', 'booked').limit(1);
  if (b?.length) return res.status(409).json({ error: 'This slot has an active booking. Cancel the booking first.' });
  const { error } = await db.from('consultation_slots').delete().eq('id', req.params.id);
  error ? res.status(400).json({ error: 'Could not delete' }) : res.status(204).end();
});
r.patch('/bookings/:id/cancel', adminOnly, async (req, res) => {
  const { error } = await db.from('consultation_bookings').update({ status: 'cancelled' }).eq('id', req.params.id);
  error ? res.status(400).json({ error: 'Could not cancel' }) : res.json({ ok: true });
});

r.get('/registrations', async (_q, res) => {
  const { data, error } = await db.from('training_registrations').select('*, courses(title), course_schedules(starts_on)').order('created_at', { ascending: false }).limit(500);
  error ? res.status(500).json({ error: 'Could not load registrations' }) : res.json(data);
});

// ---------- quotations ----------
const itemSchema = z.object({ description: z.string().trim().min(1).max(300), qty: z.number().positive().max(100000), unit_price: z.number().min(0).max(1e10) });
const quoteSchema = z.object({ enquiry_id: z.string().uuid(), items: z.array(itemSchema).min(1).max(50), notes: txt(2000), valid_until: date.nullish() });
const total = (items) => items.reduce((s, i) => s + i.qty * i.unit_price, 0);
const number = (q) => `CS-Q-${String(q.seq).padStart(4, '0')}`;
const shape = (q) => ({ ...q, number: number(q), total: total(q.items) });
const naira = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function quoteText(q, e) {
  const rows = q.items.map((i, n) => `${n + 1}. ${i.description}\n   ${i.qty} x ${naira(i.unit_price)} = ${naira(i.qty * i.unit_price)}`).join('\n');
  return `Quotation ${number(q)}\n\nPrepared for: ${e.full_name}${e.business_name ? `, ${e.business_name}` : ''}\n\n${rows}\n\nTotal: ${naira(total(q.items))}\n${q.valid_until ? `Valid until: ${q.valid_until}\n` : ''}${q.notes ? `\nNotes:\n${q.notes}\n` : ''}\nTo accept this quotation or ask questions, reply to this email or call 09057315511 / 08020600641.\n\nCyberSpark IT Solutions\nEmpowering Small Businesses With Smart Tech`;
}

r.get('/quotations', async (req, res) => {
  let q = db.from('quotations').select('*').order('created_at', { ascending: false }).limit(200);
  if (req.query.enquiry_id) q = q.eq('enquiry_id', String(req.query.enquiry_id));
  const { data, error } = await q;
  error ? res.status(500).json({ error: 'Could not load quotations' }) : res.json(data.map(shape));
});
r.post('/quotations', adminOnly, async (req, res) => {
  const p = quoteSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Please check the quotation', fields: p.error.flatten().fieldErrors });
  const { data, error } = await db.from('quotations').insert({ ...p.data, created_by: req.user.sub }).select().single();
  error ? res.status(400).json({ error: 'Could not create quotation' }) : res.status(201).json(shape(data));
});
r.patch('/quotations/:id', adminOnly, async (req, res) => {
  const p = quoteSchema.omit({ enquiry_id: true }).partial().extend({ status: z.enum(['accepted', 'declined']).optional() }).safeParse(req.body);
  if (!p.success || !Object.keys(p.data).length) return res.status(400).json({ error: 'Invalid update' });
  const { data: cur } = await db.from('quotations').select('status').eq('id', req.params.id).maybeSingle();
  if (!cur) return res.status(404).json({ error: 'Quotation not found' });
  const edits = p.data.items || 'notes' in p.data || 'valid_until' in p.data;
  if (edits && cur.status !== 'draft') return res.status(409).json({ error: 'A sent quotation cannot be edited. Create a new one.' });
  if (p.data.status && cur.status !== 'sent') return res.status(409).json({ error: 'Only a sent quotation can be marked accepted or declined.' });
  const { data, error } = await db.from('quotations').update({ ...p.data, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  error ? res.status(400).json({ error: 'Could not update' }) : res.json(shape(data));
});
r.delete('/quotations/:id', adminOnly, async (req, res) => {
  const { data: cur } = await db.from('quotations').select('status').eq('id', req.params.id).maybeSingle();
  if (cur && cur.status !== 'draft') return res.status(409).json({ error: 'Only drafts can be deleted.' });
  await db.from('quotations').delete().eq('id', req.params.id);
  res.status(204).end();
});
r.post('/quotations/:id/send', adminOnly, async (req, res) => {
  const manual = req.body?.manual === true;
  const { data: q } = await db.from('quotations').select('*').eq('id', req.params.id).maybeSingle();
  if (!q) return res.status(404).json({ error: 'Quotation not found' });
  const { data: e } = await db.from('enquiries').select('*').eq('id', q.enquiry_id).single();
  const text = quoteText(q, e);
  if (!manual) {
    if (!mailConfigured) return res.status(409).json({ error: 'Email is not configured on the server. Copy or print the quotation and send it yourself, then choose "Mark as sent".', text });
    try { await sendMail(e.email, `Quotation ${number(q)} from CyberSpark IT Solutions`, text); }
    catch (err) { console.error('quotation mail failed:', err.message); return res.status(502).json({ error: 'The email could not be sent. Please try again or send it manually.', text }); }
  }
  const now = new Date().toISOString();
  const { data } = await db.from('quotations').update({ status: 'sent', sent_at: now, updated_at: now }).eq('id', q.id).select().single();
  if (e.status !== 'quotation_sent') {
    await db.from('enquiries').update({ status: 'quotation_sent', updated_at: now }).eq('id', e.id);
    await db.from('enquiry_history').insert({ enquiry_id: e.id, from_status: e.status, to_status: 'quotation_sent', changed_by: req.user.sub });
  }
  emit('quotation.sent', { id: q.id, enquiry_id: e.id, number: number(q), total: total(q.items), emailed: !manual });
  res.json({ quotation: shape(data), text, emailed: !manual });
});
r.get('/quotations/:id/text', async (req, res) => {
  const { data: q } = await db.from('quotations').select('*').eq('id', req.params.id).maybeSingle();
  if (!q) return res.status(404).json({ error: 'Quotation not found' });
  const { data: e } = await db.from('enquiries').select('*').eq('id', q.enquiry_id).single();
  res.json({ text: quoteText(q, e), quotation: shape(q), enquiry: { full_name: e.full_name, business_name: e.business_name, email: e.email } });
});

export default r;
