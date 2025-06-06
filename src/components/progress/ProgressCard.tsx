
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
  calculateChildrenApprovedAmount?: (boqItem: BOQItem) => number;
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
  childrenTotalAmount = 0,
  calculateChildrenApprovedAmount
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

  // Calculate total amount including children recursively
  const calculateTotalAmountIncludingChildren = (item: BOQItem): number => {
    if (item.children && item.children.length > 0) {
      return item.children.reduce((sum, child) => sum + calculateTotalAmountIncludingChildren(child), 0);
    }
    return item.quantity * item.unitRate;
  };

  // Calculate approved amount based on whether it's a parent or leaf item
  let approvedAmount = 0;
  let totalAmount = 0;
  let costProgress = 0;

  if (isParent && calculateChildrenApprovedAmount) {
    // For parent items, use the summation of children's approved amounts
    approvedAmount = calculateChildrenApprovedAmount(boqItem);
    totalAmount = calculateTotalAmountIncludingChildren(boqItem);
    costProgress = totalAmount > 0 ? (approvedAmount / totalAmount) * 100 : 0;
  } else {
    // For leaf items, calculate from direct WIRs
    approvedAmount = relatedWIRs
      .filter(wir => wir.result === 'A')
      .reduce((sum, wir) => sum + getWIRAmountForBOQ(wir, boqItem.id), 0);
    totalAmount = boqTotalAmount;
    costProgress = totalAmount > 0 ? (approvedAmount / totalAmount) * 100 : 0;
  }

  // Get breakdown sub-items for this BOQ item (only for leaf items)
  const breakdownSubItems = !isParent ? (breakdownItems?.filter(item => 
    item.boqItemId === boqItem.id && item.isLeaf
  ) || []) : [];

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
                    {costProgress.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? boqItem.description : (boqItem.descriptionAr || boqItem.description)}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {!isParent && (
                    <>
                      {t('progress.quantity')}: {boqItem.quantity} {language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit)} | 
                      {' '}{t('progress.unitRate')}: {englishFormatter.format(boqItem.unitRate)} | 
                    </>
                  )}
                  {' '}{t('progress.totalValue')}: {englishFormatter.format(totalAmount)}
                </div>
              </div>
            </div>
          </CardTitle>
          
          {/* Progress Bar - Cost Progress */}
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>
                  Cost Progress (Approved): {englishFormatter.format(approvedAmount)} / {englishFormatter.format(totalAmount)}
                </span>
                <span>{costProgress.toFixed(1)}%</span>
              </div>
              <Progress value={costProgress} className="h-2" />
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
