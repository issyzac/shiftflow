-- Drop the old tasks table if it exists (it may have a conflicting schema from setup.sql)
DROP TABLE IF EXISTS tasks CASCADE;

-- Create tasks table with the schema expected by the application
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  location_id uuid references locations(id),
  title text not null,
  task_text text,
  is_completed boolean default false,
  assigned_by text,
  created_at timestamp with time zone default now()
);

-- Seed mock data for tasks
-- Using the mock location IDs from 02_seed_mock_data.sql
INSERT INTO tasks (location_id, title, task_text, is_completed, assigned_by)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Espresso Machine Maintenance', 'Deep clean the espresso machine steam wand', false, 'Manager'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Merchandising', 'Rearrange the pastry display case for better visibility', false, 'Core'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inventory Check', 'Check inventory of takeaway cups and lids', true, 'Manager'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Facility Cleaning', 'Clean the front windows', false, 'Manager');
