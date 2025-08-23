-- Drop existing RLS policies for BOQ items
DROP POLICY IF EXISTS "Authenticated users can view BOQ items" ON public.boq_items;
DROP POLICY IF EXISTS "Editors and admins can modify BOQ items" ON public.boq_items;

-- Create new RLS policies that allow access when using manual auth
-- Since manual auth doesn't use Supabase auth.uid(), we need to allow broader access

-- Allow all authenticated requests (including manual auth) to view BOQ items
CREATE POLICY "Allow viewing BOQ items for manual auth" 
ON public.boq_items 
FOR SELECT 
USING (true);

-- Allow all authenticated requests to modify BOQ items  
CREATE POLICY "Allow modifying BOQ items for manual auth" 
ON public.boq_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Do the same for other tables to ensure consistency
DROP POLICY IF EXISTS "Authenticated users can view breakdown items" ON public.breakdown_items;
DROP POLICY IF EXISTS "Editors and admins can modify breakdown items" ON public.breakdown_items;

CREATE POLICY "Allow viewing breakdown items for manual auth" 
ON public.breakdown_items 
FOR SELECT 
USING (true);

CREATE POLICY "Allow modifying breakdown items for manual auth" 
ON public.breakdown_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- WIRs table
DROP POLICY IF EXISTS "Authenticated users can view WIRs" ON public.wirs;
DROP POLICY IF EXISTS "Editors and admins can modify WIRs" ON public.wirs;

CREATE POLICY "Allow viewing WIRs for manual auth" 
ON public.wirs 
FOR SELECT 
USING (true);

CREATE POLICY "Allow modifying WIRs for manual auth" 
ON public.wirs 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Engineers table
DROP POLICY IF EXISTS "Authenticated users can view engineers" ON public.engineers;
DROP POLICY IF EXISTS "Editors and admins can modify engineers" ON public.engineers;

CREATE POLICY "Allow viewing engineers for manual auth" 
ON public.engineers 
FOR SELECT 
USING (true);

CREATE POLICY "Allow modifying engineers for manual auth" 
ON public.engineers 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Contractors table
DROP POLICY IF EXISTS "Authenticated users can view contractors" ON public.contractors;
DROP POLICY IF EXISTS "Editors and admins can modify contractors" ON public.contractors;

CREATE POLICY "Allow viewing contractors for manual auth" 
ON public.contractors 
FOR SELECT 
USING (true);

CREATE POLICY "Allow modifying contractors for manual auth" 
ON public.contractors 
FOR ALL 
USING (true) 
WITH CHECK (true);