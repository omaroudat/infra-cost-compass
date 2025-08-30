import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Search, FileText, X } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import { Attachment } from '@/types/attachments';
import { WIR } from '@/types';

interface WIRAttachmentSelectorProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isViewOnly?: boolean;
}

const WIRAttachmentSelector: React.FC<WIRAttachmentSelectorProps> = ({
  newWIR,
  setNewWIR,
  isViewOnly = false
}) => {
  const { attachments, loading } = useAttachments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAttachments, setFilteredAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (attachments) {
      const filtered = attachments.filter(attachment =>
        attachment.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAttachments(filtered);
    }
  }, [attachments, searchTerm]);

  const selectedAttachments = newWIR.attachments || [];
  
  const handleAttachmentToggle = (attachmentId: string) => {
    if (isViewOnly) return;
    
    const updatedAttachments = selectedAttachments.includes(attachmentId)
      ? selectedAttachments.filter(id => id !== attachmentId)
      : [...selectedAttachments, attachmentId];
    
    setNewWIR(prev => ({
      ...prev,
      attachments: updatedAttachments
    }));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSelectedAttachmentsData = () => {
    if (!attachments) return [];
    return attachments.filter(att => selectedAttachments.includes(att.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Attachments Summary */}
      {selectedAttachments.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">Selected Attachments ({selectedAttachments.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedAttachmentsData().map((attachment) => (
              <Badge
                key={attachment.id}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2"
              >
                <FileText className="w-3 h-3" />
                {attachment.file_name}
                {!isViewOnly && (
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleAttachmentToggle(attachment.id)}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search and Selection */}
      {!isViewOnly && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search attachments by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <ScrollArea className="h-64 border rounded-lg">
            <div className="p-3 space-y-2">
              {filteredAttachments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No attachments match your search.' : 'No attachments available.'}
                </div>
              ) : (
                filteredAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedAttachments.includes(attachment.id)}
                      onCheckedChange={() => handleAttachmentToggle(attachment.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{attachment.file_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {attachment.file_type}
                        </Badge>
                      </div>
                      
                      {attachment.description && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                          {attachment.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>Uploaded {formatDate(attachment.uploaded_at)}</span>
                      </div>
                      
                      {attachment.tags && attachment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {attachment.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default WIRAttachmentSelector;