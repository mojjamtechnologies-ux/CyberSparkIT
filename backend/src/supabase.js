import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !JWT_SECRET) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or JWT_SECRET. See .env.example');
}
if (JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

export const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
