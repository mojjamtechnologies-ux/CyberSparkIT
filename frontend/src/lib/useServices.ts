import { useCallback, useEffect, useState } from 'react';
import { api, Service } from './api';

let cache: Service[] | null = null;
export function useServices() {
  const [data, setData] = useState<Service[] | null>(cache);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setError(false);
    api.get<Service[]>('/services').then((r) => { cache = r.data; setData(r.data); }).catch(() => setError(true));
  }, []);
  useEffect(() => { if (!cache) load(); }, [load]);
  return {
    services: data?.filter((s) => s.kind === 'service') ?? [],
    utilities: data?.filter((s) => s.kind === 'utility') ?? [],
    all: data ?? [], loading: !data && !error, error, retry: load,
  };
}
