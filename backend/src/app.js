import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import './supabase.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';
import adminContent from './routes/adminContent.js';
import automationRoutes from './routes/automation.js';

const app = express();
app.set('trust proxy', 1); // Render sits behind one proxy; needed for correct client IPs
app.use(helmet());
app.use((req, res, next) => { // minimal request log (no query strings, no personal data)
  const t = Date.now();
  res.on('finish', () => req.path !== '/api/health' && console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - t}ms`));
  next();
});

const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => (!origin || origins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed'))),
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '50kb' }));
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', publicRoutes);
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminContent);
app.use('/api/automation', automationRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.message === 'Origin not allowed' ? 403 : 500).json({ error: err.message === 'Origin not allowed' ? err.message : 'Server error' });
});

export default app;
