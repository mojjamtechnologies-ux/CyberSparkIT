import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
import { useServices } from '../lib/useServices';
import Icon from '../components/Icon';
import { Status } from '../components/Status';

export default function Services() {
  usePageMeta('Services', 'Website development, mobile apps, custom business apps, AI automation, APIs, e-commerce, UI/UX design, consultancy, support and training.');
  const { services, loading, error, retry } = useServices();
  return (
    <>
      <section className="page-head"><div className="container"><h1>Our Services</h1><p>Everything a growing business needs to go digital.</p></div></section>
      <section className="section"><div className="container">
        <Status loading={loading} error={error} retry={retry} />
        <div className="grid g3">
          {services.map((s) => (
            <Link to={`/services/${s.slug}`} className="card card-link" key={s.slug}>
              <div className="badge"><Icon name={s.icon} /></div><h3>{s.title}</h3><p>{s.summary}</p><span className="more">Learn More →</span>
            </Link>
          ))}
        </div>
      </div></section>
    </>
  );
}
