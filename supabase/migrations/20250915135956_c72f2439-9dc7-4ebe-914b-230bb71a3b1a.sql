-- Add type_of_rock column to wirs table
ALTER TABLE public.wirs ADD COLUMN type_of_rock TEXT CHECK (type_of_rock IN ('Rock', 'Soil'));