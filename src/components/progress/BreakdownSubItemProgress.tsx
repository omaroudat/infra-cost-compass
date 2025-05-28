
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BOQItem, BreakdownItem, WIR } from '@/types';

interface BreakdownSubItemProgressProps {
  breakdownSubItems: BreakdownItem[];
  relatedWIRs: WIR[];
  boqItem: BOQItem;
  language: 'en' | 'ar';
  getWIRAmountForBOQ: (wir: WIR, boqId: string) => number;
}

export const BreakdownSubItemProgress: React.FC<BreakdownSubItemProgressProps> = ({
  breakdownSubItems,
  relatedWIRs,
  boqItem,
  language,
  getWIRAmountForBOQ
}) => {
  // Always use English currency formatting
  const englishFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Always use English number formatting for quantities
  const numberFormatter = new Intl.NumberFormat('en-US');

  const calculateSubItemProgress = (subItem: BreakdownItem) => {
    // Find approved WIRs that include this breakdown sub-item
    const approvedWIRs = relatedWIRs.filter(wir => 
      wir.result === 'A' && 
      wir.selectedBreakdownItems?.includes(subItem.id)
    );

    // Calculate approved amount for this sub-item
    const approvedAmount = approvedWIRs.reduce((sum, wir) => {
      // Use the sub-item's percentage and value calculation
      const wirValue = wir.value || 0;
      const unitRate = boqItem.unitRate || 0;
      const percentage = (subItem.percentage || 0) / 100;
      return sum + (wirValue * unitRate * percentage);
    }, 0);

    // Calculate total expected amount for this sub-item (BOQ Unit Rate * Percentage)
    const totalExpectedAmount = (boqItem.unitRate * (subItem.percentage || 0)) / 100;

    // Calculate approved quantity (based on approved WIRs value)
    const approvedQuantity = approvedWIRs.reduce((sum, wir) => sum + (wir.value || 0), 0);

    // Total quantity is the BOQ quantity
    const totalQuantity = boqItem.quantity;

    // Calculate progress percentages
    const amountProgress = totalExpectedAmount > 0 ? (approvedAmount / totalExpectedAmount) * 100 : 0;
    const quantityProgress = totalQuantity > 0 ? (approvedQuantity / totalQuantity) * 100 : 0;

    return {
      approvedAmount,
      totalExpectedAmount,
      approvedQuantity,
      totalQuantity,
      amountProgress: Math.min(amountProgress, 100),
      quantityProgress: Math.min(quantityProgress, 100)
    };
  };

  if (breakdownSubItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {language === 'en' ? 'Breakdown Sub-Items Progress' : 'تقدم العناصر الفرعية'}
        </CardTitle>
        <CardDescription>
          {language === 'en' 
            ? 'Progress tracking for individual breakdown components'
            : 'تتبع التقدم للمكونات الفرعية الفردية'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdownSubItems.map(subItem => {
          const progress = calculateSubItemProgress(subItem);
          
          return (
            <div key={subItem.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {language === 'en' ? subItem.description : (subItem.descriptionAr || subItem.description)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {language === 'en' ? 'Percentage:' : 'النسبة:'} {subItem.percentage}% | 
                    {' '}{language === 'en' ? 'Value:' : 'القيمة:'} {englishFormatter.format(subItem.value || 0)}
                  </p>
                </div>
              </div>
              
              {/* Approved Amount Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {language === 'en' ? 'Approved Amount:' : 'المبلغ المعتمد:'} {englishFormatter.format(progress.approvedAmount)} / {englishFormatter.format(progress.totalExpectedAmount)}
                  </span>
                  <span className="font-medium">{progress.amountProgress.toFixed(1)}%</span>
                </div>
                <Progress value={progress.amountProgress} className="h-2" />
              </div>
              
              {/* Approved Quantity Progress */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {language === 'en' ? 'Approved Quantity:' : 'الكمية المعتمدة:'} {numberFormatter.format(progress.approvedQuantity)} / {numberFormatter.format(progress.totalQuantity)}
                  </span>
                  <span className="font-medium">{progress.quantityProgress.toFixed(1)}%</span>
                </div>
                <Progress value={progress.quantityProgress} className="h-2" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
