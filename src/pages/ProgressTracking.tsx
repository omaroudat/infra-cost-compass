
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ProgressCard } from '../components/progress/ProgressCard';
import { useProgressCalculations } from '../hooks/useProgressCalculations';

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
    getWIRAmountForBOQ
  } = useProgressCalculations(boqItems, breakdownItems, wirs);
  
  const progressData = calculateBOQProgress();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('progress.title')}</h2>
      </div>
      
      <div className="grid gap-6">
        {progressData.map((progress) => {
          const boqItem = getBOQItem(progress.boqItemId);
          if (!boqItem) return null;
          
          const relatedWIRs = getWIRsForBOQ(progress.boqItemId);
          
          return (
            <ProgressCard
              key={progress.boqItemId}
              progress={progress}
              boqItem={boqItem}
              relatedWIRs={relatedWIRs}
              breakdownItems={breakdownItems}
              language={language}
              formatter={formatter}
              getWIRAmountForBOQ={getWIRAmountForBOQ}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracking;
