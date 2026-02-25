-- 12_shift_checklists.sql

-- Add JSONB columns for flexible thematic checklists
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS opening_checklist JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS closing_checklist JSONB DEFAULT '{}'::jsonb;
