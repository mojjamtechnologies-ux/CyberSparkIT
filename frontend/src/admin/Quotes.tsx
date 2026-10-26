import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { adminApi, errMsg, fmt } from './adminApi';

type Item = { description: string; qty: number; unit_price: number };
type Quote = { id: string; number: string; status: string; items: Item[]; total: number; notes: string | null; valid_until: string | null; sent_at: string | null; created_at: string };
const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function printQuote(q: Quote) {
  const { data } = await adminApi.get(`/admin/quotations/${q.id}/text`);
  const e = data.enquiry;
  const rows = q.items.map((i, n) => `<tr><td>${n + 1}</td><td>${esc(i.description)}</td><td class=r>${i.qty}</td><td class=r>${naira(i.unit_price)}</td><td class=r>${naira(i.qty * i.unit_price)}</td></tr>`).join('');
  const html = `<!doctype html><meta charset=utf-8><title>${esc(q.number)}</title><style>body{font:14px Poppins,Arial,sans-serif;color:#1E293B;max-width:760px;margin:2rem auto;padding:0 1rem}h1{color:#0645B8;margin:0}.bar{border-bottom:4px solid #FFB800;padding-bottom:.6rem;margin-bottom:1.2rem}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border-bottom:1px solid #DCE3F0;padding:.5rem;text-align:left}th{background:#F5F7FB}.r{text-align:right}.t{font-size:1.2rem;font-weight:700;text-align:right}small{color:#475569}</style><body onload="print()"><div class=bar><h1>CyberSpark IT Solutions</h1><small>Empowering Small Businesses With Smart Tech<br>09057315511 / 08020600641 · cybersparkit@gmail.com</small></div><h2>Quotation ${esc(q.number)}</h2><p>Prepared for: <strong>${esc(e.full_name)}</strong>${e.business_name ? `, ${esc(e.business_name)}` : ''}<br>Date: ${new Date(q.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}${q.valid_until ? `<br>Valid until: ${esc(q.valid_until)}` : ''}</p><table><tr><th>#</th><th>Description</th><th class=r>Qty</th><th class=r>Unit price</th><th class=r>Amount</th></tr>${rows}</table><p class=t>Total: ${naira(q.total)}</p>${q.notes ? `<p><strong>Notes</strong><br>${esc(q.notes).replace(/\n/g, '<br>')}</p>` : ''}`;
  window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
}

export default function Quotes({ enquiryId, onChange }: { enquiryId: string; onChange: () => void }) {
  const isAdmin = useAuth().user?.role === 'admin';
  const [list, setList] = useState<Quote[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [notes, setNotes] = useState(''); const [valid, setValid] = useState('');
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const load = useCallback(() => { adminApi.get('/admin/quotations', { params: { enquiry_id: enquiryId } }).then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))); }, [enquiryId]);
  useEffect(load, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setMsg('');
    try { await adminApi.post('/admin/quotations', { enquiry_id: enquiryId, items, notes, valid_until: valid || null }); setItems(null); setNotes(''); setValid(''); load(); }
    catch (x) { setErr(errMsg(x, 'Could not create quotation')); }
  };
  const run = async (fn: () => Promise<{ data?: any } | void>, ok: string) => {
    setErr(''); setMsg('');
    try { await fn(); setMsg(ok); load(); onChange(); } catch (x: any) { setErr(errMsg(x)); }
  };
  const setItem = (i: number, k: keyof Item, v: string) => setItems((p) => p!.map((it, n) => (n === i ? { ...it, [k]: k === 'description' ? v : Number(v) } : it)));
  const sum = (items || []).reduce((s, i) => s + (i.qty || 0) * (i.unit_price || 0), 0);

  return (
    <div className="card" style={{ marginTop: '1.2rem' }}>
      <div className="toolbar"><h2 style={{ margin: 0 }}>Quotations</h2>
        {isAdmin && !items && <button className="btn btn-primary" onClick={() => setItems([{ description: '', qty: 1, unit_price: 0 }])}>New quotation</button>}</div>
      {msg && <p className="ok" role="status">{msg}</p>}{err && <p className="err" role="alert">{err}</p>}
      {items && (
        <form className="form quote-form" onSubmit={create}>
          {items.map((it, i) => (
            <div className="qrow" key={i}>
              <input aria-label="Description" placeholder="Description" required value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
              <input aria-label="Quantity" type="number" min="0.01" step="any" required value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value)} />
              <input aria-label="Unit price in naira" type="number" min="0" step="any" required value={it.unit_price} onChange={(e) => setItem(i, 'unit_price', e.target.value)} />
              <button type="button" className="btn btn-outline" onClick={() => setItems(items.length > 1 ? items.filter((_, n) => n !== i) : items)} aria-label="Remove line">×</button>
            </div>))}
          <button type="button" className="btn btn-outline" onClick={() => setItems([...items, { description: '', qty: 1, unit_price: 0 }])}>Add line</button>
          <p><strong>Total: {naira(sum)}</strong></p>
          <div className="row2"><label>Valid until<input type="date" value={valid} onChange={(e) => setValid(e.target.value)} /></label>
            <label>Notes (terms, delivery, payment plan)<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label></div>
          <div className="acts"><button className="btn btn-primary">Save draft</button> <button type="button" className="btn btn-outline" onClick={() => setItems(null)}>Cancel</button></div>
        </form>
      )}
      {list.length === 0 && !items && <p className="muted">No quotations for this enquiry yet.</p>}
      {list.map((q) => (
        <div className="quote" key={q.id}>
          <div className="toolbar"><strong>{q.number}</strong><span className={`pill ${q.status === 'draft' ? 'new' : q.status === 'sent' ? 'quotation_sent' : q.status === 'accepted' ? 'completed' : 'closed'}`}>{q.status}</span><strong>{naira(q.total)}</strong></div>
          <ul className="plain">{q.items.map((i, n) => <li key={n}>{i.description}: {i.qty} × {naira(i.unit_price)}</li>)}</ul>
          {q.sent_at && <small className="muted">Sent {fmt(q.sent_at)}</small>}
          <div className="acts">
            <button className="btn btn-outline" onClick={() => printQuote(q).catch((x) => setErr(errMsg(x)))}>Print / PDF</button>
            {isAdmin && q.status === 'draft' && <>
              <button className="btn btn-blue" onClick={() => run(() => adminApi.post(`/admin/quotations/${q.id}/send`, {}), 'Quotation emailed to the customer.')}>Email to customer</button>
              <button className="btn btn-outline" onClick={() => window.confirm('Mark as sent without emailing? Use this after sending it yourself.') && run(() => adminApi.post(`/admin/quotations/${q.id}/send`, { manual: true }), 'Marked as sent.')}>Mark as sent</button>
              <button className="btn btn-outline danger" onClick={() => window.confirm('Delete this draft?') && run(() => adminApi.delete(`/admin/quotations/${q.id}`), 'Draft deleted.')}>Delete</button></>}
            {isAdmin && q.status === 'sent' && <>
              <button className="btn btn-outline" onClick={() => run(() => adminApi.patch(`/admin/quotations/${q.id}`, { status: 'accepted' }), 'Marked accepted.')}>Accepted</button>
              <button className="btn btn-outline" onClick={() => run(() => adminApi.patch(`/admin/quotations/${q.id}`, { status: 'declined' }), 'Marked declined.')}>Declined</button></>}
          </div>
        </div>))}
    </div>
  );
}
