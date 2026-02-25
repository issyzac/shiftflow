-- Migration: 13_shift_types_and_handover
-- Description: Adds shift_type and handover_notes to shifts table to support morning/afternoon sequential shifts

-- Add shift_type column, check constraint to ensure valid values
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS shift_type TEXT CHECK (shift_type IN ('morning', 'afternoon'));

-- Add handover_notes to capture end-of-shift communication for the next shift
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS handover_notes TEXT;
