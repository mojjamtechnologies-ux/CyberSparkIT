import { useState } from 'react';
import { useServices } from '../lib/useServices';
import Icon from './Icon';
import Modal from './Modal';
import EnquiryForm from './EnquiryForm';
import { Status } from './Status';

export default function UtilityGrid({ limit }: { limit?: number }) {
  const { utilities, loading, error, retry } = useServices();
  const [pick, setPick] = useState<{ slug: string; title: string } | null>(null);
  if (loading || error) return <Status loading={loading} error={error} retry={retry} />;
  return (
    <>
      <div className="grid g3">
        {(limit ? utilities.slice(0, limit) : utilities).map((s) => (
          <article className="card" key={s.slug}>
            <div className="badge"><Icon name={s.icon} /></div>
            <h3>{s.title}</h3>
            <p>{s.summary}</p>
            <button className="btn btn-blue" onClick={() => setPick({ slug: s.slug, title: s.title })}>Request This Solution</button>
          </article>
        ))}
      </div>
      <Modal open={!!pick} onClose={() => setPick(null)} title={pick ? `Request: ${pick.title}` : ''}>
        {pick && <EnquiryForm defaultService={pick.slug} />}
      </Modal>
    </>
  );
}
