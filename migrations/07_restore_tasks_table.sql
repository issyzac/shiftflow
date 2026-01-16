-- Re-create tasks table for operational checklist (distinct from briefing alignment)
CREATE TABLE IF NOT EXISTS location_tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id uuid REFERENCES locations(id),
  task_text text NOT NULL,
  category text DEFAULT 'general', -- 'opening', 'closing', 'maintenance', 'adhoc'
  is_completed boolean DEFAULT false,
  assigned_by text, -- 'Manager', 'System', etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Seed mock data for tasks
INSERT INTO location_tasks (location_id, task_text, category, is_completed, assigned_by)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Check electricity units balance', 'maintenance', false, 'System'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Verify AC subscription status', 'maintenance', false, 'System'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wipe down all tables', 'general', false, 'Manager'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Check electricity units balance', 'maintenance', false, 'System');
