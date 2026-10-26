import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Service } from '../lib/api';
import Modal from '../components/Modal';
import { useAuth } from './auth';
import { adminApi, errMsg } from './adminApi';

type Row = Service & { published: boolean };
const BLANK = { slug: '', kind: 'service' as 'service' | 'utility', title: '', summary: '', details: '', features: '', icon: '', sort: 0, published: true };

export default function ServicesAdmin() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState('');
  const [edit, setEdit] = useState<(typeof BLANK & { id?: string }) | null>(null);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => { adminApi.get('/admin/services').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  useEffect(load, [load]);

  const toggle = async (r: Row) => { try { await adminApi.patch(`/admin/services/${r.id}`, { published: !r.published }); load(); } catch (e) { setErr(errMsg(e)); } };
  const remove = async (r: Row) => {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    try { await adminApi.delete(`/admin/services/${r.id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };
  const open = (r?: Row) => { setFormErr(''); setEdit(r ? { id: r.id, slug: r.slug, kind: r.kind, title: r.title, summary: r.summary, details: r.details || '', features: (r.features || []).join('\n'), icon: r.icon || '', sort: r.sort, published: r.published } : { ...BLANK }); };
  const save = async (ev: FormEvent) => {
    ev.preventDefault(); if (!edit) return; setFormErr('');
    const body = { kind: edit.kind, title: edit.title, summary: edit.summary, details: edit.details || undefined, features: edit.features.split('\n').map((x) => x.trim()).filter(Boolean), icon: edit.icon || undefined, sort: Number(edit.sort) || 0, published: edit.published };
    try {
      if (edit.id) await adminApi.patch(`/admin/services/${edit.id}`, body);
      else await adminApi.post('/admin/services', { ...body, slug: edit.slug });
      setEdit(null); load();
    } catch (e) { setFormErr(errMsg(e, 'Could not save')); }
  };
  const set = <K extends keyof typeof BLANK>(k: K, v: (typeof BLANK)[K]) => setEdit((x) => (x ? { ...x, [k]: v } : x));

  return (
    <>
      <div className="toolbar"><h1 style={{ margin: 0 }}>Services &amp; utility apps</h1>
        {isAdmin && <button className="btn btn-primary" onClick={() => open()}><Plus size={16} /> Add listing</button>}</div>
      {!isAdmin && <p className="muted">You have view-only access. Ask an admin to make changes.</p>}
      {err && <p className="err" role="alert">{err}</p>}
      {!rows ? <p>Loading…</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Title</th><th>Type</th><th>Order</th><th>Status</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td>{r.title}<small><br />/{r.slug}</small></td><td>{r.kind === 'utility' ? 'Utility app' : 'Service'}</td><td>{r.sort}</td>
              <td><span className={`pill ${r.published ? 'completed' : 'closed'}`}>{r.published ? 'Published' : 'Hidden'}</span></td>
              {isAdmin && <td className="acts"><button className="btn btn-outline" onClick={() => open(r)}>Edit</button>
                <button className="btn btn-outline" onClick={() => toggle(r)}>{r.published ? 'Unpublish' : 'Publish'}</button>
                <button className="btn btn-outline danger" onClick={() => remove(r)}>Delete</button></td>}</tr>
          ))}</tbody></table></div>
      )}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit listing' : 'Add listing'}>
        {edit && (
          <form className="form" onSubmit={save}>
            <label>Title *<input value={edit.title} onChange={(e) => set('title', e.target.value)} required minLength={2} /></label>
            {!edit.id && <label>Slug * (lowercase-with-dashes, used in the page URL)<input value={edit.slug} onChange={(e) => set('slug', e.target.value)} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>}
            <div className="row2">
              <label>Type<select value={edit.kind} onChange={(e) => set('kind', e.target.value as 'service' | 'utility')}><option value="service">Service</option><option value="utility">Utility app</option></select></label>
              <label>Display order<input type="number" value={edit.sort} onChange={(e) => set('sort', Number(e.target.value))} /></label>
            </div>
            <label>Short summary *<input value={edit.summary} onChange={(e) => set('summary', e.target.value)} required minLength={5} maxLength={300} /></label>
            <label>Details<textarea rows={4} value={edit.details} onChange={(e) => set('details', e.target.value)} /></label>
            <label>Features (one per line)<textarea rows={4} value={edit.features} onChange={(e) => set('features', e.target.value)} /></label>
            <label>Icon name (e.g. store, globe, users)<input value={edit.icon} onChange={(e) => set('icon', e.target.value)} /></label>
            <label className="check"><input type="checkbox" checked={edit.published} onChange={(e) => set('published', e.target.checked)} /><span>Published on the website</span></label>
            {formErr && <p className="err" role="alert">{formErr}</p>}
            <button className="btn btn-primary">Save</button>
          </form>
        )}
      </Modal>
    </>
  );
}
