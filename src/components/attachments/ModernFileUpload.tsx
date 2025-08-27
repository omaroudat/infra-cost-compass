import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react';
import { FileUploadStatus } from '@/types/attachments';
import { useLanguage } from '@/context/LanguageContext';

interface ModernFileUploadProps {
  onUpload: (files: File[], description?: string, tags?: string[]) => void;
  uploadingFiles: FileUploadStatus[];
  className?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export const ModernFileUpload: React.FC<ModernFileUploadProps> = ({
  onUpload,
  uploadingFiles,
  className = "",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*']
}) => {
  const { language } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="h-6 w-6 text-purple-500" />;
    if (file.type.startsWith('audio/')) return <Music className="h-6 w-6 text-green-500" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="h-6 w-6 text-orange-500" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large`);
        return false;
      }
      return true;
    });

    if (selectedFiles.length + validFiles.length > maxFiles) {
      console.warn(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [maxFiles, maxSize, selectedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, description, tags);
      // Reset form
      setSelectedFiles([]);
      setDescription('');
      setTags([]);
      setTagInput('');
    }
  };

  const getStatusIcon = (status: FileUploadStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-border/50 bg-background/50 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full border-2 border-dashed transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive 
                    ? (language === 'ar' ? 'اترك الملفات هنا...' : 'Drop files here...') 
                    : (language === 'ar' ? 'اسحب الملفات هنا أو انقر للتحديد' : 'Drag files here or click to select')
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? `حد أقصى ${maxFiles} ملفات، كل ملف حتى ${formatFileSize(maxSize)}`
                    : `Maximum ${maxFiles} files, each up to ${formatFileSize(maxSize)}`
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                {language === 'ar' ? 'الملفات المحددة' : 'Selected Files'}
              </h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedFiles.length} {language === 'ar' ? 'ملف' : 'files'}
              </Badge>
            </div>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {selectedFiles.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {language === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}
              </Label>
              <Textarea
                id="description"
                placeholder={language === 'ar' ? 'أدخل وصفاً للملفات...' : 'Enter description for files...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background/50 border-border/30"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'العلامات (اختياري)' : 'Tags (Optional)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'ar' ? 'أضف علامة...' : 'Add tag...'}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="bg-background/50 border-border/30"
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
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

            <Button onClick={handleUpload} className="w-full" size="lg">
              <Upload className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'رفع الملفات' : 'Upload Files'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">
              {language === 'ar' ? 'تقدم الرفع' : 'Upload Progress'}
            </h4>
            <div className="space-y-3">
              {uploadingFiles.map((fileStatus, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileStatus.file)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{fileStatus.file.name}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(fileStatus.status)}
                          <span className="text-sm text-muted-foreground capitalize">
                            {fileStatus.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {fileStatus.status === 'uploading' && fileStatus.progress && (
                    <Progress value={fileStatus.progress.percentage} className="h-2" />
                  )}
                  {fileStatus.status === 'error' && fileStatus.error && (
                    <p className="text-sm text-destructive">{fileStatus.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};