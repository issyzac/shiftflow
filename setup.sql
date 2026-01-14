-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Locations Table
create table locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text
);

-- 2. Profiles Table (replacing/augmenting default auth table usually, but spec says 'profiles')
-- Note: You might want to use a trigger to automatically create a profile on auth.users creation
create table profiles (
  id uuid references auth.users not null primary key, -- linking to supabase auth
  name text,
  role text check (role in ('c_suite', 'manager', 'barista')),
  location_id uuid references locations(id)
);

-- 3. Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text check (type in ('periodic', 'ad_hoc')),
  category text check (category in ('quality', 'systems', 'maintenance')),
  created_at timestamp with time zone default now()
);

-- 4. Shifts Table
create table shifts (
  id uuid default uuid_generate_v4() primary key,
  location_id uuid references locations(id),
  bic_id uuid references profiles(id),
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  cash_float_verified boolean default false,
  briefing_completed boolean default false
);

-- 5. Wastage Logs Table
create table wastage_logs (
  id uuid default uuid_generate_v4() primary key,
  shift_id uuid references shifts(id),
  item_type text,
  quantity integer,
  reason text check (reason in ('expired', 'damaged')),
  logged_at timestamp with time zone default now()
);

-- 6. Maintenance Tickets Table
create table maintenance_tickets (
  id uuid default uuid_generate_v4() primary key,
  location_id uuid references locations(id),
  equipment_name text,
  issue_description text,
  status text check (status in ('open', 'fundi_scheduled', 'fixed')) default 'open',
  created_at timestamp with time zone default now()
);

-- 7. Task Logs Table
create table task_logs (
  id uuid default uuid_generate_v4() primary key,
  shift_id uuid references shifts(id),
  task_id uuid references tasks(id),
  completed_at timestamp with time zone default now()
);
