import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Attachment, FileUploadStatus } from '@/types/attachments';
import { useToast } from '@/hooks/use-toast';

export const useAttachments = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
  const { toast } = useToast();

  // Fetch all attachments
  const fetchAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attachments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Upload single file
  const uploadFile = useCallback(async (
    file: File, 
    description?: string, 
    tags?: string[]
  ): Promise<Attachment | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storagePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save attachment metadata to database
      const { data, error: dbError } = await supabase
        .from('attachments')
        .insert([{
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: storagePath,
          description,
          tags
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Upload multiple files with progress tracking
  const uploadMultipleFiles = useCallback(async (
    files: File[], 
    description?: string, 
    tags?: string[]
  ) => {
    const initialStatuses: FileUploadStatus[] = files.map(file => ({
      file,
      status: 'pending'
    }));

    setUploadingFiles(initialStatuses);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to uploading
      setUploadingFiles(prev => 
        prev.map((item, idx) => 
          idx === i 
            ? { ...item, status: 'uploading' as const, progress: { loaded: 0, total: file.size, percentage: 0 } }
            : item
        )
      );

      try {
        const attachment = await uploadFile(file, description, tags);
        
        // Update status to success
        setUploadingFiles(prev => 
          prev.map((item, idx) => 
            idx === i 
              ? { ...item, status: 'success' as const, attachment }
              : item
          )
        );
      } catch (error) {
        // Update status to error
        setUploadingFiles(prev => 
          prev.map((item, idx) => 
            idx === i 
              ? { ...item, status: 'error' as const, error: 'Upload failed' }
              : item
          )
        );
      }
    }

    // Refresh attachments list
    await fetchAttachments();
    
    // Clear upload statuses after 3 seconds
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);
  }, [uploadFile, fetchAttachments]);

  // Delete attachment
  const deleteAttachment = useCallback(async (id: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Mark as inactive in database
      const { error: dbError } = await supabase
        .from('attachments')
        .update({ is_active: false })
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully"
      });

      // Refresh attachments
      await fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  }, [toast, fetchAttachments]);

  // Get download URL
  const getDownloadUrl = useCallback(async (storagePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  }, []);

  // Update attachment metadata
  const updateAttachment = useCallback(async (
    id: string, 
    updates: { description?: string; tags?: string[] }
  ) => {
    try {
      const { error } = await supabase
        .from('attachments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attachment updated successfully"
      });

      await fetchAttachments();
    } catch (error) {
      console.error('Error updating attachment:', error);
      toast({
        title: "Update Error",
        description: "Failed to update attachment",
        variant: "destructive"
      });
    }
  }, [toast, fetchAttachments]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    loading,
    uploadingFiles,
    uploadFile,
    uploadMultipleFiles,
    deleteAttachment,
    getDownloadUrl,
    updateAttachment,
    fetchAttachments
  };
};