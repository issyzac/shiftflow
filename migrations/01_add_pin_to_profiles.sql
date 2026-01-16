-- Add PIN column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pin text;

-- Optional: Add a constraint to ensure it's 4 digits
ALTER TABLE profiles 
ADD CONSTRAINT pin_length_check CHECK (char_length(pin) = 4);

-- Insert/Update dummy data for testing (Upsert to avoid conflicts)
-- Note: In a real app, IDs would be actual UUIDs from auth.users. 
-- For this prototype, we'll assume we can insert directly if testing locally or these are placeholder profiles.
-- However, profiles.id references auth.users. This implies we need matching auth users.
-- To make this work smoothly for the "Tool" aspect without needing real auth.users for every test account,
-- we might drop the foreign key constraint or ensure we create auth users. 
-- BUT, typically 'profiles' are just application users in these POS tools.
-- Let's assume for this specific functionality we might need to be flexible. 
-- If profiles.id IS STRICTLY referencing auth.users, we can't easily insert dummy data via SQL only without auth admin access.
-- I will assume the user has some users or I will provide instructions.
-- For now, I'll just add the column.

-- Grant access to public/anon for this verification flow if needed (check your RLS policies!)
-- ENABLE RLS;
-- CREATE POLICY "Allow read access to profiles for login" ON profiles FOR SELECT USING (true);
