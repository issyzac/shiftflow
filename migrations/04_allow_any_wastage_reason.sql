-- Drop the constraint that restricts reason to only 'expired' or 'damaged'
-- This allows baristas to type detailed reasons in the textarea
alter table wastage_logs drop constraint if exists wastage_logs_reason_check;
