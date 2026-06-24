-- ============================================================
-- PlaceMate – Supabase Schema (exact state of live database)
-- This is the reference copy. Do NOT re-run on existing DB.
-- ============================================================

create table student_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  phone text,
  address text,
  dob date,
  degree text,
  branch text,
  current_year text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  -- added via ALTER (first_name & last_name were dropped)
  full_name text not null,
  register_no text unique
);

alter table student_profiles
  add constraint student_profiles_auth_user_id_fkey
  foreign key (auth_user_id) references auth.users(id) on delete cascade;

alter table student_profiles disable row level security;

create table staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text unique not null,
  faculty_id text unique,
  phone text,
  created_at timestamp default now()
);

alter table staff_profiles
  add constraint staff_profiles_auth_user_id_fkey
  foreign key (auth_user_id) references auth.users(id) on delete cascade;

alter table staff_profiles disable row level security;

create table academic_details (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  tenth_school text,
  tenth_percentage numeric,
  twelfth_school text,
  twelfth_percentage numeric,
  ug_college text,
  ug_cgpa numeric,
  pg_college text,
  pg_cgpa numeric,
  created_at timestamp default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  skill_name text not null,
  proficiency text,
  created_at timestamp default now()
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  certification_name text,
  issuer text,
  certificate_url text,
  created_at timestamp default now()
);

create table internships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  company_name text,
  role text,
  duration text,
  certificate_url text,
  created_at timestamp default now()
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  resume_url text,
  uploaded_at timestamp default now()
);

create table placement_analysis (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  readiness_score integer,
  readiness_status text,
  strengths text,
  weaknesses text,
  recommendations text,
  consolidated_report text,
  analyzed_at timestamp default now()
);


