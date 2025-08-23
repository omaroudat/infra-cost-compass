-- Create a proper admin user with valid UUID
INSERT INTO public.profiles (id, username, full_name, role, active_role, department, password) 
VALUES (
  gen_random_uuid(),
  'Admin',
  'Administrator', 
  'admin',
  'admin'::app_role,
  'Management',
  'Admin123'
) ON CONFLICT (username) DO NOTHING;

-- Get the admin user ID and create corresponding user_roles entry
DO $$ 
DECLARE 
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM public.profiles WHERE username = 'Admin';
  
  -- Create user_roles entry if it doesn't exist
  INSERT INTO public.user_roles (user_id, role, is_active)
  VALUES (admin_user_id, 'admin'::app_role, true)
  ON CONFLICT DO NOTHING;
END $$;