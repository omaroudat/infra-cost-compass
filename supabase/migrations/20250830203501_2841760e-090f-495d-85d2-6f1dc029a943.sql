-- Add attachments field to WIRs table to link attachments
ALTER TABLE public.wirs 
ADD COLUMN attachments uuid[] DEFAULT '{}';

-- Add comment to document the new field
COMMENT ON COLUMN public.wirs.attachments IS 'Array of attachment IDs linked to this WIR';