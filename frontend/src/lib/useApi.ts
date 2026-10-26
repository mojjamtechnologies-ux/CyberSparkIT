import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<number | boolean>(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true); setError(false);
    api.get<T>(path).then((r) => setData(r.data)).catch((e) => setError(e?.response?.status || true)).finally(() => setLoading(false));
  }, [path]);
  useEffect(load, [load]);
  return { data, error, loading, reload: load };
}
