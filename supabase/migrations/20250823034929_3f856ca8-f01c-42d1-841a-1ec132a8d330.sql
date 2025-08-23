-- Create function for switching user roles
CREATE OR REPLACE FUNCTION public.switch_user_role(_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's active role in the profiles table
  UPDATE public.profiles 
  SET active_role = _role, 
      updated_at = now()
  WHERE id = auth.uid();
  
  -- Check if the update was successful
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;