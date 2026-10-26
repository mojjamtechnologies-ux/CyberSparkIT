import { createContext, ReactNode, useContext, useState } from 'react';
import { adminApi, AdminUser, KEY } from './adminApi';

type Ctx = { user: AdminUser | null; login: (email: string, password: string) => Promise<void>; logout: () => void };
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null')?.user ?? null; } catch { return null; }
  });
  const login = async (email: string, password: string) => {
    const { data } = await adminApi.post('/admin/login', { email, password });
    sessionStorage.setItem(KEY, JSON.stringify(data));
    setUser(data.user);
  };
  const logout = () => { sessionStorage.removeItem(KEY); setUser(null); };
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
