-- Migration to rename c_suite role to core
-- Fixed Version: Drop constraint BEFORE updating data to avoid violation
DO $$ 
BEGIN
    -- 1. Identify and drop any existing role check constraints
    -- We look for constraints on the 'profiles' table that check the 'role' column values.
    DECLARE
        constraint_record RECORD;
    BEGIN
        FOR constraint_record IN 
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'profiles'::regclass 
            AND contype = 'c' 
            AND (consrc LIKE '%role%' OR pg_get_constraintdef(oid) LIKE '%role%')
        LOOP
            EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || quote_ident(constraint_record.conname);
        END LOOP;
    END;

    -- 2. Update the existing records now that the constraint is gone
    UPDATE profiles SET role = 'core' WHERE role = 'c_suite';

    -- 3. Add the new updated constraint
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('core', 'manager', 'barista'));

    -- 4. Update any tasks assigned by 'C-Suite' to 'Core' for visual consistency
    UPDATE tasks SET assigned_by = 'Core' WHERE assigned_by = 'C-Suite';
END $$;
