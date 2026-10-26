import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../supabase.js';
import { notifyNewEnquiry } from '../mailer.js';
import { emit } from '../automation.js';

const r = Router();
const COLS = 'id,slug,kind,title,summary,details,features,icon,sort';

r.get('/services', async (req, res) => {
  let q = db.from('services').select(COLS).eq('published', true).order('sort');
  if (['service', 'utility'].includes(req.query.type)) q = q.eq('kind', req.query.type);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: 'Could not load services' });
  res.json(data);
});

r.get('/services/:slug', async (req, res) => {
  const { data } = await db.from('services').select(COLS).eq('slug', req.params.slug).eq('published', true).maybeSingle();
  if (!data) return res.status(404).json({ error: 'Service not found' });
  res.json(data);
});

const opt = (max) => z.string().trim().max(max).optional().transform((v) => v || undefined);
const enquirySchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  business_name: opt(160),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: opt(30),
  service_slug: opt(80),
  budget: opt(80),
  timeline: opt(80),
  message: z.string().trim().min(10).max(4000),
  contact_method: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent to the privacy policy is required' }) }),
});

const enquiryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Please try again later.' } });

r.post('/enquiries', enquiryLimiter, async (req, res) => {
  // Honeypot: real users never fill the hidden "website" field. Pretend success to bots.
  if (req.body?.website) return res.status(201).json({ ok: true });

  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please check the form', fields: parsed.error.flatten().fieldErrors });
  }
  const e = parsed.data;

  if (e.service_slug) {
    const { data } = await db.from('services').select('slug').eq('slug', e.service_slug).maybeSingle();
    if (!data) return res.status(400).json({ error: 'Please check the form', fields: { service_slug: ['Unknown service'] } });
  }

  const { data, error } = await db.from('enquiries').insert(e).select('id').single();
  if (error) {
    console.error('enquiry insert failed:', error.message);
    return res.status(500).json({ error: 'We could not save your enquiry. Please try again or call us.' });
  }
  notifyNewEnquiry(e);
  emit('enquiry.created', { id: data.id, ...e });
  res.status(201).json({ ok: true, reference: data.id.slice(0, 8).toUpperCase() });
});

export default r;
