-- Add new location and technical fields to WIRs table
ALTER TABLE public.wirs 
ADD COLUMN IF NOT EXISTS manhole_from TEXT,
ADD COLUMN IF NOT EXISTS manhole_to TEXT,
ADD COLUMN IF NOT EXISTS zone TEXT,
ADD COLUMN IF NOT EXISTS road TEXT,
ADD COLUMN IF NOT EXISTS line TEXT;