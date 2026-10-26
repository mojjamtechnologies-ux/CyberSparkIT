import { useEffect } from 'react';
import { SITE } from './site';

function setMeta(sel: string, val: string) {
  document.head.querySelector<HTMLMetaElement>(sel)?.setAttribute('content', val);
}
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE.name}` : `${SITE.name} | ${SITE.tagline}`;
    document.title = full;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', full);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', SITE.url + window.location.pathname);
  }, [title, description]);
}
