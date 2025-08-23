-- Drop existing RLS policies for profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create new RLS policies for profiles that work with manual auth
CREATE POLICY "Allow viewing profiles for manual auth" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Allow managing profiles for manual auth" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also update user_roles table policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Allow viewing user roles for manual auth" 
ON public.user_roles 
FOR SELECT 
USING (true);

CREATE POLICY "Allow managing user roles for manual auth" 
ON public.user_roles 
FOR ALL 
USING (true) 
WITH CHECK (true);