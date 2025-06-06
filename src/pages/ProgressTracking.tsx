
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ProgressCard } from '../components/progress/ProgressCard';
import { ProgressExportButton } from '../components/progress/ProgressExportButton';
import { useProgressCalculations } from '../hooks/useProgressCalculations';
import { BOQItem } from '@/types';

const ProgressTracking = () => {
  const { wirs, boqItems, breakdownItems } = useAppContext();
  const { t, language } = useLanguage();
  
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
  const topLevelItems = boqItems.filter(item => !item.parentId || item.level === 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('progress.title')}</h2>
        <ProgressExportButton
          boqItems={boqItems}
          breakdownItems={breakdownItems}
          wirs={wirs}
          language={language}
        />
      </div>
      
      <div className="space-y-4">
        {topLevelItems.map(boqItem => renderBOQItem(boqItem, 0))}
      </div>
    </div>
  );
};

export default ProgressTracking;
