
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
  children?: React.ReactNode;
  level?: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  boqItem,
  relatedWIRs,
  breakdownItems,
  language,
  formatter,
  getWIRAmountForBOQ,
  children,
  level = 0
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const boqTotalAmount = boqItem.quantity * boqItem.unitRate;
  const hasChildren = children && React.Children.count(children) > 0;

  // Always use English number formatting for quantities
  const numberFormatter = new Intl.NumberFormat('en-US');
  
  // Always use English currency formatting
  const englishFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Calculate quantity progress (completed quantity / total quantity)
  const quantityProgress = boqItem.quantity > 0 ? (progress.completedQuantity / boqTotalAmount) * 100 : 0;
  
  // Calculate cost progress (approved cost / total estimated cost)
  const approvedAmount = relatedWIRs
    .filter(wir => wir.result === 'A')
    .reduce((sum, wir) => sum + getWIRAmountForBOQ(wir, boqItem.id), 0);
  const costProgress = boqTotalAmount > 0 ? (approvedAmount / boqTotalAmount) * 100 : 0;

  const paddingLeft = level * 2; // 2rem per level

  return (
    <div style={{ paddingLeft: `${paddingLeft}rem` }}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-1">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 h-6 w-6"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex-1">
                <span className="text-sm text-gray-500">{boqItem.code}</span>
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? boqItem.description : (boqItem.descriptionAr || boqItem.description)}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {t('progress.quantity')}: {numberFormatter.format(boqItem.quantity)} {language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit)} | 
                  {' '}{t('progress.unitRate')}: {englishFormatter.format(boqItem.unitRate)} | 
                  {' '}{t('progress.totalValue')}: {englishFormatter.format(boqTotalAmount)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                Quantity: {quantityProgress.toFixed(1)}% | Cost: {costProgress.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                Approved: {englishFormatter.format(approvedAmount)} / {englishFormatter.format(boqTotalAmount)}
              </div>
            </div>
          </CardTitle>
          
          {/* Dual Progress Bars */}
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Quantity Progress</span>
                <span>{quantityProgress.toFixed(1)}%</span>
              </div>
              <Progress value={quantityProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Cost Progress (Approved)</span>
                <span>{costProgress.toFixed(1)}%</span>
              </div>
              <Progress value={costProgress} className="h-2" />
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
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
        )}
      </Card>
      
      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};
