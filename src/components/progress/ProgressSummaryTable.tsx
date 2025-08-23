import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProgressSummaryData } from '@/hooks/useProgressSummaryData';
import { useLanguage } from '@/context/LanguageContext';
import { Hash, MapPin, Navigation } from 'lucide-react';

interface ProgressSummaryTableProps {
  data: ProgressSummaryData;
  isRTL: boolean;
}

export const ProgressSummaryTable: React.FC<ProgressSummaryTableProps> = ({ data, isRTL }) => {
  const { t } = useLanguage();

  const renderWIRChips = (wirNumbers: string[]) => {
    if (wirNumbers.length === 0) return (
      <span className="text-muted-foreground/50 text-xs font-medium">—</span>
    );
    
    return (
      <div className="flex flex-wrap gap-1">
        {wirNumbers.map((wirNumber, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors duration-200"
                >
                  {wirNumber.split('-').pop() || wirNumber}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{wirNumber}</p>
                <p className="text-xs text-muted-foreground">Status: Approved</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  const renderManholeChip = (value: string) => {
    if (!value || value === '—') return (
      <span className="text-muted-foreground/50 text-xs">—</span>
    );
    
    return (
      <Badge 
        variant="outline" 
        className="text-xs font-mono font-semibold bg-primary/5 text-primary border-primary/20 px-2 py-1"
      >
        {value}
      </Badge>
    );
  };

  const truncateText = (text: string, maxLength: number = 25) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto max-h-[70vh]">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-border">
            <TableRow className="hover:bg-muted/90 transition-colors">
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="text-sm">#</span>
                </div>
              </TableHead>
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">From</span>
                </div>
              </TableHead>
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">To</span>
                </div>
              </TableHead>
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-sm">Zone</span>
              </TableHead>
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Road</span>
                </div>
              </TableHead>
              <TableHead className={`font-semibold text-foreground py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-sm">Line</span>
              </TableHead>
              {data.breakdownItems.map((breakdown) => {
                const displayTitle = isRTL && breakdown.keywordAr ? breakdown.keywordAr : breakdown.keyword;
                const description = isRTL && breakdown.descriptionAr ? breakdown.descriptionAr : breakdown.description;
                const fullTitle = description || displayTitle || '';
                
                return (
                  <TableHead 
                    key={breakdown.id} 
                    className={`font-semibold text-foreground min-w-[120px] py-3 px-3 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1 cursor-help">
                            <div className="text-xs font-medium text-foreground">
                              {truncateText(displayTitle || '', 20)}
                            </div>
                            <div className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">
                              WIR Refs
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-medium">{displayTitle}</p>
                          {description && description !== displayTitle && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.segments.map((segment, index) => (
              <TableRow 
                key={segment.id}
                className={`
                  border-b border-border/30 hover:bg-muted/20 transition-colors duration-200
                  ${index % 2 === 0 ? 'bg-background' : 'bg-muted/5'}
                `}
              >
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{segment.sequence}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {renderManholeChip(segment.manholeFrom || '—')}
                </TableCell>
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {renderManholeChip(segment.manholeTo || '—')}
                </TableCell>
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-muted-foreground text-sm font-medium">
                    {segment.zone || '—'}
                  </span>
                </TableCell>
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-muted-foreground text-sm font-medium">
                    {segment.road || '—'}
                  </span>
                </TableCell>
                <TableCell className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-muted-foreground text-sm font-medium">
                    {segment.line || '—'}
                  </span>
                </TableCell>
                {data.breakdownItems.map((breakdown) => (
                  <TableCell 
                    key={breakdown.id} 
                    className={`py-2 px-3 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {renderWIRChips(segment.breakdownWIRs[breakdown.id] || [])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.segments.length === 0 && (
        <div className="border-t border-border bg-muted/10">
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-muted border border-border/50">
                <MapPin className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium">
                  {t('progressSummary.noSegments', 'No manhole segments found')}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Only approved WIRs (A/B results) are displayed
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};