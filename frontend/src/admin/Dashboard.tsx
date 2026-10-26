import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, errMsg, fmt, STATUS_LABEL } from './adminApi';

type Stats = { total_enquiries: number; new_enquiries: number; active_projects: number; published_services: number; published_projects: number; course_registrations: number; upcoming_consultations: number; followups: { id: string; full_name: string; follow_up_at: string; status: string }[]; recent: { id: string; full_name: string; service_slug: string | null; status: string; created_at: string }[] };

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { adminApi.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <p className="err" role="alert">{err}</p>;
  if (!s) return <p>Loading…</p>;
  const cards: [string, number][] = [['Total enquiries', s.total_enquiries], ['New enquiries', s.new_enquiries], ['Active projects (in progress)', s.active_projects], ['Published services', s.published_services], ['Upcoming consultations', s.upcoming_consultations], ['Published projects', s.published_projects], ['Course registrations', s.course_registrations]];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid g4">{cards.map(([l, v]) => <div className="card stat" key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>
      {s.followups.length > 0 && (<>
        <h2 style={{ marginTop: '2rem' }}>Follow-ups due</h2>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Due</th><th>Name</th><th>Status</th></tr></thead>
          <tbody>{s.followups.map((f) => (
            <tr key={f.id}><td>{fmt(f.follow_up_at)}{new Date(f.follow_up_at) < new Date() && <span className="pill new" style={{ marginLeft: '.5rem' }}>Overdue</span>}</td><td><Link to={`/admin/enquiries/${f.id}`}>{f.full_name}</Link></td><td><span className={`pill ${f.status}`}>{STATUS_LABEL[f.status]}</span></td></tr>))}</tbody></table></div>
      </>)}
      <h2 style={{ marginTop: '2rem' }}>Recent enquiries</h2>
      {s.recent.length === 0 ? <p className="status">No enquiries yet.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Received</th><th>Name</th><th>Service</th><th>Status</th></tr></thead>
          <tbody>{s.recent.map((r) => (
            <tr key={r.id}><td>{fmt(r.created_at)}</td><td><Link to={`/admin/enquiries/${r.id}`}>{r.full_name}</Link></td><td>{r.service_slug || '-'}</td><td><span className={`pill ${r.status}`}>{STATUS_LABEL[r.status]}</span></td></tr>
          ))}</tbody></table></div>
      )}
      
    </>
  );
}
