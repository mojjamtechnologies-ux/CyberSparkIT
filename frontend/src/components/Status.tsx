import { SITE } from '../lib/site';
export function Status({ loading, error, retry }: { loading: boolean; error: boolean; retry: () => void }) {
  if (loading) return <p className="status" role="status">Loading…</p>;
  if (!error) return null;
  return (
    <div className="status" role="alert">
      <p>We could not load this content right now.</p>
      <button className="btn btn-outline" onClick={retry}>Try again</button>
      <p>Or call <a href={`tel:${SITE.phones[0].tel}`}>{SITE.phones[0].display}</a>.</p>
    </div>
  );
}
