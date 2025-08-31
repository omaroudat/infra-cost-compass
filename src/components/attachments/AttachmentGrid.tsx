import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComboBox } from '@/components/ui/enhanced-dropdowns';
import { Search, Filter, Grid3X3, List, SortAsc, SortDesc } from 'lucide-react';
import { AttachmentCard } from './AttachmentCard';
import { Attachment } from '@/types/attachments';
import { useLanguage } from '@/context/LanguageContext';

interface AttachmentGridProps {
  attachments: Attachment[];
  onDownload: (storagePath: string, fileName: string) => void;
  onEdit: (attachment: Attachment) => void;
  onDelete: (id: string, storagePath: string) => void;
  onPreview?: (attachment: Attachment) => void;
  loading?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'date' | 'type';
type SortOrder = 'asc' | 'desc';

export const AttachmentGrid: React.FC<AttachmentGridProps> = ({
  attachments,
  onDownload,
  onEdit,
  onDelete,
  onPreview,
  loading = false
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique file types and tags for filtering
  const fileTypes = [...new Set(attachments.map(att => att.file_type))];
  const allTags = [...new Set(attachments.flatMap(att => att.tags || []))];

  // Filter and sort attachments
  const filteredAttachments = attachments
    .filter(attachment => {
      // Search filter
      const searchMatch = 
        attachment.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attachment.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (searchTerm && !searchMatch) return false;

      // Type filter
      if (selectedType !== 'all' && attachment.file_type !== selectedType) return false;

      // Tag filter
      if (selectedTag !== 'all' && (!attachment.tags || !attachment.tags.includes(selectedTag))) return false;

      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.file_name.toLowerCase();
          bValue = b.file_name.toLowerCase();
          break;
        case 'size':
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        case 'date':
          aValue = new Date(a.uploaded_at).getTime();
          bValue = new Date(b.uploaded_at).getTime();
          break;
        case 'type':
          aValue = a.file_type.toLowerCase();
          bValue = b.file_type.toLowerCase();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      }
    });

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return language === 'ar' ? 'صورة' : 'Image';
    if (type.startsWith('video/')) return language === 'ar' ? 'فيديو' : 'Video';
    if (type.startsWith('audio/')) return language === 'ar' ? 'صوت' : 'Audio';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('document') || type.includes('word')) return language === 'ar' ? 'مستند' : 'Document';
    if (type.includes('spreadsheet') || type.includes('excel')) return language === 'ar' ? 'جدول بيانات' : 'Spreadsheet';
    return type.split('/')[1]?.toUpperCase() || 'File';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={language === 'ar' ? 'البحث في المرفقات...' : 'Search attachments...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/30"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <ComboBox
                options={[
                  { value: 'all', label: language === 'ar' ? 'جميع الأنواع' : 'All Types' },
                  ...fileTypes.map(type => ({ 
                    value: type, 
                    label: getFileTypeLabel(type) 
                  }))
                ]}
                value={selectedType}
                onValueChange={(value) => setSelectedType(value || 'all')}
                placeholder={language === 'ar' ? 'نوع الملف' : 'File Type'}
                searchable={false}
                className="w-[140px] h-10"
              />

              {allTags.length > 0 && (
                <ComboBox
                  options={[
                    { value: 'all', label: language === 'ar' ? 'جميع العلامات' : 'All Tags' },
                    ...allTags.map(tag => ({ 
                      value: tag, 
                      label: tag 
                    }))
                  ]}
                  value={selectedTag}
                  onValueChange={(value) => setSelectedTag(value || 'all')}
                  placeholder={language === 'ar' ? 'العلامة' : 'Tag'}
                  searchable={true}
                  className="w-[140px] h-10"
                />
              )}

              <ComboBox
                options={[
                  { value: 'name', label: language === 'ar' ? 'الاسم' : 'Name' },
                  { value: 'size', label: language === 'ar' ? 'الحجم' : 'Size' },
                  { value: 'date', label: language === 'ar' ? 'التاريخ' : 'Date' },
                  { value: 'type', label: language === 'ar' ? 'النوع' : 'Type' }
                ]}
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortBy)}
                searchable={false}
                className="w-[120px] h-10"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-background/50 border-border/30"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <div className="flex border border-border/30 rounded-md bg-background/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r border-border/30"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedType !== 'all' || selectedTag !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {language === 'ar' ? 'البحث:' : 'Search:'} {searchTerm}
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {language === 'ar' ? 'النوع:' : 'Type:'} {getFileTypeLabel(selectedType)}
                </Badge>
              )}
              {selectedTag !== 'all' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {language === 'ar' ? 'العلامة:' : 'Tag:'} {selectedTag}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {language === 'ar' ? 'المرفقات' : 'Attachments'}
            {filteredAttachments.length !== attachments.length && (
              <span className="text-muted-foreground ml-2">
                ({filteredAttachments.length} {language === 'ar' ? 'من' : 'of'} {attachments.length})
              </span>
            )}
          </h3>
          <Badge variant="outline" className="bg-background/50">
            {filteredAttachments.length} {language === 'ar' ? 'عنصر' : 'items'}
          </Badge>
        </div>

        {filteredAttachments.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">
                  {language === 'ar' ? 'لا توجد مرفقات' : 'No attachments found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'جرب تعديل معايير البحث أو التصفية' : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredAttachments.map(attachment => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onDownload={onDownload}
                onEdit={onEdit}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};