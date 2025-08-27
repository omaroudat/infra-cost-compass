
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ProgressCard } from '../components/progress/ProgressCard';
import { ProgressExportButton } from '../components/progress/ProgressExportButton';
import { ProgressFilter } from '../components/progress/ProgressFilter';
import { useProgressCalculations } from '../hooks/useProgressCalculations';
import { BOQItem } from '@/types';

const ProgressTracking = () => {
  const { wirs, boqItems, breakdownItems } = useAppContext();
  const { t, language } = useLanguage();
  const [filteredBOQItems, setFilteredBOQItems] = useState<BOQItem[]>(boqItems);
  
  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const {
    calculateBOQProgress,
    getBOQItem,
    getWIRsForBOQ,
    getWIRAmountForBOQ,
    calculateChildrenApprovedAmount
  } = useProgressCalculations(boqItems, breakdownItems, wirs);
  
  const progressData = calculateBOQProgress();
  
  // Function to render BOQ items hierarchically
  const renderBOQItem = (boqItem: BOQItem, level: number = 0): React.ReactNode => {
    const progress = progressData.find(p => p.boqItemId === boqItem.id);
    if (!progress) return null;
    
    const relatedWIRs = getWIRsForBOQ(progress.boqItemId);
    const isParent = boqItem.children && boqItem.children.length > 0;
    
    return (
      <ProgressCard
        key={boqItem.id}
        progress={progress}
        boqItem={boqItem}
        relatedWIRs={relatedWIRs}
        breakdownItems={breakdownItems}
        language={language}
        formatter={formatter}
        getWIRAmountForBOQ={getWIRAmountForBOQ}
        level={level}
        isParent={isParent}
        calculateChildrenApprovedAmount={calculateChildrenApprovedAmount}
      >
        {boqItem.children?.map(child => renderBOQItem(child, level + 1))}
      </ProgressCard>
    );
  };

  // Filter to show only top-level items (items without parentId or with level 0)
  const topLevelItems = filteredBOQItems.filter(item => !item.parentId || item.level === 0);

  const handleFilterChange = (filtered: BOQItem[]) => {
    setFilteredBOQItems(filtered);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('progress.title')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تتبع تقدم عناصر كشف الكميات' : 'Track BOQ items progress and completion status'}
          </p>
        </div>
        <ProgressExportButton
          boqItems={boqItems}
          breakdownItems={breakdownItems}
          wirs={wirs}
          language={language}
        />
      </div>

      <ProgressFilter
        boqItems={boqItems}
        progressData={progressData}
        onFilterChange={handleFilterChange}
        className="animate-fade-in"
      />
      
      <div className="space-y-4">
        {topLevelItems.length > 0 ? (
          topLevelItems.map(boqItem => renderBOQItem(boqItem, 0))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-lg font-medium">
                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </p>
              <p className="text-sm">
                {language === 'ar' ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracking;
