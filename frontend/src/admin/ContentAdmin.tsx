import { useEffect, useState } from 'react';
import ResourceManager, { Field } from './ResourceManager';
import { adminApi } from './adminApi';

const CATS = ['Websites', 'Mobile apps', 'E-commerce', 'Business utility systems', 'AI and automation', 'Training and educational platforms'];
const pub = { published: true, sort: 0 };

export const ProjectsAdmin = () => (
  <ResourceManager title="Portfolio projects" endpoint="/admin/projects" toggleKey="published" blank={{ title: '', category: CATS[0], description: '', problem: '', solution: '', tech: '', features: '', image_url: '', live_url: '', github_url: '', service_slug: '', ...pub, published: false }}
    note="Only add real projects you own or built. Image and link fields take full https:// URLs."
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: CATS.map((c) => [c, c]) },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'problem', label: 'Business problem', type: 'textarea' }, { name: 'solution', label: 'Solution delivered', type: 'textarea' },
      { name: 'tech', label: 'Technology stack (one per line)', type: 'lines' }, { name: 'features', label: 'Key features (one per line)', type: 'lines' },
      { name: 'image_url', label: 'Featured image URL', type: 'text' }, { name: 'live_url', label: 'Live website link', type: 'text' }, { name: 'github_url', label: 'GitHub repository (optional)', type: 'text' },
      { name: 'service_slug', label: 'Related service slug (e.g. website-development)', type: 'text' },
      { name: 'sort', label: 'Display order', type: 'number' }, { name: 'published', label: 'Published on the website', type: 'checkbox' },
    ]}
    cols={[{ h: 'Title', cell: (r) => r.title }, { h: 'Category', cell: (r) => r.category }, { h: 'Live link', cell: (r) => r.live_url || '-' }]} />
);

export const TestimonialsAdmin = () => (
  <ResourceManager title="Testimonials" endpoint="/admin/testimonials" toggleKey="published" blank={{ quote: '', name: '', business: '', sort: 0, published: false }}
    note="Only publish testimonials given to you by real customers, with their permission."
    fields={[{ name: 'quote', label: 'Testimonial', type: 'textarea', required: true }, { name: 'name', label: 'Customer name', type: 'text', required: true }, { name: 'business', label: 'Business', type: 'text' }, { name: 'sort', label: 'Display order', type: 'number' }, { name: 'published', label: 'Published on the website', type: 'checkbox' }]}
    cols={[{ h: 'Name', cell: (r) => r.name }, { h: 'Business', cell: (r) => r.business || '-' }, { h: 'Testimonial', cell: (r) => String(r.quote).slice(0, 80) }]} />
);

export const FaqsAdmin = () => (
  <ResourceManager title="FAQs" endpoint="/admin/faqs" toggleKey="published" blank={{ question: '', answer: '', ...pub }}
    fields={[{ name: 'question', label: 'Question', type: 'text', required: true }, { name: 'answer', label: 'Answer', type: 'textarea', required: true }, { name: 'sort', label: 'Display order', type: 'number' }, { name: 'published', label: 'Published on the website', type: 'checkbox' }]}
    cols={[{ h: 'Question', cell: (r) => r.question }, { h: 'Order', cell: (r) => r.sort }]} />
);

export const AnnouncementsAdmin = () => (
  <ResourceManager title="Announcements" endpoint="/admin/announcements" toggleKey="active" blank={{ message: '', link_url: '', active: false }}
    note="The most recent active announcement appears as a banner at the top of the website."
    fields={[{ name: 'message', label: 'Message', type: 'text', required: true }, { name: 'link_url', label: 'Link (optional, https://…)', type: 'text' }, { name: 'active', label: 'Show on the website now', type: 'checkbox' }]}
    cols={[{ h: 'Message', cell: (r) => r.message }, { h: 'Link', cell: (r) => r.link_url || '-' }]} />
);

export const PostsAdmin = () => (
  <ResourceManager title="Blog posts" endpoint="/admin/posts" toggleKey="published" blank={{ slug: '', title: '', excerpt: '', body: '', published: false }}
    note="Write paragraphs separated by a blank line. Start a line with “## ” for a heading."
    fields={[{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'Slug (lowercase-with-dashes)', type: 'text', required: true, createOnly: true }, { name: 'excerpt', label: 'Short excerpt', type: 'textarea' }, { name: 'body', label: 'Article', type: 'textarea', required: true }, { name: 'published', label: 'Published on the website', type: 'checkbox' }]}
    cols={[{ h: 'Title', cell: (r) => r.title }, { h: 'Slug', cell: (r) => `/blog/${r.slug}` }, { h: 'Published', cell: (r) => (r.published_at ? new Date(r.published_at).toLocaleDateString('en-NG') : '-') }]} />
);

export const CoursesAdmin = () => (
  <ResourceManager title="Training courses" endpoint="/admin/courses" toggleKey="published" blank={{ slug: '', title: '', category: '', description: '', syllabus: '', prerequisites: '', duration: '', mode: 'onsite', fee_ngn: '', registration_open: false, published: false, sort: 0 }}
    note="Open or close registration with the checkbox below. Leave the fee empty to show “Contact us”."
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'Slug (lowercase-with-dashes)', type: 'text', required: true, createOnly: true },
      { name: 'category', label: 'Category', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'syllabus', label: 'Syllabus', type: 'textarea' }, { name: 'prerequisites', label: 'Prerequisites', type: 'textarea' },
      { name: 'duration', label: 'Duration (e.g. 8 weeks)', type: 'text' },
      { name: 'mode', label: 'Learning mode', type: 'select', required: true, options: [['onsite', 'Onsite'], ['online', 'Online'], ['hybrid', 'Onsite & online']] },
      { name: 'fee_ngn', label: 'Fee (₦, numbers only)', type: 'number' }, { name: 'sort', label: 'Display order', type: 'number' },
      { name: 'registration_open', label: 'Registration is open', type: 'checkbox' }, { name: 'published', label: 'Published on the website', type: 'checkbox' },
    ]}
    cols={[{ h: 'Course', cell: (r) => r.title }, { h: 'Mode', cell: (r) => r.mode }, { h: 'Fee', cell: (r) => (r.fee_ngn != null ? `₦${Number(r.fee_ngn).toLocaleString('en-NG')}` : '-') }, { h: 'Registration', cell: (r) => <span className={`pill ${r.registration_open ? 'completed' : 'closed'}`}>{r.registration_open ? 'Open' : 'Closed'}</span> }]} />
);

export function SchedulesAdmin() {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => { adminApi.get('/admin/courses').then((r) => setCourses(r.data)).catch(() => undefined); }, []);
  const fields: Field[] = [
    { name: 'course_id', label: 'Course', type: 'select', required: true, options: courses.map((c) => [c.id, c.title]) },
    { name: 'starts_on', label: 'Start date', type: 'date', required: true }, { name: 'ends_on', label: 'End date', type: 'date' },
    { name: 'location', label: 'Location (or “Online”)', type: 'text' }, { name: 'notes', label: 'Notes', type: 'text' },
  ];
  return (
    <ResourceManager key={courses.length} title="Course schedules" endpoint="/admin/schedules" blank={{ course_id: '', starts_on: '', ends_on: '', location: '', notes: '' }} fields={fields}
      cols={[{ h: 'Course', cell: (r) => courses.find((c) => c.id === r.course_id)?.title || '-' }, { h: 'Starts', cell: (r) => r.starts_on }, { h: 'Ends', cell: (r) => r.ends_on || '-' }, { h: 'Location', cell: (r) => r.location || '-' }]} />
  );
}
