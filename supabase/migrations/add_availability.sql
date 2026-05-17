-- Add availability column to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS availability text DEFAULT 'available' 
CHECK (availability IN ('available', 'not_available', 'end_of_season'));
