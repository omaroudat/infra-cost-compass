import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Plus, X } from 'lucide-react';
import { ModernFileUpload } from '@/components/attachments/ModernFileUpload';
import { AttachmentGrid } from '@/components/attachments/AttachmentGrid';
import { useAttachments } from '@/hooks/useAttachments';
import { useLanguage } from '@/context/LanguageContext';
import { Attachment } from '@/types/attachments';
import { useToast } from '@/hooks/use-toast';

const Attachments = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const {
    attachments,
    loading,
    uploadingFiles,
    uploadMultipleFiles,
    deleteAttachment,
    getDownloadUrl,
    updateAttachment
  } = useAttachments();

  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    tags: [] as string[],
    tagInput: ''
  });

  // Handle file download
  const handleDownload = async (storagePath: string, fileName: string) => {
    try {
      const url = await getDownloadUrl(storagePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate download URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  // Handle edit dialog
  const handleEdit = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setEditForm({
      description: attachment.description || '',
      tags: attachment.tags || [],
      tagInput: ''
    });
  };

  const addTag = () => {
    const tag = editForm.tagInput.trim();
    if (tag && !editForm.tags.includes(tag)) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingAttachment) return;

    await updateAttachment(editingAttachment.id, {
      description: editForm.description,
      tags: editForm.tags
    });

    setEditingAttachment(null);
    setEditForm({ description: '', tags: [], tagInput: '' });
  };

  // Statistics
  const totalFiles = attachments.length;
  const totalSize = attachments.reduce((sum, att) => sum + att.file_size, 0);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {language === 'ar' ? 'إدارة المرفقات' : 'Attachments Management'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'رفع وإدارة جميع ملفات المشروع بشكل آمن ومنظم' 
                : 'Upload and manage all project files securely and efficiently'
              }
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'إجمالي الملفات' : 'Total Files'}
                  </p>
                  <p className="text-2xl font-bold text-primary">{totalFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Download className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'المساحة المستخدمة' : 'Storage Used'}
                  </p>
                  <p className="text-2xl font-bold text-blue-500">{formatFileSize(totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Upload className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الملفات النشطة' : 'Active Files'}
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {attachments.filter(att => att.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? 'تصفح الملفات' : 'Browse Files'}
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {language === 'ar' ? 'رفع ملفات' : 'Upload Files'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <AttachmentGrid
            attachments={attachments}
            onDownload={handleDownload}
            onEdit={handleEdit}
            onDelete={deleteAttachment}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'رفع ملفات جديدة' : 'Upload New Files'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModernFileUpload
                onUpload={uploadMultipleFiles}
                uploadingFiles={uploadingFiles}
                maxFiles={10}
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingAttachment} onOpenChange={() => setEditingAttachment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تحرير المرفق' : 'Edit Attachment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-name">
                {language === 'ar' ? 'اسم الملف' : 'File Name'}
              </Label>
              <Input
                id="file-name"
                value={editingAttachment?.file_name || ''}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {language === 'ar' ? 'الوصف' : 'Description'}
              </Label>
              <Textarea
                id="description"
                placeholder={language === 'ar' ? 'أدخل وصفاً للملف...' : 'Enter file description...'}
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العلامات' : 'Tags'}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'ar' ? 'أضف علامة...' : 'Add tag...'}
                  value={editForm.tagInput}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tagInput: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editForm.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1">
                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingAttachment(null)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attachments;