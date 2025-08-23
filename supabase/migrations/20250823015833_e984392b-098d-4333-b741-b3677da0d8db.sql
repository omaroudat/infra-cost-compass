-- Fix RLS policies for user management and create initial admin user

-- Add admin policy for profiles table to allow admins to insert profiles for other users
CREATE POLICY "Admins can create profiles for others" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Insert initial admin user so someone can login
INSERT INTO public.profiles (
  id, 
  username, 
  full_name, 
  role, 
  active_role, 
  password,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'System Administrator', 
  'admin',
  'admin'::app_role,
  'admin123',
  now(),
  now()
);

-- Add the admin role to user_roles table for the new admin user
INSERT INTO public.user_roles (
  user_id,
  role,
  assigned_at,
  is_active
) 
SELECT 
  id,
  'admin'::app_role,
  now(),
  true
FROM public.profiles 
WHERE username = 'admin';