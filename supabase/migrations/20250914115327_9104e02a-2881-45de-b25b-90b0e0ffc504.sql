-- Update the profiles table role check constraint to include management role
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text, 'data_entry'::text, 'management'::text]));