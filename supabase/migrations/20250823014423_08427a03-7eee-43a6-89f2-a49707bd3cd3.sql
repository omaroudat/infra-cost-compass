-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer', 'data_entry');

-- Create user_roles table to support multiple roles per user
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
        AND ur.is_active = true
    )
);

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

-- Create function to get all user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true;
$$;

-- Create function to get current user roles
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.get_user_roles(auth.uid());
$$;

-- Add active_role column to profiles table for role switching
ALTER TABLE public.profiles 
ADD COLUMN active_role app_role DEFAULT 'viewer';

-- Create function to switch user role
CREATE OR REPLACE FUNCTION public.switch_user_role(_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user has this role
    IF NOT public.has_role(auth.uid(), _role) THEN
        RETURN false;
    END IF;
    
    -- Update active role in profiles
    UPDATE public.profiles 
    SET active_role = _role, updated_at = now()
    WHERE id = auth.uid();
    
    RETURN true;
END;
$$;

-- Migrate existing role data to user_roles table (only for valid users in auth.users)
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT p.id, p.role::app_role, p.created_at
FROM public.profiles p
WHERE p.role IS NOT NULL 
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profiles active_role based on existing role (only for valid users)
UPDATE public.profiles 
SET active_role = role::app_role
WHERE role IS NOT NULL 
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = profiles.id);

-- Update the handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert into profiles
    INSERT INTO public.profiles (id, email, full_name, username, role, active_role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        'viewer',
        'viewer'::app_role
    );
    
    -- Assign default viewer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer'::app_role);
    
    RETURN NEW;
END;
$$;

-- Update existing RLS policies to use the new role system
-- Update BOQ items policy
DROP POLICY IF EXISTS "Editors and admins can modify BOQ items" ON public.boq_items;
CREATE POLICY "Editors and admins can modify BOQ items"
ON public.boq_items
FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
);

-- Update breakdown items policy  
DROP POLICY IF EXISTS "Editors and admins can modify breakdown items" ON public.breakdown_items;
CREATE POLICY "Editors and admins can modify breakdown items"
ON public.breakdown_items
FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
);

-- Update WIRs policy
DROP POLICY IF EXISTS "Editors and admins can modify WIRs" ON public.wirs;
CREATE POLICY "Editors and admins can modify WIRs"
ON public.wirs
FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor') OR
    public.has_role(auth.uid(), 'data_entry')
);

-- Update contractors policy
DROP POLICY IF EXISTS "Editors and admins can modify contractors" ON public.contractors;
CREATE POLICY "Editors and admins can modify contractors"
ON public.contractors
FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
);

-- Update engineers policy
DROP POLICY IF EXISTS "Editors and admins can modify engineers" ON public.engineers;
CREATE POLICY "Editors and admins can modify engineers"
ON public.engineers
FOR ALL
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'editor')
);