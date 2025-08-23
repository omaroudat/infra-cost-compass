-- Enable real-time updates for boq_items table
ALTER TABLE boq_items REPLICA IDENTITY FULL;

-- Add boq_items to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE boq_items;