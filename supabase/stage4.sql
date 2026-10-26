-- Stage 4 migration. Run in Supabase SQL Editor AFTER schema.sql and seed.sql.
create table consultation_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null unique,
  duration_min int not null default 30 check (duration_min between 10 and 240),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
create table consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references consultation_slots(id) on delete cascade,
  enquiry_id uuid references enquiries(id) on delete set null,
  full_name text not null, email text not null, phone text, topic text,
  consent boolean not null check (consent),
  status text not null default 'booked' check (status in ('booked','cancelled')),
  created_at timestamptz not null default now()
);
-- Double-booking protection: the database itself allows only one active booking per slot.
create unique index one_active_booking_per_slot on consultation_bookings(slot_id) where status = 'booked';

create table quotations (
  id uuid primary key default gen_random_uuid(),
  seq bigserial,
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  items jsonb not null default '[]',
  currency text not null default 'NGN',
  notes text, valid_until date,
  status text not null default 'draft' check (status in ('draft','sent','accepted','declined')),
  sent_at timestamptz,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index quotations_enquiry_idx on quotations(enquiry_id);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, excerpt text, body text not null,
  published boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create or replace function set_published_at() returns trigger language plpgsql as $$
begin if new.published and new.published_at is null then new.published_at := now(); end if; return new; end $$;
create trigger blog_published_at before insert or update on blog_posts for each row execute function set_published_at();

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null, name text not null, business text,
  published boolean not null default false, sort int not null default 0,
  created_at timestamptz not null default now()
);
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Websites','Mobile apps','E-commerce','Business utility systems','AI and automation','Training and educational platforms')),
  description text not null, problem text, solution text,
  tech text[] not null default '{}', features text[] not null default '{}',
  image_url text, live_url text, github_url text,
  service_slug text references services(slug) on update cascade on delete set null,
  published boolean not null default false, sort int not null default 0,
  created_at timestamptz not null default now()
);
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, category text,
  description text not null, syllabus text, prerequisites text, duration text,
  mode text not null default 'onsite' check (mode in ('onsite','online','hybrid')),
  fee_ngn integer check (fee_ngn >= 0),
  registration_open boolean not null default false, published boolean not null default false,
  sort int not null default 0, created_at timestamptz not null default now()
);
create table course_schedules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  starts_on date not null, ends_on date, location text, notes text,
  created_at timestamptz not null default now()
);
create table training_registrations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  schedule_id uuid references course_schedules(id) on delete set null,
  full_name text not null, email text not null, phone text, message text,
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);
create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null, answer text not null,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);
create table announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null, link_url text, active boolean not null default false,
  created_at timestamptz not null default now()
);
create table site_settings (
  key text primary key, value jsonb not null, updated_at timestamptz not null default now()
);
insert into site_settings (key, value) values
 ('contact', '{"phones":["09057315511","08020600641"],"email":"cybersparkit@gmail.com","address":"22 Ogunoloko Road, Mosalashi Bus Stop, Mafoluku-Oshodi, Lagos, Nigeria."}'),
 ('stats', '[]');

alter table consultation_slots enable row level security;
alter table consultation_bookings enable row level security;
alter table quotations enable row level security;
alter table blog_posts enable row level security;
alter table testimonials enable row level security;
alter table projects enable row level security;
alter table courses enable row level security;
alter table course_schedules enable row level security;
alter table training_registrations enable row level security;
alter table faqs enable row level security;
alter table announcements enable row level security;
alter table site_settings enable row level security;
