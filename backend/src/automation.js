import crypto from 'node:crypto';

// Optional outbound events to an automation platform such as n8n. Does nothing unless N8N_WEBHOOK_URL is set.
// Credentials stay on the server. Failures are logged and never affect the website.
const { N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, NODE_ENV } = process.env;
const enabled = Boolean(N8N_WEBHOOK_URL) && (NODE_ENV !== 'production' || N8N_WEBHOOK_URL.startsWith('https://'));
if (N8N_WEBHOOK_URL && !enabled) console.warn('N8N_WEBHOOK_URL ignored: production requires https://');

export function emit(event, data) {
  if (!enabled) return;
  const body = JSON.stringify({ event, at: new Date().toISOString(), data });
  const headers = { 'Content-Type': 'application/json' };
  if (N8N_WEBHOOK_SECRET) headers['x-cyberspark-signature'] = `sha256=${crypto.createHmac('sha256', N8N_WEBHOOK_SECRET).update(body).digest('hex')}`;
  fetch(N8N_WEBHOOK_URL, { method: 'POST', headers, body, signal: AbortSignal.timeout(5000) })
    .catch((e) => console.log('automation webhook failed:', e.message));
}
