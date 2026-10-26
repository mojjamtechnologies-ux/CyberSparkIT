import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Code2, Layers, Terminal, Smartphone, Bot, ShieldCheck, Workflow, FileText, MapPin, CalendarDays } from 'lucide-react';
import { usePageMeta } from '../lib/meta';
import { api, Course } from '../lib/api';
import { useApi } from '../lib/useApi';
import Modal from '../components/Modal';
import EnquiryForm from '../components/EnquiryForm';

const CATS = [[Code2, 'Frontend web development'], [Layers, 'Full-stack web development'], [Terminal, 'Python programming'], [Smartphone, 'Mobile application development'], [Bot, 'AI tools and prompt engineering'], [ShieldCheck, 'Cybersecurity fundamentals'], [Workflow, 'Business automation and workflow development'], [FileText, 'Desktop publishing and digital productivity']] as const;
const today = () => new Date().toISOString().slice(0, 10);
const d = (s: string) => new Date(`${s}T00:00:00`).toLocaleDateString('en-NG', { dateStyle: 'medium' });

function RegisterForm({ course }: { course: Course }) {
  const upcoming = course.course_schedules.filter((s) => s.starts_on >= today()).sort((a, b) => a.starts_on.localeCompare(b.starts_on));
  const [f, setF] = useState({ full_name: '', email: '', phone: '', message: '', schedule_id: upcoming[0]?.id ?? '', consent: false, website: '' });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [ref, setRef] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const { data } = await api.post('/training/register', { course_id: course.id, ...f, schedule_id: f.schedule_id || undefined, phone: f.phone || undefined, message: f.message || undefined }); setRef(data.reference); }
    catch (x) { setErr(axios.isAxiosError(x) ? x.response?.data?.error || 'Registration failed.' : 'Registration failed.'); }
    finally { setBusy(false); }
  };
  if (ref) return <div className="success" role="status"><h3>Registration received</h3><p>Reference <strong>{ref}</strong>. We will contact you with the next steps.</p></div>;
  return (
    <form className="form" onSubmit={submit}>
      <div className="row2">
        <label>Full name *<input required minLength={2} autoComplete="name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
        <label>Email *<input required type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      </div>
      <label>Phone number<input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      {upcoming.length > 0 && <label>Schedule<select value={f.schedule_id} onChange={(e) => setF({ ...f, schedule_id: e.target.value })}>{upcoming.map((s) => <option key={s.id} value={s.id}>{d(s.starts_on)}{s.location ? ` · ${s.location}` : ''}</option>)}</select></label>}
      <label>Message<textarea rows={3} maxLength={1000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      <label className="check"><input type="checkbox" required checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /><span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and consent to being contacted about this course. *</span></label>
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Register'}</button>
    </form>
  );
}

export default function Training() {
  usePageMeta('Training', 'Onsite and online technology training and mentorship from CyberSpark IT Solutions.');
  const { data, loading, error, reload } = useApi<Course[]>('/courses');
  const [reg, setReg] = useState<Course | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  const courses = data ?? [];
  return (
    <>
      <section className="page-head"><div className="container"><h1>Technology Training &amp; Mentorship</h1><p>Practical skills, taught onsite or online.</p></div></section>
      <section className="section"><div className="container">
        {loading && <p className="status" role="status">Loading courses…</p>}
        {error && <div className="status" role="alert"><p>We could not load the courses.</p><button className="btn btn-outline" onClick={reload}>Try again</button></div>}
        {courses.length > 0 && <div className="grid g2">{courses.map((c) => {
          const up = c.course_schedules.filter((s) => s.starts_on >= today()).sort((a, b) => a.starts_on.localeCompare(b.starts_on));
          return (
            <article className="card" key={c.id}>
              <p className="tags">{c.category || 'Training'} · {c.mode === 'onsite' ? 'Onsite' : c.mode === 'online' ? 'Online' : 'Onsite & online'}</p>
              <h3>{c.title}</h3><p>{c.description}</p>
              <p><strong>Duration:</strong> {c.duration || 'To be confirmed'} · <strong>Fee:</strong> {c.fee_ngn != null ? `₦${c.fee_ngn.toLocaleString('en-NG')}` : 'Contact us'}</p>
              {c.prerequisites && <p><strong>Prerequisites:</strong> {c.prerequisites}</p>}
              {c.syllabus && <details className="faq"><summary>Syllabus</summary><p style={{ whiteSpace: 'pre-line' }}>{c.syllabus}</p></details>}
              <p><strong>Upcoming schedule:</strong></p>
              {up.length ? <ul className="plain">{up.map((s) => <li key={s.id}><CalendarDays size={14} /> {d(s.starts_on)}{s.ends_on ? ` to ${d(s.ends_on)}` : ''}{s.location && <> · <MapPin size={14} /> {s.location}</>}</li>)}</ul> : <p>No dates announced yet.</p>}
              {c.registration_open ? <button className="btn btn-blue" onClick={() => setReg(c)}>Register</button> : <button className="btn btn-outline" disabled>Registration closed</button>}
            </article>);
        })}</div>}
        <h2 className="h2" style={{ marginTop: '3rem' }}>Training areas</h2>
        <p className="sub">Interested in something not listed above, or in a private group session? Ask us.</p>
        <div className="grid g4">
          {CATS.map(([I, t]) => (
            <article className="card" key={t}><div className="badge"><I size={26} aria-hidden="true" /></div><h3>{t}</h3>
              <button className="btn btn-blue" onClick={() => setAsk(t)}>Ask About This</button></article>
          ))}
        </div>
      </div></section>
      <Modal open={!!reg} onClose={() => setReg(null)} title={reg ? `Register: ${reg.title}` : ''}>{reg && <RegisterForm course={reg} />}</Modal>
      <Modal open={!!ask} onClose={() => setAsk(null)} title={ask ? `Training enquiry: ${ask}` : ''}>
        {ask && <EnquiryForm defaultService="training-mentorship" defaultMessage={`I am interested in training: ${ask}. Please send current schedule, fee, duration and whether it is onsite or online.`} />}
      </Modal>
    </>
  );
}
