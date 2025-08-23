import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressSummaryTable } from '@/components/progress/ProgressSummaryTable';
import { useProgressSummaryData } from '@/hooks/useProgressSummaryData';

const ProgressSummary = () => {
  const { boqItems } = useAppContext();
  const { t, isRTL } = useLanguage();
  const [selectedBOQItem, setSelectedBOQItem] = useState<string>('');

  // Get only leaf nodes (items without children)
  const leafBOQItems = boqItems.filter(item => {
    const hasChildren = boqItems.some(child => child.parentId === item.id);
    return !hasChildren;
  });

  const summaryData = useProgressSummaryData(selectedBOQItem);

  return (
    <div className="space-y-6">
      <div className={`flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('progressSummary.title', 'Progress Summary')}
        </h1>
        <p className="text-gray-600">
          {t('progressSummary.description', 'View detailed progress for each BOQ item with manhole segments and associated WIRs')}
        </p>
      </div>

      <Card className="shadow-lg border border-border bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className={`text-lg font-bold text-foreground flex items-center gap-2 ${isRTL ? 'text-right font-arabic flex-row-reverse' : 'text-left'}`}>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            {t('progressSummary.selectBOQ', 'Select BOQ Item')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBOQItem} onValueChange={setSelectedBOQItem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('progressSummary.selectPlaceholder', 'Select a BOQ item to view progress')} />
            </SelectTrigger>
            <SelectContent>
              {leafBOQItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-medium">{item.code}</span>
                    <span className="text-gray-500 ml-2">
                      {isRTL && item.descriptionAr ? item.descriptionAr : item.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBOQItem && summaryData && (
        <Card className="shadow-lg border border-border bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className={`text-lg font-bold text-foreground flex items-center gap-2 ${isRTL ? 'text-right font-arabic flex-row-reverse' : 'text-left'}`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {t('progressSummary.tableTitle', 'Progress Summary Table')}
              <span className="text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-1 rounded-md ml-2">
                Approved WIRs Only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressSummaryTable data={summaryData} isRTL={isRTL} />
          </CardContent>
        </Card>
      )}

      {selectedBOQItem && (!summaryData || summaryData.segments.length === 0) && (
        <Card className="shadow-lg border border-border bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-medium text-lg">
                    {t('progressSummary.noData', 'No progress data available for the selected BOQ item')}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Only approved WIRs (results A or B) are displayed in the progress summary
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressSummary;