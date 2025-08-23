import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProgressSummaryData } from '@/hooks/useProgressSummaryData';
import { useLanguage } from '@/context/LanguageContext';

interface ProgressSummaryTableProps {
  data: ProgressSummaryData;
  isRTL: boolean;
}

export const ProgressSummaryTable: React.FC<ProgressSummaryTableProps> = ({ data, isRTL }) => {
  const { t } = useLanguage();

  const renderWIRBadges = (wirNumbers: string[]) => {
    if (wirNumbers.length === 0) return (
      <span className="text-muted-foreground text-sm font-medium">—</span>
    );
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {wirNumbers.map((wirNumber, index) => (
          <Badge 
            key={index} 
            className="text-xs font-medium bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 shadow-sm transition-all duration-200"
          >
            {wirNumber}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b-2 border-muted-foreground/20 hover:bg-muted/60">
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {t('progressSummary.sequence', '#')}
              </div>
            </TableHead>
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.manholeFrom', 'From')}
            </TableHead>
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.manholeTo', 'To')}
            </TableHead>
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.zone', 'Zone')}
            </TableHead>
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.road', 'Road')}
            </TableHead>
            <TableHead className={`font-bold text-foreground py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.line', 'Line')}
            </TableHead>
            {data.breakdownItems.map((breakdown) => (
              <TableHead 
                key={breakdown.id} 
                className={`font-bold text-foreground min-w-[140px] py-4 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className={`space-y-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-semibold text-sm text-foreground">
                    {isRTL && breakdown.keywordAr ? breakdown.keywordAr : breakdown.keyword}
                  </div>
                  {breakdown.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {isRTL && breakdown.descriptionAr ? breakdown.descriptionAr : breakdown.description}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-md">
                    <div className="w-1 h-1 rounded-full bg-primary"></div>
                    WIR Ref
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.segments.map((segment, index) => (
            <TableRow 
              key={segment.id}
              className={`
                border-b border-border/50 hover:bg-muted/30 transition-all duration-200
                ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
              `}
            >
              <TableCell className={`font-bold text-primary py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{segment.sequence}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold text-foreground bg-accent/50 px-3 py-1.5 rounded-md">
                  {segment.manholeFrom || '—'}
                </span>
              </TableCell>
              <TableCell className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold text-foreground bg-accent/50 px-3 py-1.5 rounded-md">
                  {segment.manholeTo || '—'}
                </span>
              </TableCell>
              <TableCell className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-muted-foreground font-medium">
                  {segment.zone || '—'}
                </span>
              </TableCell>
              <TableCell className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-muted-foreground font-medium">
                  {segment.road || '—'}
                </span>
              </TableCell>
              <TableCell className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-muted-foreground font-medium">
                  {segment.line || '—'}
                </span>
              </TableCell>
              {data.breakdownItems.map((breakdown) => (
                <TableCell 
                  key={breakdown.id} 
                  className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {renderWIRBadges(segment.breakdownWIRs[breakdown.id] || [])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {data.segments.length === 0 && (
        <div className="bg-muted/20 border-t border-border">
          <div className={`text-center py-12 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full"></div>
              </div>
              <p className="text-muted-foreground font-medium">
                {t('progressSummary.noSegments', 'No approved manhole segments found for this BOQ item')}
              </p>
              <p className="text-xs text-muted-foreground/70">
                Only WIRs with results A or B are displayed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};