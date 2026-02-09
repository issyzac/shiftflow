-- Create inventory_items table
create table inventory_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  category text,
  unit text default 'unit', -- e.g., kg, liters, box, unit
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table inventory_items enable row level security;

-- Create policies (modify as per your auth requirements)
-- Policy to allow read access for all authenticated users
create policy "Enable read access for all authenticated users"
on inventory_items for select
to authenticated
using (true);

-- Policy to allow insert/update/delete for core users (for now, let's allow all authenticated to simplify, or restrict if roles exist)
-- Assuming we want to restrict to 'core' role if it existed, but based on current app, we'll allow authenticated updates since roles are not strictly enforced in DB yet
create policy "Enable insert for authenticated users"
on inventory_items for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users"
on inventory_items for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for authenticated users"
on inventory_items for delete
to authenticated
using (true);
