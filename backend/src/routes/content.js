import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../supabase.js';
import { notifyBooking, notifyRegistration } from '../mailer.js';
import { emit } from '../automation.js';

const r = Router();
const fail = (res, e) => { console.error(e?.message); res.status(500).json({ error: 'Could not load data' }); };
const list = (path, build) => r.get(path, async (_req, res) => { const { data, error } = await build(); error ? fail(res, error) : res.json(data); });

list('/projects', () => db.from('projects').select('*').eq('published', true).order('sort').order('created_at', { ascending: false }));
list('/testimonials', () => db.from('testimonials').select('id,quote,name,business').eq('published', true).order('sort'));
list('/faqs', () => db.from('faqs').select('id,question,answer').eq('published', true).order('sort'));
list('/posts', () => db.from('blog_posts').select('id,slug,title,excerpt,published_at').eq('published', true).order('published_at', { ascending: false }));
list('/courses', () => db.from('courses').select('*, course_schedules(id,starts_on,ends_on,location,notes)').eq('published', true).order('sort'));

r.get('/posts/:slug', async (req, res) => {
  const { data } = await db.from('blog_posts').select('id,slug,title,excerpt,body,published_at').eq('slug', req.params.slug).eq('published', true).maybeSingle();
  data ? res.json(data) : res.status(404).json({ error: 'Post not found' });
});

r.get('/site', async (_req, res) => {
  const [s, a] = await Promise.all([
    db.from('site_settings').select('key,value'),
    db.from('announcements').select('message,link_url').eq('active', true).order('created_at', { ascending: false }).limit(1),
  ]);
  if (s.error) return fail(res, s.error);
  const m = Object.fromEntries((s.data || []).map((x) => [x.key, x.value]));
  res.json({ contact: m.contact || null, stats: m.stats || [], announcement: a.data?.[0] || null });
});

// ---- Consultation booking ----
r.get('/consultation/slots', async (_req, res) => {
  const from = new Date(Date.now() + 2 * 3600e3).toISOString(); // at least 2 hours notice
  const { data: slots, error } = await db.from('consultation_slots').select('id,starts_at,duration_min').eq('is_open', true).gte('starts_at', from).order('starts_at').limit(200);
  if (error) return fail(res, error);
  if (!slots.length) return res.json([]);
  const { data: taken } = await db.from('consultation_bookings').select('slot_id').eq('status', 'booked').in('slot_id', slots.map((s) => s.id));
  const gone = new Set((taken || []).map((t) => t.slot_id));
  res.json(slots.filter((s) => !gone.has(s.id)));
});

const opt = (max) => z.string().trim().max(max).optional().transform((v) => v || undefined);
const bookSchema = z.object({
  slot_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: opt(30), topic: opt(1000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent to the privacy policy is required' }) }),
});
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Please try again later.' } });

r.post('/consultation/book', formLimiter, async (req, res) => {
  if (req.body?.website) return res.status(201).json({ ok: true });
  const p = bookSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Please check the form', fields: p.error.flatten().fieldErrors });
  const b = p.data;
  const { data: slot } = await db.from('consultation_slots').select('id,starts_at,is_open').eq('id', b.slot_id).maybeSingle();
  if (!slot || !slot.is_open || new Date(slot.starts_at) < new Date(Date.now() + 3600e3)) {
    return res.status(409).json({ error: 'That time is no longer available. Please choose another.' });
  }
  const { data: booking, error } = await db.from('consultation_bookings').insert({ slot_id: b.slot_id, full_name: b.full_name, email: b.email, phone: b.phone, topic: b.topic, consent: true }).select('id').single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Sorry, that time was just booked. Please choose another.' });
    console.error(error.message);
    return res.status(500).json({ error: 'We could not complete your booking. Please call us.' });
  }
  // Mirror into the lead pipeline so the team sees it with all other enquiries.
  const { data: enq } = await db.from('enquiries').insert({
    full_name: b.full_name, email: b.email, phone: b.phone, consent: true, contact_method: b.phone ? 'phone' : 'email',
    message: `Consultation booked for ${new Date(slot.starts_at).toISOString()} (UTC).${b.topic ? ` Topic: ${b.topic}` : ''}`,
    status: 'consultation_scheduled',
  }).select('id').single();
  if (enq) {
    await db.from('consultation_bookings').update({ enquiry_id: enq.id }).eq('id', booking.id);
    await db.from('enquiry_history').insert({ enquiry_id: enq.id, from_status: null, to_status: 'consultation_scheduled' });
  }
  notifyBooking(b, slot);
  emit('booking.created', { id: booking.id, enquiry_id: enq?.id ?? null, starts_at: slot.starts_at, full_name: b.full_name, email: b.email, phone: b.phone, topic: b.topic });
  res.status(201).json({ ok: true, reference: booking.id.slice(0, 8).toUpperCase(), starts_at: slot.starts_at });
});

// ---- Training registration ----
const regSchema = z.object({
  course_id: z.string().uuid(), schedule_id: z.string().uuid().optional(),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: opt(30), message: opt(1000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent to the privacy policy is required' }) }),
});
r.post('/training/register', formLimiter, async (req, res) => {
  if (req.body?.website) return res.status(201).json({ ok: true });
  const p = regSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Please check the form', fields: p.error.flatten().fieldErrors });
  const g = p.data;
  const { data: course } = await db.from('courses').select('id,title,published,registration_open').eq('id', g.course_id).maybeSingle();
  if (!course || !course.published) return res.status(404).json({ error: 'Course not found' });
  if (!course.registration_open) return res.status(409).json({ error: 'Registration for this course is currently closed.' });
  if (g.schedule_id) {
    const { data: sch } = await db.from('course_schedules').select('id').eq('id', g.schedule_id).eq('course_id', g.course_id).maybeSingle();
    if (!sch) return res.status(400).json({ error: 'Please check the form', fields: { schedule_id: ['Unknown schedule'] } });
  }
  const { data, error } = await db.from('training_registrations').insert({ ...g, consent: true }).select('id').single();
  if (error) { console.error(error.message); return res.status(500).json({ error: 'We could not save your registration. Please call us.' }); }
  notifyRegistration(g, course);
  emit('registration.created', { id: data.id, course_id: course.id, course: course.title, full_name: g.full_name, email: g.email, phone: g.phone });
  res.status(201).json({ ok: true, reference: data.id.slice(0, 8).toUpperCase() });
});

r.get('/sitemap.xml', async (_req, res) => {
  const base = 'https://cybersparkit.site';
  const pages = ['', 'about', 'services', 'solutions', 'ai-automation', 'portfolio', 'training', 'blog', 'contact', 'privacy', 'terms'];
  const [svc, posts] = await Promise.all([
    db.from('services').select('slug').eq('kind', 'service').eq('published', true),
    db.from('blog_posts').select('slug,published_at').eq('published', true),
  ]);
  const urls = [...pages.map((p) => `${base}/${p}`), ...(svc.data || []).map((s) => `${base}/services/${s.slug}`), ...(posts.data || []).map((p) => `${base}/blog/${p.slug}`)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
});

export default r;
