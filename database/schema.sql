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
  register_no text unique,
  is_blocked boolean default false
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
  created_at timestamp default now(),
  is_blocked boolean default false
);

alter table staff_profiles
  add constraint staff_profiles_auth_user_id_fkey
  foreign key (auth_user_id) references auth.users(id) on delete cascade;

alter table staff_profiles disable row level security;

create table academic_details (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  tenth_school text,
  tenth_percentage float8,
  twelfth_school text,
  twelfth_percentage float8,
  ug_college text,
  ug_cgpa float8,
  pg_college text,
  pg_cgpa float8,
  placement_status text not null,
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



-- ============================================================
-- Migration: Add is_blocked column for admin block/unblock
-- Run these on the live database if tables already exist
-- ============================================================
alter table student_profiles add column if not exists is_blocked boolean default false;
alter table staff_profiles add column if not exists is_blocked boolean default false;

-- ============================================================
-- Migration: Add missing student_profiles columns
-- ============================================================
alter table student_profiles add column if not exists alternative_phone text;
alter table student_profiles add column if not exists district text;
alter table student_profiles add column if not exists state_name text default 'Tamil Nadu';
alter table student_profiles add column if not exists pin_code text;
alter table student_profiles add column if not exists year_of_study text;
alter table student_profiles add column if not exists pass_out_year text;
alter table student_profiles add column if not exists current_semester text;
alter table student_profiles add column if not exists semester_term text;
alter table student_profiles add column if not exists linkedin_url text;

-- ============================================================
-- Migration: Add missing academic_details columns
-- ============================================================
alter table academic_details add column if not exists board_of_study text;
alter table academic_details add column if not exists graduation_standing text;
alter table academic_details add column if not exists diploma_percentage float8;
alter table academic_details add column if not exists sgpa_values jsonb;
alter table academic_details add column if not exists company_name text;

-- ============================================================
-- Migration: Add placement_verified and company_name to academic_details
-- ============================================================
alter table academic_details add column if not exists placement_verified boolean default false;
alter table academic_details add column if not exists company_name text;

-- ============================================================
-- Migration: Add is_verified to student_profiles
-- ============================================================
alter table student_profiles add column if not exists is_verified boolean default false;

-- ============================================================
-- Migration: Add resume_text column for AI analysis
-- ============================================================
alter table resumes add column if not exists resume_text text;

-- ============================================================
-- Migration: Add rich fields to certifications
-- ============================================================
alter table certifications add column if not exists category text default 'General';
alter table certifications add column if not exists start_date date;
alter table certifications add column if not exists end_date date;
alter table certifications add column if not exists description text;
alter table certifications add column if not exists status text default 'Pending Review';

-- ============================================================
-- Migration: Add diploma_institution to academic_details
-- ============================================================
alter table academic_details add column if not exists diploma_institution text;
