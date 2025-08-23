-- Fix RLS issues by enabling RLS on all required tables
ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakdown_items ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.wirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix function search path issues by adding SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_roles(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.switch_user_role(_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;