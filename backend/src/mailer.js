import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, NOTIFY_EMAIL } = process.env;
const transport = SMTP_HOST
  ? nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 587, auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined })
  : null;

export const mailConfigured = Boolean(transport);
export async function sendMail(to, subject, text) {
  if (!transport) throw new Error('Email is not configured');
  await transport.sendMail({ from: MAIL_FROM, to, subject, text });
}
const SIGN = '\n\nCyberSpark IT Solutions\nEmpowering Small Businesses With Smart Tech\n09057315511 / 08020600641';
export const lagosTime = (iso) => `${new Date(iso).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' })} (Lagos time, WAT)`;

// Fire-and-forget: email problems must never break a saved record.
function fire(jobs) {
  Promise.allSettled(jobs.map(([to, s, t]) => (mailConfigured && to ? sendMail(to, s, t) : Promise.reject(new Error(`mail skipped (SMTP not configured): ${s}`)))))
    .then((r) => r.forEach((x) => x.status === 'rejected' && console.log(x.reason?.message)));
}

export function notifyNewEnquiry(e) {
  fire([
    [NOTIFY_EMAIL, `New enquiry: ${e.full_name}`, `New enquiry from ${e.full_name}${e.business_name ? ` (${e.business_name})` : ''}\n\nEmail: ${e.email}\nPhone: ${e.phone || '-'}\nService: ${e.service_slug || '-'}\nBudget: ${e.budget || '-'}\nTimeline: ${e.timeline || '-'}\nPrefers: ${e.contact_method}\n\n${e.message}`],
    [e.email, 'We received your enquiry - CyberSpark IT Solutions', `Hello ${e.full_name},\n\nThank you for contacting CyberSpark IT Solutions. We have received your enquiry and a member of our team will be in touch.${SIGN}`],
  ]);
}
export function notifyBooking(b, slot) {
  const when = lagosTime(slot.starts_at);
  fire([
    [NOTIFY_EMAIL, `Consultation booked: ${b.full_name}`, `${b.full_name} (${b.email}, ${b.phone || 'no phone'}) booked a consultation for ${when}.\n\nTopic: ${b.topic || '-'}`],
    [b.email, 'Your consultation is confirmed - CyberSpark IT Solutions', `Hello ${b.full_name},\n\nYour free consultation is confirmed for:\n${when}\n\nIf you need to change the time, reply to this email or call us.${SIGN}`],
  ]);
}
export function notifyRegistration(reg, course) {
  fire([
    [NOTIFY_EMAIL, `Training registration: ${reg.full_name}`, `${reg.full_name} (${reg.email}, ${reg.phone || 'no phone'}) registered for "${course.title}".\n\n${reg.message || ''}`],
    [reg.email, `Registration received: ${course.title}`, `Hello ${reg.full_name},\n\nWe have received your registration for "${course.title}". We will contact you with the next steps.${SIGN}`],
  ]);
}
