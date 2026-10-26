import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { api } from '../lib/api';
import { useServices } from '../lib/useServices';
import { SITE } from '../lib/site';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name'),
  business_name: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,19}$/, 'Enter a valid phone number').or(z.literal('')),
  service_slug: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().trim().optional(),
  contact_method: z.enum(['email', 'phone', 'whatsapp']),
  consent: z.boolean().refine((v) => v, 'Please agree to the privacy policy to continue'),
  website: z.string().optional(), // honeypot
  current_workflow: z.string().optional(),
  challenges: z.string().optional(),
  desired_outcome: z.string().optional(),
});
type Values = z.infer<typeof schema>;
type Props = { variant?: 'general' | 'automation' | 'consultation'; defaultService?: string; defaultMessage?: string };

const BUDGETS = ['Under ₦100,000', '₦100,000 – ₦300,000', '₦300,000 – ₦700,000', '₦700,000 – ₦1,500,000', 'Above ₦1,500,000', 'Not sure yet'];
const TIMELINES = ['As soon as possible', 'Within 1 month', '1 – 3 months', 'Flexible'];

export default function EnquiryForm({ variant = 'general', defaultService = '', defaultMessage = '' }: Props) {
  const { services, utilities } = useServices();
  const [done, setDone] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { contact_method: 'email', consent: false, service_slug: defaultService, message: defaultMessage, phone: '' },
  });

  const submit = handleSubmit(async (v) => {
    setServerError('');
    let message = (v.message || '').trim();
    if (variant === 'automation') {
      const need: [keyof Values, string][] = [['current_workflow', 'Describe your current workflow'], ['challenges', 'Tell us the main challenges'], ['desired_outcome', 'Tell us the outcome you want']];
      let bad = false;
      need.forEach(([k, m]) => { if (!String(v[k] || '').trim()) { setError(k, { message: m }); bad = true; } });
      if (bad) return;
      message = `Current workflow: ${v.current_workflow}\n\nChallenges: ${v.challenges}\n\nDesired outcome: ${v.desired_outcome}`;
    }
    if (message.length < 10) return setError('message', { message: 'Please tell us a little more (at least 10 characters)' });
    if (v.contact_method !== 'email' && !v.phone) return setError('phone', { message: 'Add a phone number for this contact method' });
    try {
      const { data } = await api.post('/enquiries', {
        full_name: v.full_name, business_name: v.business_name, email: v.email, phone: v.phone,
        service_slug: v.service_slug, budget: v.budget, timeline: v.timeline, message,
        contact_method: v.contact_method, consent: v.consent, website: v.website,
      });
      setDone(data.reference || 'RECEIVED');
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const fields = e.response.data?.fields as Record<string, string[]> | undefined;
        if (fields) Object.entries(fields).forEach(([k, m]) => setError(k as keyof Values, { message: m[0] }));
        setServerError(e.response.data?.error || 'Something went wrong. Please try again.');
      } else {
        setServerError(`We could not reach the server. Please check your connection or call ${SITE.phones[0].display}.`);
      }
    }
  });

  if (done) {
    return (
      <div className="success" role="status">
        <h3>Thank you. We have your request.</h3>
        <p>Reference: <strong>{done}</strong>. A member of the CyberSpark team will contact you by your preferred method.</p>
      </div>
    );
  }
  const err = (k: keyof Values) => errors[k] && <p className="err" id={`${k}-e`} role="alert">{errors[k]?.message as string}</p>;
  const a = (k: keyof Values) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${k}-e` : undefined });

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="row2">
        <label>Full name *<input autoComplete="name" {...a('full_name')} {...register('full_name')} />{err('full_name')}</label>
        <label>Business name<input autoComplete="organization" {...register('business_name')} /></label>
      </div>
      <div className="row2">
        <label>Email *<input type="email" autoComplete="email" {...a('email')} {...register('email')} />{err('email')}</label>
        <label>Phone number<input type="tel" autoComplete="tel" {...a('phone')} {...register('phone')} />{err('phone')}</label>
      </div>
      <label>Service required
        <select {...register('service_slug')}>
          <option value="">Not sure yet</option>
          {utilities.length > 0 && <optgroup label="Business utility apps">{utilities.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}</optgroup>}
          {services.length > 0 && <optgroup label="Services">{services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}</optgroup>}
        </select>
      </label>
      <div className="row2">
        <label>Estimated budget<select {...register('budget')}><option value="">Prefer to discuss</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select></label>
        <label>Desired timeline<select {...register('timeline')}><option value="">Flexible</option>{TIMELINES.map((b) => <option key={b}>{b}</option>)}</select></label>
      </div>
      {variant === 'automation' ? (
        <>
          <label>Your current workflow *<textarea rows={3} {...a('current_workflow')} {...register('current_workflow')} />{err('current_workflow')}</label>
          <label>Main challenges *<textarea rows={3} {...a('challenges')} {...register('challenges')} />{err('challenges')}</label>
          <label>Outcome you want *<textarea rows={3} {...a('desired_outcome')} {...register('desired_outcome')} />{err('desired_outcome')}</label>
        </>
      ) : (
        <label>{variant === 'consultation' ? 'What would you like to discuss, and when suits you? *' : 'Project description *'}
          <textarea rows={4} {...a('message')} {...register('message')} />{err('message')}
        </label>
      )}
      <label>Preferred contact method
        <select {...register('contact_method')}><option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option></select>
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" {...register('website')} />
      <label className="check"><input type="checkbox" {...a('consent')} {...register('consent')} />
        <span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and consent to CyberSpark contacting me about this request. *</span></label>
      {err('consent')}
      {serverError && <p className="err" role="alert">{serverError}</p>}
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : variant === 'consultation' ? 'Request Consultation' : 'Send Request'}</button>
    </form>
  );
}
