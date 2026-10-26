// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-password' ADMIN_NAME='Your Name' npm run create-admin
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/supabase.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 characters).');
  process.exit(1);
}
const { error } = await db.from('admin_users').upsert(
  { email: ADMIN_EMAIL.toLowerCase(), name: ADMIN_NAME || 'Admin', role: 'admin', password_hash: await bcrypt.hash(ADMIN_PASSWORD, 12) },
  { onConflict: 'email' },
);
if (error) { console.error(error.message); process.exit(1); }
console.log(`Admin ready: ${ADMIN_EMAIL}`);
