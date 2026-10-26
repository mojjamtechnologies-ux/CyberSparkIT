import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePageMeta } from '../lib/meta';
import { useServices } from '../lib/useServices';
import { SERVICE_CONTENT } from '../data/serviceContent';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import EnquiryForm from '../components/EnquiryForm';
import Process from '../components/Process';
import { Status } from '../components/Status';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { services, loading, error, retry } = useServices();
  const [open, setOpen] = useState(false);
  const s = services.find((x) => x.slug === slug);
  const c = SERVICE_CONTENT[slug];
  usePageMeta(s?.title ?? 'Service', s?.summary ?? 'CyberSpark IT Solutions service');
  if (loading || error) return <div className="section"><div className="container"><Status loading={loading} error={error} retry={retry} /></div></div>;
  if (!s) return <NotFound />;
  return (
    <>
      <section className="page-head"><div className="container"><div className="badge light"><Icon name={s.icon} /></div><h1>{s.title}</h1><p>{s.summary}</p>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>Enquire About This Service</button></div></section>
      <section className="section"><div className="container prose">
        {c && (
          <>
            <h2>The problem we solve</h2><p>{c.problem}</p>
            <div className="grid g2">
              <div className="card"><h2>Benefits</h2><ul className="ticks">{c.benefits.map((b) => <li key={b}><Check size={18} />{b}</li>)}</ul></div>
              <div className="card"><h2>Relevant features</h2><ul className="ticks">{c.features.map((b) => <li key={b}><Check size={18} />{b}</li>)}</ul></div>
            </div>
          </>
        )}
        {slug === 'ai-business-automation' && <p>AI supports your team; it does not replace judgement. Important messages and decisions are reviewed by a person. <Link to="/ai-automation">See AI &amp; automation</Link>.</p>}
        {slug === 'custom-business-apps' && <p>Browse the <Link to="/solutions">12 business utility apps</Link> we build and customise.</p>}
        {slug === 'training-mentorship' && <p>See <Link to="/training">training programmes</Link>.</p>}
        <h2>How we deliver</h2>
      </div><div className="container"><Process /></div></section>
      <section className="cta"><div className="container center"><h2>Interested in {s.title}?</h2><button className="btn btn-primary" onClick={() => setOpen(true)}>Enquire Now</button></div></section>
      <Modal open={open} onClose={() => setOpen(false)} title={`Enquire: ${s.title}`}><EnquiryForm defaultService={s.slug} /></Modal>
    </>
  );
}
