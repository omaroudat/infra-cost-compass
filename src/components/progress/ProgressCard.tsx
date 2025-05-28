
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BOQItem, BOQProgress, BreakdownItem, WIR } from '@/types';
import { useLanguage } from '../../context/LanguageContext';
import { RelatedWIRsTable } from './RelatedWIRsTable';
import { BreakdownSubItemProgress } from './BreakdownSubItemProgress';

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
  isParent?: boolean;
  childrenApprovedAmount?: number;
  childrenTotalAmount?: number;
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
  level = 0,
  isParent = false,
  childrenApprovedAmount = 0,
  childrenTotalAmount = 0
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const boqTotalAmount = boqItem.quantity * boqItem.unitRate;
  const hasChildren = children && React.Children.count(children) > 0;

  // Always use English currency formatting
  const englishFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Calculate cost progress (approved cost / total estimated cost)
  const approvedAmount = relatedWIRs
    .filter(wir => wir.result === 'A')
    .reduce((sum, wir) => sum + getWIRAmountForBOQ(wir, boqItem.id), 0);
  const costProgress = boqTotalAmount > 0 ? (approvedAmount / boqTotalAmount) * 100 : 0;

  // For parent items, calculate progress based on children
  const parentCostProgress = isParent && childrenTotalAmount > 0 
    ? (childrenApprovedAmount / childrenTotalAmount) * 100 
    : 0;

  // Get breakdown sub-items for this BOQ item
  const breakdownSubItems = breakdownItems?.filter(item => 
    item.boqItemId === boqItem.id && item.isLeaf
  ) || [];

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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{boqItem.code}</span>
                  <span className="text-sm font-medium">
                    {isParent ? `${parentCostProgress.toFixed(1)}%` : `${costProgress.toFixed(1)}%`}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? boqItem.description : (boqItem.descriptionAr || boqItem.description)}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {t('progress.quantity')}: {boqItem.quantity} {language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit)} | 
                  {' '}{t('progress.unitRate')}: {englishFormatter.format(boqItem.unitRate)} | 
                  {' '}{t('progress.totalValue')}: {englishFormatter.format(boqTotalAmount)}
                </div>
              </div>
            </div>
          </CardTitle>
          
          {/* Progress Bar - Only Cost Progress */}
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>
                  Cost Progress (Approved): {englishFormatter.format(isParent ? childrenApprovedAmount : approvedAmount)} / {englishFormatter.format(isParent ? childrenTotalAmount : boqTotalAmount)}
                </span>
                <span>{(isParent ? parentCostProgress : costProgress).toFixed(1)}%</span>
              </div>
              <Progress value={isParent ? parentCostProgress : costProgress} className="h-2" />
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && !isParent && (
          <CardContent className="space-y-6">
            {/* Breakdown Sub-Items Progress */}
            {breakdownSubItems.length > 0 && (
              <BreakdownSubItemProgress
                breakdownSubItems={breakdownSubItems}
                relatedWIRs={relatedWIRs}
                boqItem={boqItem}
                language={language}
                getWIRAmountForBOQ={getWIRAmountForBOQ}
              />
            )}
            
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
