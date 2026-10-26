import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta';
import Process from '../components/Process';

const VALUES = [['Practical', 'We build what helps your business, not what looks impressive.'], ['Honest', 'Clear scope, clear communication, no overpromising.'], ['Secure', 'We treat your data and your customers’ data with care.'], ['Supportive', 'We help you adopt technology with confidence.']];

export default function About() {
  usePageMeta('About Us', 'CyberSpark IT Solutions helps small businesses adopt practical digital solutions: websites, apps, automation and training.');
  return (
    <>
      <section className="page-head"><div className="container"><h1>About CyberSpark IT Solutions</h1><p>Empowering Small Businesses With Smart Tech</p></div></section>
      <section className="section"><div className="container prose">
        <p>CyberSpark IT Solutions is a technology company in Lagos, Nigeria that helps small businesses grow through custom software development, business utility applications, AI-powered automation and digital transformation services.</p>
        <div className="grid g2">
          <div className="card"><h2>Our mission</h2><p>To help small businesses work smarter by building practical, affordable and reliable technology solutions.</p></div>
          <div className="card"><h2>Our vision</h2><p>A business community where every small business can use technology with confidence.</p></div>
        </div>
        <h2>Core values</h2>
        <div className="grid g4">{VALUES.map(([t, d]) => <div className="why" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        <h2>Our approach to technology</h2>
        <p>We start with your business problem, not with a technology. We recommend the simplest solution that solves it, build it in clear steps, and keep it maintainable so you are never locked into something you cannot run. Where AI or automation helps, we use it, with people reviewing the decisions that matter.</p>
        <h2>Who we help</h2>
        <p>Shops and supermarkets, restaurants, salons, clinics, consultants, training providers and other small businesses that want to move from paper and spreadsheets to dependable digital tools.</p>
        <h2>How we work</h2>
      </div><div className="container"><Process /></div></section>
      <section className="cta"><div className="container center"><h2>Let’s talk about your business</h2><Link className="btn btn-primary" to="/contact?intent=consultation">Get a Free Consultation</Link></div></section>
    </>
  );
}
