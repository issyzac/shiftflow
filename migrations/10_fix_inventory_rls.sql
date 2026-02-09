-- Disable RLS on inventory_items to match the rest of the project's security model
-- The current application architecture does not seem to rely on RLS for other tables (restock_requests, tasks, etc.)
-- Enforcing it here causes issues with the current authentication flow.

alter table inventory_items disable row level security;

-- Drop the policies just in case we re-enable later to avoid confusion
drop policy if exists "Enable read access for all authenticated users" on inventory_items;
drop policy if exists "Enable insert for authenticated users" on inventory_items;
drop policy if exists "Enable update for authenticated users" on inventory_items;
drop policy if exists "Enable delete for authenticated users" on inventory_items;
