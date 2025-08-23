-- Enable RLS on all tables that have policies but RLS disabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fix the profiles policies to avoid recursion issues
-- Remove the problematic policy first
DROP POLICY IF EXISTS "Admins can create profiles for others" ON public.profiles;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create proper policies for profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Allow users to view all profiles (needed for user management interface)
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create proper policies for user_roles  
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());