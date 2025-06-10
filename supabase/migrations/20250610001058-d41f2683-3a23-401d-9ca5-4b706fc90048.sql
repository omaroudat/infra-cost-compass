
-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Allow admins to insert new profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE USING (public.get_current_user_role() = 'admin');

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (public.get_current_user_role() = 'admin');
