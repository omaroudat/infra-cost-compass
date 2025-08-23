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

      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
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
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-semibold ${isRTL ? 'text-right font-arabic' : 'text-left'}`}>
              {t('progressSummary.tableTitle', 'Progress Summary Table')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressSummaryTable data={summaryData} isRTL={isRTL} />
          </CardContent>
        </Card>
      )}

      {selectedBOQItem && (!summaryData || summaryData.segments.length === 0) && (
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="py-8">
            <div className={`text-center text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('progressSummary.noData', 'No progress data available for the selected BOQ item')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressSummary;