import { useEffect, useState } from 'react';
import { api } from './api';
import { SITE } from './site';

export type Contact = { phones: string[]; email: string; address: string };
export type SiteInfo = { contact: Contact; stats: { value: string; label: string }[]; announcement: { message: string; link_url: string | null } | null };
const DEFAULT: SiteInfo = { contact: { phones: SITE.phones.map((p) => p.display), email: SITE.email, address: SITE.address }, stats: [], announcement: null };
let cache: SiteInfo | null = null;

export const telOf = (p: string) => (p.trim().startsWith('+') ? p.replace(/[\s-]/g, '') : `+234${p.replace(/[\s-]/g, '').replace(/^0/, '')}`);

export function useSite(): SiteInfo {
  const [s, setS] = useState<SiteInfo>(cache ?? DEFAULT);
  useEffect(() => {
    if (cache) return;
    api.get('/site').then((r) => { cache = { contact: r.data.contact ?? DEFAULT.contact, stats: r.data.stats ?? [], announcement: r.data.announcement ?? null }; setS(cache); }).catch(() => undefined);
  }, []);
  return s;
}
