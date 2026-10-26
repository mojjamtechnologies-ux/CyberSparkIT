import { useEffect } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { AuthProvider, useAuth } from './auth';
import './admin.css';

export function AdminShell() {
  const { user, logout } = useAuth();
  useEffect(() => {
    document.title = 'Admin | CyberSpark IT Solutions';
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => { m.remove(); };
  }, []);
  if (!user) return <Navigate to="/admin/login" replace />;
  return (
    <div className="adm">
      <header className="adm-top">
        <Logo />
        <nav aria-label="Admin">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/enquiries">Enquiries</NavLink>
          <NavLink to="/admin/consultations">Consultations</NavLink>
          <NavLink to="/admin/services">Services</NavLink>
          <NavLink to="/admin/projects">Portfolio</NavLink>
          <NavLink to="/admin/courses">Courses</NavLink>
          <NavLink to="/admin/schedules">Schedules</NavLink>
          <NavLink to="/admin/registrations">Registrations</NavLink>
          <NavLink to="/admin/posts">Blog</NavLink>
          <NavLink to="/admin/testimonials">Testimonials</NavLink>
          <NavLink to="/admin/faqs">FAQs</NavLink>
          <NavLink to="/admin/announcements">Announcements</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <div className="adm-user"><span>{user.name || user.email} ({user.role})</span>
          <ThemeToggle />
          <button className="btn btn-outline" onClick={logout}><LogOut size={16} /> Log out</button></div>
      </header>
      <main className="adm-main"><Outlet /></main>
    </div>
  );
}
export default function AdminRoot() { return <AuthProvider><Outlet /></AuthProvider>; }
