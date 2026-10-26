import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from './auth';
import { adminApi, errMsg } from './adminApi';

export type Field = { name: string; label: string; type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'lines' | 'date'; options?: [string, string][]; required?: boolean; createOnly?: boolean; help?: string };
export type Col = { h: string; cell: (r: any) => ReactNode };
type Props = { title: string; endpoint: string; fields: Field[]; cols: Col[]; blank: Record<string, any>; toggleKey?: string; note?: string };
type Form = Record<string, any>;

const toForm = (row: Form, fields: Field[]): Form => Object.fromEntries(fields.map((f) => {
  const v = row[f.name];
  return [f.name, f.type === 'lines' ? (v || []).join('\n') : f.type === 'checkbox' ? !!v : v ?? ''];
}));
const toPayload = (form: Form, fields: Field[], creating: boolean) => Object.fromEntries(fields.filter((f) => creating || !f.createOnly).map((f) => {
  const v = form[f.name];
  if (f.type === 'lines') return [f.name, String(v).split('\n').map((x) => x.trim()).filter(Boolean)];
  if (f.type === 'number') return [f.name, v === '' || v === null ? null : Number(v)];
  if (f.type === 'date') return [f.name, v || null];
  return [f.name, v];
}));

export default function ResourceManager({ title, endpoint, fields, cols, blank, toggleKey, note }: Props) {
  const isAdmin = useAuth().user?.role === 'admin';
  const [rows, setRows] = useState<Form[] | null>(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formErr, setFormErr] = useState('');

  const load = useCallback(() => { adminApi.get(endpoint).then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e))); }, [endpoint]);
  useEffect(load, [load]);

  const open = (row?: Form) => { setFormErr(''); setEditId(row ? row.id : null); setForm(row ? toForm(row, fields) : { ...blank }); };
  const save = async (ev: FormEvent) => {
    ev.preventDefault(); if (!form) return; setFormErr('');
    try {
      const body = toPayload(form, fields, !editId);
      if (editId) await adminApi.patch(`${endpoint}/${editId}`, body); else await adminApi.post(endpoint, body);
      setForm(null); load();
    } catch (e) { setFormErr(errMsg(e, 'Could not save')); }
  };
  const toggle = async (r: Form) => { try { await adminApi.patch(`${endpoint}/${r.id}`, { [toggleKey!]: !r[toggleKey!] }); load(); } catch (e) { setErr(errMsg(e)); } };
  const remove = async (r: Form) => { if (!window.confirm('Delete this item? This cannot be undone.')) return; try { await adminApi.delete(`${endpoint}/${r.id}`); load(); } catch (e) { setErr(errMsg(e)); } };
  const set = (k: string, v: any) => setForm((x) => (x ? { ...x, [k]: v } : x));

  return (
    <>
      <div className="toolbar"><h1 style={{ margin: 0 }}>{title}</h1>{isAdmin && <button className="btn btn-primary" onClick={() => open()}><Plus size={16} /> Add</button>}</div>
      {note && <p className="muted">{note}</p>}
      {!isAdmin && <p className="muted">You have view-only access. Ask an admin to make changes.</p>}
      {err && <p className="err" role="alert">{err}</p>}
      {!rows ? <p>Loading…</p> : rows.length === 0 ? <p className="status">Nothing here yet.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr>{cols.map((c) => <th key={c.h}>{c.h}</th>)}{toggleKey && <th>Visible</th>}{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}>{cols.map((c) => <td key={c.h}>{c.cell(r)}</td>)}
              {toggleKey && <td><span className={`pill ${r[toggleKey] ? 'completed' : 'closed'}`}>{r[toggleKey] ? 'Yes' : 'No'}</span></td>}
              {isAdmin && <td className="acts"><button className="btn btn-outline" onClick={() => open(r)}>Edit</button>
                {toggleKey && <button className="btn btn-outline" onClick={() => toggle(r)}>{r[toggleKey] ? 'Hide' : 'Show'}</button>}
                <button className="btn btn-outline danger" onClick={() => remove(r)}>Delete</button></td>}</tr>
          ))}</tbody></table></div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title={editId ? `Edit: ${title}` : `Add: ${title}`}>
        {form && (
          <form className="form" onSubmit={save}>
            {fields.filter((f) => !(editId && f.createOnly)).map((f) => (
              f.type === 'checkbox' ? <label className="check" key={f.name}><input type="checkbox" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} /><span>{f.label}</span></label> :
              <label key={f.name}>{f.label}{f.required && ' *'}
                {f.type === 'textarea' || f.type === 'lines' ? <textarea rows={f.type === 'lines' ? 4 : 5} required={f.required} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} /> :
                  f.type === 'select' ? <select required={f.required} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)}>{!f.required && <option value="">None</option>}{(f.options || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select> :
                  <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} required={f.required} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} />}
                {f.help && <small className="muted">{f.help}</small>}
              </label>
            ))}
            {formErr && <p className="err" role="alert">{formErr}</p>}
            <button className="btn btn-primary">Save</button>
          </form>
        )}
      </Modal>
    </>
  );
}
