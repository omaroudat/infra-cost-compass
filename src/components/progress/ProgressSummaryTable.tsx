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
    if (wirNumbers.length === 0) return '-';
    
    return (
      <div className="flex flex-wrap gap-1">
        {wirNumbers.map((wirNumber, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          >
            {wirNumber}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.sequence', '#')}
            </TableHead>
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.manholeFrom', 'From')}
            </TableHead>
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.manholeTo', 'To')}
            </TableHead>
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.zone', 'Zone')}
            </TableHead>
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.road', 'Road')}
            </TableHead>
            <TableHead className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.line', 'Line')}
            </TableHead>
            {data.breakdownItems.map((breakdown) => (
              <TableHead 
                key={breakdown.id} 
                className={`font-semibold text-gray-900 min-w-[120px] ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-medium text-xs text-gray-700">
                    {isRTL && breakdown.keywordAr ? breakdown.keywordAr : breakdown.keyword}
                  </div>
                  {breakdown.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {isRTL && breakdown.descriptionAr ? breakdown.descriptionAr : breakdown.description}
                    </div>
                  )}
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    WIR. Ref
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
                border-b border-gray-100 hover:bg-gray-50/50 transition-colors
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
              `}
            >
              <TableCell className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {segment.sequence}
              </TableCell>
              <TableCell className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="font-medium text-gray-800">
                  {segment.manholeFrom || '-'}
                </span>
              </TableCell>
              <TableCell className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="font-medium text-gray-800">
                  {segment.manholeTo || '-'}
                </span>
              </TableCell>
              <TableCell className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-gray-600">
                  {segment.zone || '-'}
                </span>
              </TableCell>
              <TableCell className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-gray-600">
                  {segment.road || '-'}
                </span>
              </TableCell>
              <TableCell className={`${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-gray-600">
                  {segment.line || '-'}
                </span>
              </TableCell>
              {data.breakdownItems.map((breakdown) => (
                <TableCell 
                  key={breakdown.id} 
                  className={`${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {renderWIRBadges(segment.breakdownWIRs[breakdown.id] || [])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {data.segments.length === 0 && (
        <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('progressSummary.noSegments', 'No manhole segments found for this BOQ item')}
        </div>
      )}
    </div>
  );
};