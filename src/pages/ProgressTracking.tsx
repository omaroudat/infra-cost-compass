
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LanguageSelector } from '../components/progress/LanguageSelector';
import { ProgressCard } from '../components/progress/ProgressCard';
import { useProgressCalculations } from '../hooks/useProgressCalculations';

const ProgressTracking = () => {
  const { wirs, boqItems, breakdownItems } = useAppContext();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  const formatter = new Intl.NumberFormat('ar-SA', {
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
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Progress Tracking / سجل المتابعة</h2>
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>
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
