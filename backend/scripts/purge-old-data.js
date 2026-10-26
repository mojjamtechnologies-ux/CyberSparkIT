// Data retention. Dry run by default:  node scripts/purge-old-data.js
// Delete for real:                     node scripts/purge-old-data.js --apply
// Removes completed/closed enquiries (with their notes, history and quotations), consultation bookings
// and training registrations older than RETENTION_MONTHS (default 24).
import 'dotenv/config';
import { db } from '../src/supabase.js';

const months = Number(process.env.RETENTION_MONTHS || 24);
const apply = process.argv.includes('--apply');
const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - months);
const iso = cutoff.toISOString();
const jobs = [
  ['enquiries', (q) => q.in('status', ['completed', 'closed']).lt('updated_at', iso)],
  ['consultation_bookings', (q) => q.lt('created_at', iso)],
  ['training_registrations', (q) => q.lt('created_at', iso)],
];
console.log(`${apply ? 'DELETING' : 'Dry run:'} records older than ${months} months (before ${iso.slice(0, 10)})`);
for (const [table, filter] of jobs) {
  const { count, error } = apply ? await filter(db.from(table).delete({ count: 'exact' })) : await filter(db.from(table).select('*', { count: 'exact', head: true }));
  console.log(`${table}: ${error ? `error: ${error.message}` : `${count ?? 0} ${apply ? 'deleted' : 'would be deleted'}`}`);
}
