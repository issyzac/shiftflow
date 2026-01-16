-- Drop previous tasks table if exists (re-implementing as briefing_items)
DROP TABLE IF EXISTS tasks;

-- Create briefing_items table
CREATE TABLE IF NOT EXISTS briefing_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id uuid REFERENCES locations(id),
  content text NOT NULL,
  recurrence text CHECK (recurrence IN ('once', 'recurring')) NOT NULL DEFAULT 'once',
  is_active boolean DEFAULT true,
  created_by_name text, -- For display purposes "Assigned by X"
  created_at timestamp with time zone DEFAULT now()
);

-- Create completions table to track status per shift
CREATE TABLE IF NOT EXISTS briefing_completions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  briefing_id uuid REFERENCES briefing_items(id),
  shift_id uuid REFERENCES shifts(id),
  completed_at timestamp with time zone DEFAULT now(),
  completed_by uuid REFERENCES profiles(id)
);

-- Seed mock data
INSERT INTO briefing_items (location_id, content, recurrence, is_active, created_by_name)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Deep clean the steam wand', 'recurring', true, 'Sarah Manager'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Check expiry dates on milk', 'recurring', true, 'Sarah Manager'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fix the wobbly table at entrance', 'once', true, 'Michael CEO'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Clean front windows', 'recurring', true, 'Sarah Manager');
