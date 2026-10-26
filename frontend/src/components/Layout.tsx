import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';
import PageLoader from './PageLoader';
import ThemeToggle from './ThemeToggle';
import { NAV, SITE } from '../lib/site';
import { telOf, useSite } from '../lib/useSite';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const site = useSite();
  const ann = site.announcement;
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <PageLoader />
      <a href="#main" className="skip">Skip to content</a>
      {ann && <div className="announce" role="note">{ann.link_url ? <a href={ann.link_url} target="_blank" rel="noopener noreferrer">{ann.message}</a> : ann.message}</div>}
      <header className="header">
        <div className="container bar">
          <Link to="/" aria-label="CyberSpark IT Solutions home"><Logo /></Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.to === '/'}>{n.label}</NavLink>)}
            <Link className="btn btn-primary nav-cta" to="/contact?intent=consultation">Get a Free Consultation</Link>
          </nav>
          <div className="bar-actions">
            <ThemeToggle />
            <button className="burger" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="footer">
        <div className="container fgrid">
          <div>
            <Logo light />
            <p>{SITE.tagline}. We build websites, mobile apps, custom business utility apps and AI-powered automations.</p>
          </div>
          <div><h4>Explore</h4>{NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}</div>
          <div><h4>Services</h4>
            <Link to="/services">All services</Link><Link to="/solutions">Business utility apps</Link>
            <Link to="/ai-automation">AI &amp; automation</Link><Link to="/training">Training</Link>
          </div>
          <div><h4>Contact</h4>
            {site.contact.phones.map((p) => <a key={p} href={`tel:${telOf(p)}`}><Phone size={14} /> {p}</a>)}
            <a href={`mailto:${site.contact.email}`}><Mail size={14} /> {site.contact.email}</a>
            <span><MapPin size={14} /> {site.contact.address}</span>
          </div>
        </div>
        <div className="container fbase">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span><Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link></span>
        </div>
      </footer>
    </>
  );
}
