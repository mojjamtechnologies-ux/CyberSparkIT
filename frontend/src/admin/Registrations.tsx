import { useEffect, useState } from 'react';
import { adminApi, errMsg, fmt } from './adminApi';

export default function Registrations() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { adminApi.get('/admin/registrations').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  return (
    <>
      <h1>Training registrations</h1>
      {err && <p className="err" role="alert">{err}</p>}
      {!rows ? <p>Loading…</p> : rows.length === 0 ? <p className="status">No registrations yet.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Course</th><th>Start date</th><th>Message</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td>{fmt(r.created_at)}</td><td>{r.full_name}</td><td>{r.email}{r.phone && <small><br />{r.phone}</small>}</td>
              <td>{r.courses?.title || '-'}</td><td>{r.course_schedules?.starts_on || '-'}</td><td>{r.message || '-'}</td></tr>
          ))}</tbody></table></div>
      )}
    </>
  );
}
