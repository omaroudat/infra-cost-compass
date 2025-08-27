-- Create attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Create attachments table to track uploaded files
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on attachments table
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for attachments table
CREATE POLICY "Allow viewing attachments for manual auth" 
ON public.attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Allow managing attachments for manual auth" 
ON public.attachments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create storage policies for attachments bucket
CREATE POLICY "Admin can view attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'attachments');

CREATE POLICY "Admin can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Admin can update attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'attachments');

CREATE POLICY "Admin can delete attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'attachments');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON public.attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();