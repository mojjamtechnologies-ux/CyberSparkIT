import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { adminApi, Enquiry, errMsg, fmt, STATUSES, STATUS_LABEL } from './adminApi';

export default function Enquiries() {
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Enquiry[]; total: number; page_size: number } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 350); return () => clearTimeout(t); }, [q]);
  useEffect(() => {
    setErr('');
    adminApi.get('/admin/enquiries', { params: { q: dq, status, page } }).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
  }, [dq, status, page]);

  const exportCsv = async () => {
    try {
      const r = await adminApi.get('/admin/enquiries.csv', { params: { q: dq, status }, responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(r.data); a.download = 'enquiries.csv'; a.click(); URL.revokeObjectURL(a.href);
    } catch (e) { setErr(errMsg(e, 'Export failed')); }
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  return (
    <>
      <h1>Enquiries</h1>
      <div className="toolbar">
        <input type="search" placeholder="Search name, email or business" aria-label="Search enquiries" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn btn-outline" onClick={exportCsv}><Download size={16} /> Export CSV</button>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      {!data ? <p>Loading…</p> : data.items.length === 0 ? <p className="status">No enquiries match.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Received</th><th>Name / business</th><th>Contact</th><th>Service</th><th>Status</th></tr></thead>
          <tbody>{data.items.map((e) => (
            <tr key={e.id}><td>{fmt(e.created_at)}</td>
              <td><Link to={`/admin/enquiries/${e.id}`}>{e.full_name}</Link>{e.business_name && <small><br />{e.business_name}</small>}</td>
              <td>{e.email}{e.phone && <small><br />{e.phone}</small>}</td><td>{e.service_slug || '-'}</td>
              <td><span className={`pill ${e.status}`}>{STATUS_LABEL[e.status]}</span></td></tr>
          ))}</tbody></table></div>
      )}
      {data && <div className="pager"><button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pages} ({data.total} total)</span>
        <button className="btn btn-outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>}
    </>
  );
}
