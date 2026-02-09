-- Clear all transactional data while preserving configuration data (locations, profiles)

BEGIN;

-- 1. Truncate transactional tables (using CASCADE to handle foreign key dependencies)
-- We need to clear:
-- - wastage_logs (references shifts)
-- - task_logs (references shifts, tasks)
-- - restock_requests (references shifts)
-- - maintenance_tickets (references locations)
-- - shifts (references locations, profiles)
-- - tasks (references locations)

TRUNCATE TABLE 
  wastage_logs,
  task_logs,
  restock_requests,
  maintenance_tickets,
  shifts,
  tasks
CASCADE;

COMMIT;
