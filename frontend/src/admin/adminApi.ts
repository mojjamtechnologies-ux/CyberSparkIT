import axios from 'axios';
import { api } from '../lib/api';

export const KEY = 'cs_admin';
export type AdminUser = { id: string; email: string; name: string | null; role: 'admin' | 'staff' };
export const STATUSES = ['new', 'contacted', 'consultation_scheduled', 'quotation_sent', 'in_progress', 'completed', 'closed'] as const;
export const STATUS_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', consultation_scheduled: 'Consultation Scheduled', quotation_sent: 'Quotation Sent', in_progress: 'In Progress', completed: 'Completed', closed: 'Closed' };
export type Enquiry = {
  id: string; full_name: string; business_name: string | null; email: string; phone: string | null; service_slug: string | null;
  budget: string | null; timeline: string | null; message: string; contact_method: string; status: string;
  assigned_to: string | null; follow_up_at: string | null; created_at: string;
};
export const fmt = (iso: string) => new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });

export const adminApi = axios.create({ baseURL: api.defaults.baseURL, timeout: 20000 });
adminApi.interceptors.request.use((c) => {
  const s = sessionStorage.getItem(KEY);
  if (s) c.headers.Authorization = `Bearer ${JSON.parse(s).token}`;
  return c;
});
adminApi.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && !String(e.config?.url).endsWith('/admin/login')) {
    sessionStorage.removeItem(KEY);
    window.location.assign('/admin/login');
  }
  return Promise.reject(e);
});
export const errMsg = (e: unknown, fallback = 'Something went wrong') =>
  axios.isAxiosError(e) ? e.response?.data?.error || (e.response ? fallback : 'Cannot reach the server') : fallback;
