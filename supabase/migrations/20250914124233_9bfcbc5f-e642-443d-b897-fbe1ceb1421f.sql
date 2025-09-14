-- Add start_task_on_site field to wirs table
ALTER TABLE public.wirs 
ADD COLUMN start_task_on_site date;