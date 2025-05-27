
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BOQItem, BOQProgress, BreakdownItem, WIR } from '@/types';
import { useLanguage } from '../../context/LanguageContext';
import { BreakdownProgress } from './BreakdownProgress';
import { RelatedWIRsTable } from './RelatedWIRsTable';

interface ProgressCardProps {
  progress: BOQProgress;
  boqItem: BOQItem;
  relatedWIRs: WIR[];
  breakdownItems: BreakdownItem[];
  language: 'en' | 'ar';
  formatter: Intl.NumberFormat;
  getWIRAmountForBOQ: (wir: WIR, boqId: string) => number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  boqItem,
  relatedWIRs,
  breakdownItems,
  language,
  formatter,
  getWIRAmountForBOQ
}) => {
  const { t } = useLanguage();
  const boqTotalAmount = boqItem.quantity * boqItem.unitRate;

  // Always use English number formatting for quantities
  const numberFormatter = new Intl.NumberFormat('en-US');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">{boqItem.code}</span>
            <h3 className="text-lg font-semibold">
              {language === 'en' ? boqItem.description : (boqItem.descriptionAr || boqItem.description)}
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              {t('progress.quantity')}: {numberFormatter.format(boqItem.quantity)} {language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit)} | 
              {' '}{t('progress.unitRate')}: {formatter.format(boqItem.unitRate)} | 
              {' '}{t('progress.totalValue')}: {formatter.format(boqTotalAmount)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {progress.completionPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {formatter.format(progress.completedQuantity)} / {formatter.format(boqTotalAmount)}
            </div>
          </div>
        </CardTitle>
        <Progress value={progress.completionPercentage} className="h-3" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <BreakdownProgress
          breakdownProgress={progress.breakdownProgress}
          breakdownItems={breakdownItems}
          language={language}
        />
        
        <RelatedWIRsTable
          wirs={relatedWIRs}
          boqItemId={progress.boqItemId}
          language={language}
          formatter={formatter}
          getWIRAmountForBOQ={getWIRAmountForBOQ}
        />
      </CardContent>
    </Card>
  );
};
