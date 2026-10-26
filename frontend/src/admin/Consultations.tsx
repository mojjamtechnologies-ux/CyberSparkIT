import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth';
import { adminApi, errMsg } from './adminApi';

type Booking = { id: string; full_name: string; email: string; phone: string | null; topic: string | null; status: string; enquiry_id: string | null };
type Slot = { id: string; starts_at: string; duration_min: number; is_open: boolean; consultation_bookings: Booking[] };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const lagos = (iso: string) => new Date(iso).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Consultations() {
  const isAdmin = useAuth().user?.role === 'admin';
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const [g, setG] = useState({ date_from: '', date_to: '', times: '09:00\n10:00\n11:00\n14:00\n15:00', duration_min: 30, weekdays: [1, 2, 3, 4, 5] });

  const load = useCallback(() => { adminApi.get('/admin/slots').then((r) => setSlots(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  useEffect(load, [load]);

  const generate = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const { data } = await adminApi.post('/admin/slots/generate', { ...g, times: g.times.split('\n').map((t) => t.trim()).filter(Boolean) });
      setMsg(`Created ${data.created} slot(s)${data.skipped ? `, ${data.skipped} already existed` : ''}.`); load();
    } catch (x) { setErr(errMsg(x, 'Could not create slots')); }
  };
  const act = async (fn: () => Promise<unknown>) => { setErr(''); try { await fn(); load(); } catch (x) { setErr(errMsg(x)); } };
  const active = (s: Slot) => s.consultation_bookings.find((b) => b.status === 'booked');

  return (
    <>
      <h1>Consultations</h1>
      <p className="muted">Slot times are entered in Lagos time (WAT). Visitors see them with timezone handling, and a slot can only ever hold one active booking.</p>
      {msg && <p className="ok" role="status">{msg}</p>}{err && <p className="err" role="alert">{err}</p>}
      {isAdmin && (
        <form className="card form" onSubmit={generate}>
          <h2>Create availability</h2>
          <div className="row2">
            <label>From date<input type="date" required value={g.date_from} onChange={(e) => setG({ ...g, date_from: e.target.value })} /></label>
            <label>To date<input type="date" required value={g.date_to} onChange={(e) => setG({ ...g, date_to: e.target.value })} /></label>
          </div>
          <div className="row2">
            <label>Start times, Lagos time (one per line, HH:MM)<textarea rows={5} required value={g.times} onChange={(e) => setG({ ...g, times: e.target.value })} /></label>
            <div className="form">
              <label>Minutes per slot<input type="number" min={10} max={240} value={g.duration_min} onChange={(e) => setG({ ...g, duration_min: Number(e.target.value) })} /></label>
              <fieldset className="days"><legend>Days</legend>{DAYS.map((d, i) => (
                <label className="check" key={d}><input type="checkbox" checked={g.weekdays.includes(i)} onChange={(e) => setG({ ...g, weekdays: e.target.checked ? [...g.weekdays, i] : g.weekdays.filter((x) => x !== i) })} /><span>{d}</span></label>))}</fieldset>
            </div>
          </div>
          <button className="btn btn-blue">Create slots</button>
        </form>
      )}
      <h2 style={{ marginTop: '2rem' }}>Slots &amp; bookings</h2>
      {!slots ? <p>Loading…</p> : slots.length === 0 ? <p className="status">No slots yet.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Lagos time</th><th>Status</th><th>Booked by</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>{slots.map((s) => { const b = active(s); return (
            <tr key={s.id}><td>{lagos(s.starts_at)} ({s.duration_min} min)</td>
              <td><span className={`pill ${b ? 'in_progress' : s.is_open ? 'completed' : 'closed'}`}>{b ? 'Booked' : s.is_open ? 'Open' : 'Closed'}</span></td>
              <td>{b ? <>{b.enquiry_id ? <Link to={`/admin/enquiries/${b.enquiry_id}`}>{b.full_name}</Link> : b.full_name}<small><br />{b.email}{b.phone && ` · ${b.phone}`}{b.topic && <><br />{b.topic}</>}</small></> : '-'}</td>
              {isAdmin && <td className="acts">
                {b ? <button className="btn btn-outline danger" onClick={() => window.confirm('Cancel this booking and free the slot?') && act(() => adminApi.patch(`/admin/bookings/${b.id}/cancel`))}>Cancel booking</button> : <>
                  <button className="btn btn-outline" onClick={() => act(() => adminApi.patch(`/admin/slots/${s.id}`, { is_open: !s.is_open }))}>{s.is_open ? 'Close' : 'Open'}</button>
                  <button className="btn btn-outline danger" onClick={() => window.confirm('Delete this slot?') && act(() => adminApi.delete(`/admin/slots/${s.id}`))}>Delete</button></>}
              </td>}</tr>); })}</tbody></table></div>
      )}
    </>
  );
}
