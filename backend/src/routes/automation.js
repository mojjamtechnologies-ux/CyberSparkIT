import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../supabase.js';

// Inbound endpoint for an automation platform (e.g. n8n) to attach AI-generated suggestions
// to an enquiry as an INTERNAL NOTE. Nothing here is ever sent to a customer; a person reviews it first.
const r = Router();
const KEY = process.env.AUTOMATION_API_KEY || '';
const limiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

r.post('/enquiries/:id/note', limiter, async (req, res) => {
  if (KEY.length < 32) return res.status(404).json({ error: 'Not found' }); // disabled unless a strong key is configured
  const given = Buffer.from(String(req.headers['x-automation-key'] || ''));
  const want = Buffer.from(KEY);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) return res.status(401).json({ error: 'Unauthorized' });
  const p = z.object({ id: z.string().uuid(), body: z.string().trim().min(1).max(2000), label: z.enum(['ai-category', 'ai-draft', 'note']).default('note') })
    .safeParse({ id: req.params.id, ...req.body });
  if (!p.success) return res.status(400).json({ error: 'Invalid request' });
  const { error } = await db.from('enquiry_notes').insert({ enquiry_id: p.data.id, author_id: null, body: `[Automation: ${p.data.label}] ${p.data.body}` });
  error ? res.status(400).json({ error: 'Could not add note' }) : res.status(201).json({ ok: true });
});

export default r;
