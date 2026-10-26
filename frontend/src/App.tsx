import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Solutions from './pages/Solutions';
import Automation from './pages/Automation';
import Portfolio from './pages/Portfolio';
import Training from './pages/Training';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import { Privacy, Terms } from './pages/Legal';
import NotFound from './pages/NotFound';
import AdminRoot, { AdminShell } from './admin/AdminLayout';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import AdminEnquiries from './admin/Enquiries';
import AdminEnquiryDetail from './admin/EnquiryDetail';
import AdminServices from './admin/ServicesAdmin';
import Consultations from './admin/Consultations';
import Registrations from './admin/Registrations';
import SettingsAdmin from './admin/SettingsAdmin';
import { ProjectsAdmin, TestimonialsAdmin, FaqsAdmin, AnnouncementsAdmin, PostsAdmin, CoursesAdmin, SchedulesAdmin } from './admin/ContentAdmin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:slug" element={<ServiceDetail />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="ai-automation" element={<Automation />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="training" element={<Training />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminShell />}>
          <Route index element={<AdminDashboard />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="enquiries/:id" element={<AdminEnquiryDetail />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="courses" element={<CoursesAdmin />} />
          <Route path="schedules" element={<SchedulesAdmin />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="faqs" element={<FaqsAdmin />} />
          <Route path="announcements" element={<AnnouncementsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}
