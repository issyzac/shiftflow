ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS pos_working boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wifi_speed text CHECK (wifi_speed IN ('fast', 'normal', 'slow', 'none')),
ADD COLUMN IF NOT EXISTS electricity_units numeric;
