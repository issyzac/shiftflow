-- 1. Remove the foreign key constraint to auth.users to allow mock profiles
-- We do this because for a Kiosk-style app, we might not create an auth user for every employee initially.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

-- 2. Insert Mock Locations
INSERT INTO locations (id, name, address)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mbezi Beach', 'Mbezi Beach Road'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Victoria', 'Victoria Place')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Mock Profiles (with explicit IDs so we can log in with them consistently if needed)
INSERT INTO profiles (id, name, role, location_id, pin)
VALUES 
  -- Baristas
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'John Barista', 'barista', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1234'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Jane Smith', 'barista', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1234'),
  
  -- Managers
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sarah Manager', 'manager', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '5678'),
  
  -- Core
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Michael CEO', 'core', null, '9999')
ON CONFLICT (id) DO UPDATE 
SET pin = EXCLUDED.pin, role = EXCLUDED.role;
