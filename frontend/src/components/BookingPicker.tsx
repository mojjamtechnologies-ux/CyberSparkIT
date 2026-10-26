import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api, Slot } from '../lib/api';
import { useApi } from '../lib/useApi';
import EnquiryForm from './EnquiryForm';

const LAGOS = 'Africa/Lagos';
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: LAGOS });
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { timeZone: LAGOS, weekday: 'short', day: 'numeric', month: 'short' });
const lagosTime = (iso: string) => new Date(iso).toLocaleTimeString('en-NG', { timeZone: LAGOS, hour: '2-digit', minute: '2-digit' });
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localTime = (iso: string) => new Date(iso).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

export default function BookingPicker() {
  const { data, loading, error, reload } = useApi<Slot[]>('/consultation/slots');
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [f, setF] = useState({ full_name: '', email: '', phone: '', topic: '', consent: false, website: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState<{ ref: string; at: string } | null>(null);

  const days = useMemo(() => {
    const m = new Map<string, Slot[]>();
    (data ?? []).forEach((s) => { const k = dayKey(s.starts_at); m.set(k, [...(m.get(k) ?? []), s]); });
    return [...m.entries()];
  }, [data]);

  if (loading) return <p className="status" role="status">Loading available times…</p>;
  if (error || !days.length) {
    return (
      <div>
        <p className="status">{error ? 'We could not load available times.' : 'No online booking times are open right now.'} Send a request and we will propose a time.</p>
        <EnquiryForm variant="consultation" />
      </div>
    );
  }
  if (done) {
    return (
      <div className="success" role="status">
        <h3>Your consultation is booked</h3>
        <p>Reference <strong>{done.ref}</strong>. {new Date(done.at).toLocaleString('en-NG', { timeZone: LAGOS, dateStyle: 'full', timeStyle: 'short' })} (Lagos time).
          {localTz !== LAGOS && <> That is {localTime(done.at)} in your timezone.</>} We will confirm by email when email delivery is active.</p>
      </div>
    );
  }
  const active = days.find(([k]) => k === (day || days[0][0]))!;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!slot) return; setBusy(true); setMsg('');
    try {
      const { data: r } = await api.post('/consultation/book', { slot_id: slot.id, ...f, phone: f.phone || undefined, topic: f.topic || undefined });
      setDone({ ref: r.reference, at: r.starts_at || slot.starts_at });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) { setSlot(null); reload(); }
      setMsg(axios.isAxiosError(err) ? err.response?.data?.error || 'Booking failed. Please try again.' : 'Booking failed.');
    } finally { setBusy(false); }
  };
  return (
    <div className="form">
      <h2>Pick a time</h2>
      <p className="muted">Times are shown in Lagos time (WAT){localTz !== LAGOS && <>; your device timezone is {localTz}</>}.</p>
      <div className="filters" role="group" aria-label="Choose a day">
        {days.map(([k, s]) => <button type="button" key={k} className={`chip ${k === active[0] ? 'on' : ''}`} aria-pressed={k === active[0]} onClick={() => { setDay(k); setSlot(null); }}>{dayLabel(s[0].starts_at)}</button>)}
      </div>
      <div className="filters" role="group" aria-label="Choose a time">
        {active[1].map((s) => <button type="button" key={s.id} className={`chip ${slot?.id === s.id ? 'on' : ''}`} aria-pressed={slot?.id === s.id} onClick={() => setSlot(s)}>{lagosTime(s.starts_at)}</button>)}
      </div>
      {slot && (
        <form className="form" onSubmit={submit}>
          <p><strong>{dayLabel(slot.starts_at)}, {lagosTime(slot.starts_at)} Lagos time</strong> ({slot.duration_min} minutes){localTz !== LAGOS && <> · {localTime(slot.starts_at)} your time</>}</p>
          <div className="row2">
            <label>Full name *<input required minLength={2} autoComplete="name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></label>
            <label>Email *<input required type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          </div>
          <label>Phone number<input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <label>What would you like to discuss?<textarea rows={3} maxLength={1000} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></label>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          <label className="check"><input type="checkbox" required checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            <span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and consent to CyberSpark contacting me about this booking. *</span></label>
          {msg && <p className="err" role="alert">{msg}</p>}
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Booking…' : 'Confirm Booking'}</button>
        </form>
      )}
    </div>
  );
}
