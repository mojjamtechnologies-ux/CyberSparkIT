import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Briefcase, CalendarClock, CalendarDays, ClipboardList, FolderKanban, GraduationCap, HelpCircle, Inbox, LayoutDashboard, LogOut, Megaphone, Menu, Newspaper, Quote, Settings, X, type LucideIcon } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { AuthProvider, useAuth } from './auth';
import './admin.css';

const GROUPS: { label: string; links: [string, string, LucideIcon][] }[] = [
  { label: 'Leads', links: [['/admin', 'Dashboard', LayoutDashboard], ['/admin/enquiries', 'Enquiries', Inbox], ['/admin/consultations', 'Consultations', CalendarClock]] },
  { label: 'Website', links: [['/admin/services', 'Services', Briefcase], ['/admin/projects', 'Portfolio', FolderKanban], ['/admin/posts', 'Blog', Newspaper], ['/admin/testimonials', 'Testimonials', Quote], ['/admin/faqs', 'FAQs', HelpCircle], ['/admin/announcements', 'Announcements', Megaphone]] },
  { label: 'Training', links: [['/admin/courses', 'Courses', GraduationCap], ['/admin/schedules', 'Schedules', CalendarDays], ['/admin/registrations', 'Registrations', ClipboardList]] },
  { label: 'Site', links: [['/admin/settings', 'Settings', Settings]] },
];
const DESKTOP = '(min-width: 1024px)';

function useDesktop() {
  const [d, setD] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const on = () => setD(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return d;
}

export function AdminShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);
  const sideRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = 'Admin | CyberSpark IT Solutions';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);       // close the menu after choosing a page
  useEffect(() => { if (desktop) setOpen(false); }, [desktop]); // the menu is always visible on wide screens

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); burgerRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // keep the page from scrolling behind the open menu
    sideRef.current?.querySelector<HTMLElement>('a.adm-link')?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <div className="adm">
      {!desktop && (
        <header className="adm-bar">
          <button ref={burgerRef} type="button" className="adm-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="adm-side" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/admin" className="adm-bar-logo" aria-label="Admin home"><Logo /></Link>
          <ThemeToggle />
        </header>
      )}
      {open && <div className="adm-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside id="adm-side" ref={sideRef} className={`adm-side${open ? ' open' : ''}`} aria-label="Admin navigation">
        <Link to="/admin" className="adm-side-logo" aria-label="Admin home"><Logo /></Link>
        <nav aria-label="Admin">
          {GROUPS.map((g) => (
            <div className="adm-group" key={g.label}>
              <p className="adm-group-label">{g.label}</p>
              {g.links.map(([to, label, Icon]) => (
                <NavLink key={to} to={to} end={to === '/admin'} className="adm-link"><Icon size={18} aria-hidden="true" />{label}</NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <p className="adm-who">{user.name || user.email}<small>{user.role}</small></p>
          <div className="adm-foot-actions">
            {desktop && <ThemeToggle />}
            <button type="button" className="btn btn-outline" onClick={logout}><LogOut size={16} /> Log out</button>
          </div>
        </div>
      </aside>
      <div className="adm-content"><main className="adm-main"><Outlet /></main></div>
    </div>
  );
}
export default function AdminRoot() { return <AuthProvider><Outlet /></AuthProvider>; }
