import axios from 'axios';
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`,
  timeout: 15000,
});
export type Service = {
  id: string; slug: string; kind: 'service' | 'utility'; title: string; summary: string;
  details?: string | null; features: string[]; icon?: string | null; sort: number;
};

export type Project = {
  id: string; title: string; category: string; description: string; problem: string | null; solution: string | null;
  tech: string[]; features: string[]; image_url: string | null; live_url: string | null; github_url: string | null;
};
export type Testimonial = { id: string; quote: string; name: string; business: string | null };
export type Faq = { id: string; question: string; answer: string };
export type PostSummary = { id: string; slug: string; title: string; excerpt: string | null; published_at: string };
export type Post = PostSummary & { body: string };
export type Schedule = { id: string; starts_on: string; ends_on: string | null; location: string | null; notes: string | null };
export type Course = {
  id: string; slug: string; title: string; category: string | null; description: string; syllabus: string | null;
  prerequisites: string | null; duration: string | null; mode: 'onsite' | 'online' | 'hybrid'; fee_ngn: number | null;
  registration_open: boolean; course_schedules: Schedule[];
};
export type Slot = { id: string; starts_at: string; duration_min: number };
