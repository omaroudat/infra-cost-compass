import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ComboBox } from '@/components/ui/enhanced-dropdowns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Filter, X, TrendingUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BOQItem, BOQProgress } from '@/types';

interface ProgressFilterProps {
  boqItems: BOQItem[];
  progressData: BOQProgress[];
  onFilterChange: (filteredItems: BOQItem[]) => void;
  className?: string;
}

export interface ProgressFilters {
  searchTerm: string;
  progressStatus: 'all' | 'not-started' | 'in-progress' | 'completed' | 'over-target';
  completionRange: 'all' | '0-25' | '26-50' | '51-75' | '76-99' | '100';
}

export const ProgressFilter: React.FC<ProgressFilterProps> = ({
  boqItems,
  progressData,
  onFilterChange,
  className = ""
}) => {
  const { t, language } = useLanguage();
  
  const [filters, setFilters] = useState<ProgressFilters>({
    searchTerm: '',
    progressStatus: 'all',
    completionRange: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Get progress for a BOQ item
  const getProgress = useCallback((boqItemId: string) => {
    return progressData.find(p => p.boqItemId === boqItemId);
  }, [progressData]);

  // Determine progress status based on completion percentage
  const getProgressStatus = useCallback((progress: BOQProgress | undefined) => {
    if (!progress) return 'not-started';
    const percentage = progress.completionPercentage;
    
    if (percentage === 0) return 'not-started';
    if (percentage >= 100) return 'completed';
    if (percentage > 100) return 'over-target';
    return 'in-progress';
  }, []);

  // Check if completion percentage falls within range
  const isInCompletionRange = useCallback((percentage: number, range: string) => {
    switch (range) {
      case '0-25': return percentage >= 0 && percentage <= 25;
      case '26-50': return percentage > 25 && percentage <= 50;
      case '51-75': return percentage > 50 && percentage <= 75;
      case '76-99': return percentage > 75 && percentage < 100;
      case '100': return percentage >= 100;
      default: return true;
    }
  }, []);

  // Recursive function to check if BOQ item or its children match filters
  const itemMatchesFilters = useCallback((item: BOQItem): boolean => {
    const progress = getProgress(item.id);
    
    // Search term check
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const codeMatch = item.code.toLowerCase().includes(searchLower);
      const descMatch = item.description.toLowerCase().includes(searchLower);
      const descArMatch = item.descriptionAr?.toLowerCase().includes(searchLower);
      
      const textMatch = codeMatch || descMatch || descArMatch;
      
      // If this item doesn't match text, check if any children do
      if (!textMatch && item.children) {
        return item.children.some(child => itemMatchesFilters(child));
      }
      
      if (!textMatch) return false;
    }

    // Progress status check
    if (filters.progressStatus !== 'all') {
      const status = getProgressStatus(progress);
      if (status !== filters.progressStatus) {
        // If this item doesn't match, check if any children do
        if (item.children) {
          return item.children.some(child => itemMatchesFilters(child));
        }
        return false;
      }
    }

    // Completion range check
    if (filters.completionRange !== 'all' && progress) {
      const inRange = isInCompletionRange(progress.completionPercentage, filters.completionRange);
      if (!inRange) {
        // If this item doesn't match, check if any children do
        if (item.children) {
          return item.children.some(child => itemMatchesFilters(child));
        }
        return false;
      }
    }

    return true;
  }, [filters, getProgress, getProgressStatus, isInCompletionRange]);

  // Filter BOQ items based on current filters
  const filteredItems = useMemo(() => {
    if (!filters.searchTerm && filters.progressStatus === 'all' && filters.completionRange === 'all') {
      return boqItems;
    }

    return boqItems.filter(itemMatchesFilters);
  }, [boqItems, filters, itemMatchesFilters]);

  // Update parent component when filters change
  React.useEffect(() => {
    onFilterChange(filteredItems);
  }, [filteredItems, onFilterChange]);

  const updateFilter = (key: keyof ProgressFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      progressStatus: 'all',
      completionRange: 'all'
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.progressStatus !== 'all' || filters.completionRange !== 'all';
  const resultsCount = filteredItems.length;

  return (
    <Card className={`p-4 bg-card/50 border-border/50 ${className}`}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={language === 'ar' ? 'البحث بالكود أو الوصف...' : 'Search by code or description...'}
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-10 bg-background/50 border-border/30 focus:border-primary/50"
          />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصفية متقدمة' : 'Advanced Filters'}
          </Button>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {resultsCount} {language === 'ar' ? 'عنصر' : 'items'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/30">
            {/* Progress Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                {language === 'ar' ? 'حالة التقدم' : 'Progress Status'}
              </label>
              <ComboBox
                options={[
                  { value: 'all', label: language === 'ar' ? 'جميع الحالات' : 'All Status' },
                  { value: 'not-started', label: language === 'ar' ? 'لم يبدأ' : 'Not Started' },
                  { value: 'in-progress', label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
                  { value: 'completed', label: language === 'ar' ? 'مكتمل' : 'Completed' },
                  { value: 'over-target', label: language === 'ar' ? 'فوق الهدف' : 'Over Target' }
                ]}
                value={filters.progressStatus}
                onValueChange={(value) => updateFilter('progressStatus', value || 'all')}
                searchable={false}
                className="bg-background/50 border-border/30 h-10"
              />
            </div>

            {/* Completion Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                {language === 'ar' ? 'نطاق الإنجاز' : 'Completion Range'}
              </label>
              <ComboBox
                options={[
                  { value: 'all', label: language === 'ar' ? 'جميع النطاقات' : 'All Ranges' },
                  { value: '0-25', label: '0% - 25%' },
                  { value: '26-50', label: '26% - 50%' },
                  { value: '51-75', label: '51% - 75%' },
                  { value: '76-99', label: '76% - 99%' },
                  { value: '100', label: '100%+' }
                ]}
                value={filters.completionRange}
                onValueChange={(value) => updateFilter('completionRange', value || 'all')}
                searchable={false}
                className="bg-background/50 border-border/30 h-10"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};