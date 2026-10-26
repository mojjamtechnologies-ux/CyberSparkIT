import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

// No database is needed: these tests cover the checks that run before any query.
Object.assign(process.env, {
  SUPABASE_URL: 'http://127.0.0.1:9', SUPABASE_SERVICE_ROLE_KEY: 'test',
  JWT_SECRET: 'test-secret-test-secret-test-secret-123456', CORS_ORIGINS: 'https://cybersparkit.site',
  AUTOMATION_API_KEY: 'a'.repeat(40),
});
const { default: app } = await import('../src/app.js');
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());
const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const token = (role, secret = process.env.JWT_SECRET, opts = {}) => jwt.sign({ sub: '00000000-0000-0000-0000-000000000000', role }, secret, opts);

test('health check', async () => assert.equal((await fetch(`${base}/api/health`)).status, 200));
test('unknown API path returns JSON 404', async () => assert.equal((await fetch(`${base}/api/nope`)).status, 404));
test('CORS rejects unknown origins', async () => assert.equal((await fetch(`${base}/api/health`, { headers: { Origin: 'https://evil.example' } })).status, 403));
test('CORS allows the production site', async () => assert.equal((await fetch(`${base}/api/health`, { headers: { Origin: 'https://cybersparkit.site' } })).status, 200));

test('admin endpoints require a valid token', async () => {
  for (const p of ['stats', 'enquiries', 'enquiries.csv', 'slots', 'quotations', 'registrations', 'settings', 'users', 'services']) {
    assert.equal((await fetch(`${base}/api/admin/${p}`)).status, 401, p);
  }
  assert.equal((await fetch(`${base}/api/admin/stats`, { headers: { Authorization: `Bearer ${token('admin', 'wrong-secret-wrong-secret-wrong-secret-1')}` } })).status, 401);
  assert.equal((await fetch(`${base}/api/admin/stats`, { headers: { Authorization: `Bearer ${token('admin', undefined, { expiresIn: -10 })}` } })).status, 401);
});
test('staff accounts cannot write content', async () => {
  const h = { Authorization: `Bearer ${token('staff')}` };
  for (const p of ['projects', 'courses', 'posts', 'faqs', 'quotations', 'slots/generate', 'services']) assert.equal((await post(`/api/admin/${p}`, {}, h)).status, 403, p);
});
test('login validates input', async () => assert.equal((await post('/api/admin/login', { email: 'nope' })).status, 400));

test('enquiry validation rejects bad input with field errors', async () => {
  const r = await post('/api/enquiries', { full_name: 'A', email: 'bad', message: 'x', consent: false });
  assert.equal(r.status, 400);
  const j = await r.json();
  for (const f of ['full_name', 'email', 'message', 'consent']) assert.ok(j.fields[f], f);
});
test('enquiry honeypot is silently accepted without saving', async () => assert.equal((await post('/api/enquiries', { website: 'spam' })).status, 201));
test('booking and registration validate input', async () => {
  assert.equal((await post('/api/consultation/book', { slot_id: 'x' })).status, 400);
  assert.equal((await post('/api/training/register', {})).status, 400);
  assert.equal((await post('/api/consultation/book', { website: 'spam' })).status, 201);
});
test('automation endpoint checks its key and input', async () => {
  const id = '11111111-1111-1111-1111-111111111111';
  assert.equal((await post(`/api/automation/enquiries/${id}/note`, { body: 'x' })).status, 401);
  assert.equal((await post(`/api/automation/enquiries/${id}/note`, { body: 'x' }, { 'x-automation-key': 'b'.repeat(40) })).status, 401);
  assert.equal((await post('/api/automation/enquiries/not-a-uuid/note', { body: 'x' }, { 'x-automation-key': 'a'.repeat(40) })).status, 400);
});
