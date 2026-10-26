import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../supabase.js';
import { signToken, requireAuth } from '../auth.js';

const r = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const STATUSES = ['new', 'contacted', 'consultation_scheduled', 'quotation_sent', 'in_progress', 'completed', 'closed'];

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts. Try again later.' } });

r.post('/login', loginLimiter, async (req, res) => {
  const p = z.object({ email: z.string().email().toLowerCase(), password: z.string().min(1).max(200) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Email and password are required' });
  const { data: u } = await db.from('admin_users').select('*').eq('email', p.data.email).maybeSingle();
  const ok = await bcrypt.compare(p.data.password, u?.password_hash || DUMMY_HASH);
  if (!u || !ok) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: signToken(u), user: { id: u.id, email: u.email, name: u.name, role: u.role } });
});

// Everything below requires a valid admin/staff token.
r.use(requireAuth());

r.get('/stats', async (_req, res) => {
  const count = (t, f) => { let q = db.from(t).select('*', { count: 'exact', head: true }); return (f ? f(q) : q).then((x) => x.count ?? 0); };
  const nowIso = new Date().toISOString();
  const [total, fresh, active, services, projects, regs, upcoming] = await Promise.all([
    count('enquiries'),
    count('enquiries', (q) => q.eq('status', 'new')),
    count('enquiries', (q) => q.eq('status', 'in_progress')),
    count('services', (q) => q.eq('published', true)),
    count('projects', (q) => q.eq('published', true)),
    count('training_registrations'),
    db.from('consultation_bookings').select('id, consultation_slots!inner(starts_at)', { count: 'exact', head: true }).eq('status', 'booked').gt('consultation_slots.starts_at', nowIso).then((x) => x.count ?? 0),
  ]);
  const { data: recent } = await db.from('enquiries').select('id,full_name,service_slug,status,created_at').order('created_at', { ascending: false }).limit(8);
  const { data: followups } = await db.from('enquiries').select('id,full_name,follow_up_at,status').not('follow_up_at', 'is', null).lte('follow_up_at', new Date(Date.now() + 86400e3).toISOString()).not('status', 'in', '(completed,closed)').order('follow_up_at').limit(10);
  res.json({ total_enquiries: total, new_enquiries: fresh, active_projects: active, published_services: services, published_projects: projects, course_registrations: regs, upcoming_consultations: upcoming, recent, followups: followups || [] });
});

const listQuery = (req) => {
  let q = db.from('enquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (STATUSES.includes(req.query.status)) q = q.eq('status', req.query.status);
  const s = String(req.query.q || '').replace(/[,()%*]/g, ' ').trim().slice(0, 80);
  if (s) q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,business_name.ilike.%${s}%`);
  return q;
};

r.get('/enquiries', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), size = 20;
  const { data, count, error } = await listQuery(req).range((page - 1) * size, page * size - 1);
  if (error) return res.status(500).json({ error: 'Could not load enquiries' });
  res.json({ items: data, total: count, page, page_size: size });
});

const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // block spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};
r.get('/enquiries.csv', async (req, res) => {
  const { data, error } = await listQuery(req).limit(5000);
  if (error) return res.status(500).json({ error: 'Export failed' });
  const cols = ['created_at', 'full_name', 'business_name', 'email', 'phone', 'service_slug', 'budget', 'timeline', 'contact_method', 'status', 'follow_up_at', 'message'];
  const csv = [cols.join(','), ...data.map((row) => cols.map((c) => csvCell(row[c])).join(','))].join('\n');
  res.type('text/csv').attachment('enquiries.csv').send(csv);
});

r.get('/enquiries/:id', async (req, res) => {
  const { data: enquiry } = await db.from('enquiries').select('*').eq('id', req.params.id).maybeSingle();
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
  const [notes, history] = await Promise.all([
    db.from('enquiry_notes').select('*').eq('enquiry_id', enquiry.id).order('created_at'),
    db.from('enquiry_history').select('*').eq('enquiry_id', enquiry.id).order('created_at'),
  ]);
  res.json({ enquiry, notes: notes.data, history: history.data });
});

const patchSchema = z.object({
  status: z.enum(STATUSES).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  follow_up_at: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();

r.patch('/enquiries/:id', async (req, res) => {
  const p = patchSchema.safeParse(req.body);
  if (!p.success || !Object.keys(p.data).length) return res.status(400).json({ error: 'Invalid update' });
  const { data: cur } = await db.from('enquiries').select('status').eq('id', req.params.id).maybeSingle();
  if (!cur) return res.status(404).json({ error: 'Enquiry not found' });
  const { data, error } = await db.from('enquiries').update({ ...p.data, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: 'Update failed' });
  if (p.data.status && p.data.status !== cur.status) {
    await db.from('enquiry_history').insert({ enquiry_id: req.params.id, from_status: cur.status, to_status: p.data.status, changed_by: req.user.sub });
  }
  res.json(data);
});

r.post('/enquiries/:id/notes', async (req, res) => {
  const p = z.object({ body: z.string().trim().min(1).max(2000) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Note cannot be empty' });
  const { data, error } = await db.from('enquiry_notes').insert({ enquiry_id: req.params.id, author_id: req.user.sub, body: p.data.body }).select().single();
  if (error) return res.status(400).json({ error: 'Could not add note' });
  res.status(201).json(data);
});

// Team members (for assigning enquiries). Never returns password hashes.
r.get('/users', async (_req, res) => {
  const { data } = await db.from('admin_users').select('id,name,email,role').order('name');
  res.json(data);
});

// Services & utility-app listings (admins only for writes)
const serviceSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  kind: z.enum(['service', 'utility']),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(5).max(300),
  details: z.string().trim().max(8000).optional(),
  features: z.array(z.string().trim().max(160)).max(20).optional(),
  icon: z.string().trim().max(40).optional(),
  published: z.boolean().optional(),
  sort: z.number().int().optional(),
});
const adminOnly = requireAuth(['admin']);

r.get('/services', async (_req, res) => {
  const { data } = await db.from('services').select('*').order('kind').order('sort');
  res.json(data);
});
r.post('/services', adminOnly, async (req, res) => {
  const p = serviceSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Invalid service', fields: p.error.flatten().fieldErrors });
  const { data, error } = await db.from('services').insert(p.data).select().single();
  if (error) return res.status(400).json({ error: error.code === '23505' ? 'Slug already exists' : 'Could not create service' });
  res.status(201).json(data);
});
r.patch('/services/:id', adminOnly, async (req, res) => {
  const p = serviceSchema.partial().strict().safeParse(req.body);
  if (!p.success || !Object.keys(p.data).length) return res.status(400).json({ error: 'Invalid update' });
  const { data, error } = await db.from('services').update({ ...p.data, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
  if (error || !data) return res.status(404).json({ error: 'Service not found' });
  res.json(data);
});
r.delete('/services/:id', adminOnly, async (req, res) => {
  const { error } = await db.from('services').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: 'Could not delete service' });
  res.status(204).end();
});

export default r;
