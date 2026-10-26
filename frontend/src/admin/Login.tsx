import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from './auth';
import { errMsg } from './adminApi';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await login(email.trim(), password); nav('/admin', { replace: true }); }
    catch (err) { setError(errMsg(err, 'Login failed')); }
    finally { setBusy(false); }
  };
  return (
    <div className="adm login-wrap">
      <form className="card form login" onSubmit={submit}>
        <Logo />
        <h1>Admin sign in</h1>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
