import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Quotes from './Quotes';
import { adminApi, AdminUser, Enquiry, errMsg, fmt, STATUSES, STATUS_LABEL } from './adminApi';

type Note = { id: string; body: string; author_id: string | null; created_at: string };
type Hist = { id: string; from_status: string | null; to_status: string; changed_by: string | null; created_at: string };
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

export default function EnquiryDetail() {
  const { id } = useParams();
  const [d, setD] = useState<{ enquiry: Enquiry; notes: Note[]; history: Hist[] } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [follow, setFollow] = useState('');
  const [saved, setSaved] = useState('');

  const load = useCallback(() => {
    adminApi.get(`/admin/enquiries/${id}`).then((r) => { setD(r.data); setFollow(toLocal(r.data.enquiry.follow_up_at)); }).catch((e) => setErr(errMsg(e)));
  }, [id]);
  useEffect(() => { load(); adminApi.get('/admin/users').then((r) => setUsers(r.data)).catch(() => undefined); }, [load]);

  const patch = async (body: object, msg: string) => {
    setErr(''); setSaved('');
    try { await adminApi.patch(`/admin/enquiries/${id}`, body); setSaved(msg); load(); } catch (e) { setErr(errMsg(e, 'Update failed')); }
  };
  const addNote = async (ev: FormEvent) => {
    ev.preventDefault(); if (!note.trim()) return;
    try { await adminApi.post(`/admin/enquiries/${id}/notes`, { body: note }); setNote(''); load(); } catch (e) { setErr(errMsg(e)); }
  };
  if (err && !d) return <p className="err" role="alert">{err}</p>;
  if (!d) return <p>Loading…</p>;
  const e = d.enquiry;
  const who = (uid: string | null) => users.find((u) => u.id === uid)?.name || users.find((u) => u.id === uid)?.email || 'Unknown';
  return (
    <>
      <p><Link to="/admin/enquiries">← All enquiries</Link></p>
      <h1>{e.full_name}{e.business_name && <small> · {e.business_name}</small>}</h1>
      {err && <p className="err" role="alert">{err}</p>}{saved && <p className="ok" role="status">{saved}</p>}
      <div className="split">
        <div className="card">
          <h2>Details</h2>
          <dl className="dl">
            <dt>Received</dt><dd>{fmt(e.created_at)}</dd>
            <dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd>
            <dt>Phone</dt><dd>{e.phone ? <a href={`tel:${e.phone}`}>{e.phone}</a> : '-'}</dd>
            <dt>Prefers</dt><dd>{e.contact_method}</dd>
            <dt>Service</dt><dd>{e.service_slug || '-'}</dd>
            <dt>Budget</dt><dd>{e.budget || '-'}</dd>
            <dt>Timeline</dt><dd>{e.timeline || '-'}</dd>
          </dl>
          <h3>Message</h3><p className="msg">{e.message}</p>
        </div>
        <div className="card form">
          <h2>Manage</h2>
          <label>Status
            <select value={e.status} onChange={(ev) => patch({ status: ev.target.value }, 'Status updated')}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
          <label>Assigned to
            <select value={e.assigned_to || ''} onChange={(ev) => patch({ assigned_to: ev.target.value || null }, 'Assignment updated')}>
              <option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}</select></label>
          <label>Follow-up date
            <input type="datetime-local" value={follow} onChange={(ev) => setFollow(ev.target.value)} /></label>
          <button className="btn btn-blue" onClick={() => patch({ follow_up_at: follow ? new Date(follow).toISOString() : null }, 'Follow-up saved')}>Save follow-up</button>
        </div>
      </div>
      <div className="split" style={{ marginTop: '1.2rem' }}>
        <div className="card">
          <h2>Internal notes</h2>
          <form className="form" onSubmit={addNote}><textarea rows={3} aria-label="New note" value={note} onChange={(ev) => setNote(ev.target.value)} maxLength={2000} />
            <button className="btn btn-blue">Add note</button></form>
          <ul className="log">{[...d.notes].reverse().map((n) => <li key={n.id}><small>{fmt(n.created_at)} · {who(n.author_id)}</small><p>{n.body}</p></li>)}</ul>
          {d.notes.length === 0 && <p className="muted">No notes yet.</p>}
        </div>
        <div className="card">
          <h2>Status history</h2>
          <ul className="log">{[...d.history].reverse().map((h) => <li key={h.id}><small>{fmt(h.created_at)} · {who(h.changed_by)}</small><p>{h.from_status ? STATUS_LABEL[h.from_status] : 'New'} → {STATUS_LABEL[h.to_status]}</p></li>)}</ul>
          {d.history.length === 0 && <p className="muted">No status changes yet.</p>}
        </div>
      </div>
      <Quotes enquiryId={e.id} onChange={load} />
    </>
  );
}
