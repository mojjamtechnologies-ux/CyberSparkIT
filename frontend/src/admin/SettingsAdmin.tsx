import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { adminApi, errMsg } from './adminApi';

export default function SettingsAdmin() {
  const isAdmin = useAuth().user?.role === 'admin';
  const [phones, setPhones] = useState(''); const [email, setEmail] = useState(''); const [address, setAddress] = useState('');
  const [stats, setStats] = useState('');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => {
    adminApi.get('/admin/settings').then((r) => {
      const c = r.data.contact; if (c) { setPhones(c.phones.join('\n')); setEmail(c.email); setAddress(c.address); }
      setStats((r.data.stats || []).map((s: { value: string; label: string }) => `${s.value} | ${s.label}`).join('\n'));
    }).catch((e) => setErr(errMsg(e)));
  }, []);
  const put = async (key: string, body: unknown) => {
    setMsg(''); setErr('');
    try { await adminApi.put(`/admin/settings/${key}`, body); setMsg('Saved. The website updates within a minute.'); } catch (e) { setErr(errMsg(e, 'Could not save')); }
  };
  const saveContact = (e: FormEvent) => { e.preventDefault(); put('contact', { phones: phones.split('\n').map((x) => x.trim()).filter(Boolean), email, address }); };
  const saveStats = (e: FormEvent) => {
    e.preventDefault();
    put('stats', stats.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [value, ...rest] = l.split('|'); return { value: value.trim(), label: rest.join('|').trim() }; }));
  };
  return (
    <>
      <h1>Site settings</h1>
      {msg && <p className="ok" role="status">{msg}</p>}{err && <p className="err" role="alert">{err}</p>}
      {!isAdmin && <p className="muted">You have view-only access.</p>}
      <div className="split">
        <form className="card form" onSubmit={saveContact}>
          <h2>Contact information</h2>
          <label>Phone numbers (one per line)<textarea rows={3} value={phones} onChange={(e) => setPhones(e.target.value)} disabled={!isAdmin} /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isAdmin} /></label>
          <label>Address<textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isAdmin} /></label>
          {isAdmin && <button className="btn btn-blue">Save contact details</button>}
        </form>
        <form className="card form" onSubmit={saveStats}>
          <h2>Trust indicators</h2>
          <p className="muted">One per line as <code>value | label</code>, for example <code>25+ | Projects completed</code>. Only enter figures you can verify. Leave empty to hide the section.</p>
          <label>Statistics<textarea rows={6} value={stats} onChange={(e) => setStats(e.target.value)} disabled={!isAdmin} /></label>
          {isAdmin && <button className="btn btn-blue">Save statistics</button>}
        </form>
      </div>
    </>
  );
}
