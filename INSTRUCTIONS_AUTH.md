# Authentication & Access Control Setup

We have implemented a Role-Based PIN Access Control system for the Daily Operations Tool.

## 1. Database Update
We have added a `pin` column to the `profiles` table.
If you are setting up a fresh database, `setup.sql` is already updated.
If you are updating an existing database, run the migration file located at: `migrations/01_add_pin_to_profiles.sql` in your Supabase SQL Editor.

## 2. Setting User PINs
For users to log in, they must have a 4-digit PIN set in the `profiles` table.
You can set this via the Supabase Dashboard Table Editor.

**Example SQL to set a default PIN for all existing users:**
```sql
UPDATE profiles SET pin = '1234' WHERE pin IS NULL;
```

## 3. Login Flow
1. **Select Role**: Choose from Barista, Manager, or C-Suite.
2. **Select User**: Pick your name from the list.
3. **Enter PIN**: Enter your assigned 4-digit PIN.

## 4. Persistent Shifts (Baristas)
- When a Barista starts a shift, it is recorded in the `shifts` table.
- If the browser is closed or refreshed, the session remains active.
- To exit the shift, use the **"End Shift"** button in the dashboard header.
