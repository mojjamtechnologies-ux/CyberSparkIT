import { Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Bot, LifeBuoy, MessagesSquare, Wallet, Target, Gauge } from 'lucide-react';
import { usePageMeta } from '../lib/meta';
import { useServices } from '../lib/useServices';
import { useApi } from '../lib/useApi';
import { useSite } from '../lib/useSite';
import type { Project, Testimonial } from '../lib/api';
import Faqs from '../components/Faqs';
import Icon from '../components/Icon';
import UtilityGrid from '../components/UtilityGrid';
import Process from '../components/Process';
import { Status } from '../components/Status';

const WHY = [
  [Target, 'Tailored to each business', 'We build around how you actually work.'], [Gauge, 'Practical, results-oriented', 'Features that save time or earn money come first.'],
  [Smartphone, 'Mobile-friendly', 'Apps that work well on the phones your customers use.'], [ShieldCheck, 'Secure and maintainable', 'Clean, documented systems that are safe to run.'],
  [Bot, 'AI-powered automation', 'Automation with people reviewing what matters.'], [LifeBuoy, 'Ongoing technical support', 'We stay around after launch.'],
  [MessagesSquare, 'Transparent communication', 'Clear updates, no jargon.'], [Wallet, 'Affordable for small businesses', 'Right-sized solutions, not bloated ones.'],
] as const;

export default function Home() {
  usePageMeta('', 'We build websites, mobile applications, custom business utility apps and AI-powered automations that help small businesses save time, serve customers better and grow faster.');
  const { services, loading, error, retry } = useServices();
  const stats = useSite().stats;
  const testimonials = useApi<Testimonial[]>('/testimonials').data ?? [];
  const projects = useApi<Project[]>('/projects').data ?? [];
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">{`Empowering Small Businesses With Smart Tech`}</p>
            <h1>Smart Technology Solutions for Growing Businesses.</h1>
            <p className="lead">We build websites, mobile applications, custom business utility apps, and AI-powered automations that help small businesses save time, serve customers better, and grow faster.</p>
            <div className="btns">
              <Link className="btn btn-primary" to="/services">Explore Our Services</Link>
              <Link className="btn btn-ghost" to="/contact?intent=consultation">Get a Free Consultation</Link>
            </div>
          </div>
          <svg viewBox="0 0 480 360" className="hero-art" role="img" aria-label="Illustration of a web dashboard, a mobile app and an automated workflow">
            <rect x="10" y="30" width="330" height="220" rx="16" fill="#fff" /><rect x="10" y="30" width="330" height="34" rx="16" fill="#0B65D8" />
            <circle cx="32" cy="47" r="5" fill="#FFB800" /><circle cx="50" cy="47" r="5" fill="#fff" opacity=".6" />
            <rect x="30" y="86" width="90" height="56" rx="10" fill="#EAF1FF" /><rect x="132" y="86" width="90" height="56" rx="10" fill="#EAF1FF" /><rect x="234" y="86" width="90" height="56" rx="10" fill="#FFF3D1" />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={40 + i * 46} y={225 - (30 + ((i * 37) % 60))} width="28" height={30 + ((i * 37) % 60)} rx="6" fill={i % 2 ? '#0B65D8' : '#0645B8'} />)}
            <rect x="330" y="80" width="130" height="250" rx="24" fill="#061A45" stroke="#FFB800" strokeWidth="4" /><rect x="344" y="108" width="102" height="30" rx="8" fill="#0B65D8" />
            <rect x="344" y="150" width="102" height="30" rx="8" fill="#fff" opacity=".9" /><rect x="344" y="192" width="102" height="30" rx="8" fill="#fff" opacity=".9" /><rect x="344" y="248" width="102" height="34" rx="17" fill="#FFB800" />
            <g stroke="#FFB800" strokeWidth="3" fill="none"><path d="M60 300h60M180 300h60" /><path d="m112 292 8 8-8 8m120-16 8 8-8 8" /></g>
            <circle cx="40" cy="300" r="18" fill="#0B65D8" /><circle cx="150" cy="300" r="18" fill="#fff" /><circle cx="260" cy="300" r="18" fill="#FFB800" />
          </svg>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="section-sm"><div className="container stats">{stats.map((s) => <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div></section>
      )}

      <section className="section">
        <div className="container">
          <h2 className="h2">What we do</h2><p className="sub">Technology services for growing businesses.</p>
          <Status loading={loading} error={error} retry={retry} />
          <div className="grid g3">
            {services.slice(0, 6).map((s) => (
              <Link to={`/services/${s.slug}`} className="card card-link" key={s.slug}>
                <div className="badge"><Icon name={s.icon} /></div><h3>{s.title}</h3><p>{s.summary}</p><span className="more">Learn More →</span>
              </Link>
            ))}
          </div>
          <p className="center"><Link className="btn btn-outline" to="/services">View all services</Link></p>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2 className="h2">Custom Utility Apps &amp; Digital Solutions We Build for Small Businesses</h2>
          <p className="sub">These are solutions we design, build and customise for your business, not necessarily ready-made products.</p>
          <UtilityGrid />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="h2">Why choose CyberSpark?</h2>
          <div className="grid g4">{WHY.map(([I, t, d]) => <div className="why" key={t}><I size={26} aria-hidden="true" /><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section alt"><div className="container">
          <h2 className="h2">Featured projects</h2>
          <div className="grid g3">{projects.slice(0, 3).map((p) => <article className="card" key={p.id}><h3>{p.title}</h3><p>{p.description}</p><p className="tags">{p.tech.join(' · ')}</p>{p.live_url && <a className="more" href={p.live_url} target="_blank" rel="noopener noreferrer">View live site →</a>}</article>)}</div>
          <p className="center"><Link className="btn btn-outline" to="/portfolio">See the portfolio</Link></p>
        </div></section>
      )}

      <section className="section"><div className="container"><h2 className="h2">Our process</h2><Process /></div></section>

      {testimonials.length > 0 && (
        <section className="section alt"><div className="container"><h2 className="h2">What clients say</h2>
          <div className="grid g3">{testimonials.map((t) => <blockquote className="card" key={t.id}><p>“{t.quote}”</p><footer><strong>{t.name}</strong>{t.business && `, ${t.business}`}</footer></blockquote>)}</div></div></section>
      )}

      <Faqs />

      <section className="cta"><div className="container center">
        <h2>Ready to Digitize Your Business?</h2><p>Let's build the right technology solution for your business.</p>
        <Link className="btn btn-primary" to="/contact">Start Your Project</Link>
      </div></section>
    </>
  );
}
