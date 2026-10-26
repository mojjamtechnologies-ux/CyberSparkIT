-- Run in Supabase: SQL Editor > New query. Then run seed.sql.
create extension if not exists pgcrypto;

create type enquiry_status as enum
  ('new','contacted','consultation_scheduled','quotation_sent','in_progress','completed','closed');

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text not null,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('service','utility')),
  title text not null,
  summary text not null,
  details text,
  features text[] not null default '{}',
  icon text,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text,
  email text not null,
  phone text,
  service_slug text references services(slug) on update cascade on delete set null,
  budget text,
  timeline text,
  message text not null,
  contact_method text not null default 'email' check (contact_method in ('email','phone','whatsapp')),
  consent boolean not null check (consent),
  status enquiry_status not null default 'new',
  assigned_to uuid references admin_users(id) on delete set null,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_status_idx on enquiries(status);
create index enquiries_created_idx on enquiries(created_at desc);

create table enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  author_id uuid references admin_users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table enquiry_history (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  from_status enquiry_status,
  to_status enquiry_status not null,
  changed_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Only the Express API (service-role key) touches the database. RLS on with no
-- policies means the public anon key can read/write nothing.
alter table admin_users enable row level security;
alter table services enable row level security;
alter table enquiries enable row level security;
alter table enquiry_notes enable row level security;
alter table enquiry_history enable row level security;
