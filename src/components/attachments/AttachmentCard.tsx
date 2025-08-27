import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  File,
  Image,
  Video,
  Music,
  Archive,
  FileText,
  Calendar,
  User,
  Tag,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Attachment } from '@/types/attachments';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentCardProps {
  attachment: Attachment;
  onDownload: (storagePath: string, fileName: string) => void;
  onEdit: (attachment: Attachment) => void;
  onDelete: (id: string, storagePath: string) => void;
  onPreview?: (attachment: Attachment) => void;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onDownload,
  onEdit,
  onDelete,
  onPreview
}) => {
  const { language } = useLanguage();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5 text-orange-500" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (fileType: string) => {
    return fileType.startsWith('image/') || fileType === 'application/pdf' || fileType.startsWith('text/');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 bg-card/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-background/50 border border-border/30">
              {getFileIcon(attachment.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-foreground" title={attachment.file_name}>
                {attachment.file_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(attachment.file_size)}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {canPreview(attachment.file_type) && onPreview && (
                <DropdownMenuItem onClick={() => onPreview(attachment)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'معاينة' : 'Preview'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDownload(attachment.storage_path, attachment.file_name)}>
                <Download className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تحميل' : 'Download'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(attachment)}>
                <Edit className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تحرير' : 'Edit'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(attachment.id, attachment.storage_path)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حذف' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {attachment.description && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {attachment.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {attachment.tags && attachment.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>{language === 'ar' ? 'العلامات' : 'Tags'}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {attachment.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {tag}
                </Badge>
              ))}
              {attachment.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  +{attachment.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(attachment.uploaded_at), { addSuffix: true })}
            </span>
          </div>
          {attachment.uploaded_by && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{language === 'ar' ? 'مرفوع بواسطة' : 'Uploaded by'} Admin</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(attachment.storage_path, attachment.file_name)}
            className="flex-1 bg-background/50 border-border/30 hover:bg-primary/5"
          >
            <Download className="h-4 w-4 mr-1" />
            {language === 'ar' ? 'تحميل' : 'Download'}
          </Button>
          {canPreview(attachment.file_type) && onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(attachment)}
              className="bg-background/50 border-border/30 hover:bg-primary/5"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};