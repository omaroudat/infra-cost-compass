
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { WIR, BOQItem, BOQProgress } from '../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProgressTracking = () => {
  const { wirs, boqItems, breakdownItems } = useAppContext();
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const flattenedBOQItems = (items: BOQItem[]): BOQItem[] => {
    const result: BOQItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };
  
  const calculateBOQProgress = (): BOQProgress[] => {
    const flattened = flattenedBOQItems(boqItems);
    
    return flattened.map(boqItem => {
      // Find WIRs that include this BOQ item in their linkedBOQItems array
      const relatedWIRs = wirs.filter(wir => 
        (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
        (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
      );
      
      // Calculate total submitted amount for this BOQ item
      const totalSubmittedAmount = relatedWIRs.reduce((sum, wir) => {
        // For WIRs with multiple BOQ items, divide the amount proportionally
        if (wir.linkedBOQItems && wir.linkedBOQItems.length > 1) {
          return sum + ((wir.calculatedAmount || 0) / wir.linkedBOQItems.length);
        }
        return sum + (wir.calculatedAmount || 0);
      }, 0);
      
      // Calculate BOQ total amount
      const boqTotalAmount = boqItem.quantity * boqItem.unitRate;
      
      // Calculate completion percentage based on amount
      const completionPercentage = boqTotalAmount > 0 
        ? Math.min((totalSubmittedAmount / boqTotalAmount) * 100, 100)
        : 0;
      
      // Calculate breakdown progress
      const itemBreakdowns = breakdownItems?.filter(bd => bd.boqItemId === boqItem.id) || [];
      const breakdownProgress = itemBreakdowns.map(breakdown => {
        const breakdownWIRs = relatedWIRs.filter(wir => 
          wir.description.toLowerCase().includes(breakdown.keyword?.toLowerCase() || '')
        );
        
        const breakdownAmount = breakdownWIRs.reduce((sum, wir) => {
          if (wir.linkedBOQItems && wir.linkedBOQItems.length > 1) {
            return sum + ((wir.calculatedAmount || 0) / wir.linkedBOQItems.length);
          }
          return sum + (wir.calculatedAmount || 0);
        }, 0);
        
        const expectedAmount = (boqTotalAmount * (breakdown.percentage || 0)) / 100;
        const completedPercentage = expectedAmount > 0 
          ? Math.min((breakdownAmount / expectedAmount) * 100, 100)
          : 0;
        
        return {
          breakdownId: breakdown.id,
          percentage: breakdown.percentage || 0,
          completedPercentage
        };
      });
      
      return {
        boqItemId: boqItem.id,
        totalQuantity: boqItem.quantity,
        completedQuantity: totalSubmittedAmount,
        completionPercentage,
        breakdownProgress
      };
    });
  };
  
  const progressData = calculateBOQProgress();
  const allFlatBOQ = flattenedBOQItems(boqItems);
  
  const getBOQItem = (id: string) => allFlatBOQ.find(item => item.id === id);
  
  const getBreakdownItem = (id: string) => breakdownItems?.find(item => item.id === id);
  
  const getWIRsForBOQ = (boqId: string) => {
    return wirs.filter(wir => 
      (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqId)) ||
      wir.boqItemId === boqId
    );
  };

  const getWIRAmountForBOQ = (wir: WIR, boqId: string) => {
    // If WIR is linked to multiple BOQ items, divide the amount proportionally
    if (wir.linkedBOQItems && wir.linkedBOQItems.length > 1 && wir.linkedBOQItems.includes(boqId)) {
      return (wir.calculatedAmount || 0) / wir.linkedBOQItems.length;
    }
    // If it's the primary BOQ item or single linked item
    if (wir.boqItemId === boqId || (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqId))) {
      return wir.calculatedAmount || 0;
    }
    return 0;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Progress Tracking / سجل المتابعة</h2>
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('ar')}
            >
              عربي
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6">
        {progressData.map((progress) => {
          const boqItem = getBOQItem(progress.boqItemId);
          if (!boqItem) return null;
          
          const relatedWIRs = getWIRsForBOQ(progress.boqItemId);
          const boqTotalAmount = boqItem.quantity * boqItem.unitRate;
          
          return (
            <Card key={progress.boqItemId}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">{boqItem.code}</span>
                    <h3 className="text-lg font-semibold">
                      {language === 'en' ? boqItem.description : (boqItem.descriptionAr || boqItem.description)}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {language === 'en' ? 'Quantity:' : 'الكمية:'} {boqItem.quantity.toLocaleString()} {language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit)} | 
                      {language === 'en' ? ' Unit Rate:' : ' سعر الوحدة:'} {formatter.format(boqItem.unitRate)} | 
                      {language === 'en' ? ' Total Value:' : ' القيمة الإجمالية:'} {formatter.format(boqTotalAmount)}
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
                {/* Breakdown Progress */}
                {progress.breakdownProgress.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">
                      {language === 'en' ? 'Breakdown Progress' : 'تقدم البنود الفرعية'}
                    </h4>
                    <div className="grid gap-2">
                      {progress.breakdownProgress.map((breakdown) => {
                        const breakdownItem = getBreakdownItem(breakdown.breakdownId);
                        if (!breakdownItem) return null;
                        
                        return (
                          <div key={breakdown.breakdownId} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {language === 'en' ? breakdownItem.description : (breakdownItem.descriptionAr || breakdownItem.description)}
                                </span>
                                <span>{breakdown.completedPercentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={breakdown.completedPercentage} className="h-2" />
                            </div>
                            <span className="text-sm text-gray-500 w-16">
                              {breakdown.percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Related WIRs Table */}
                {relatedWIRs.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">
                      {language === 'en' ? 'Related WIRs' : 'طلبات المعاينة المرتبطة'}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'en' ? 'WIR ID' : 'رقم طلب المعاينة'}</TableHead>
                          <TableHead>{language === 'en' ? 'Contractor' : 'المقاول'}</TableHead>
                          <TableHead>{language === 'en' ? 'Engineer' : 'المهندس'}</TableHead>
                          <TableHead>{language === 'en' ? 'WIR Value' : 'قيمة الطلب'}</TableHead>
                          <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
                          <TableHead>{language === 'en' ? 'Result' : 'النتيجة'}</TableHead>
                          <TableHead>{language === 'en' ? 'Amount for this Item' : 'المبلغ لهذا البند'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedWIRs.map((wir) => {
                          const wirAmountForThisItem = getWIRAmountForBOQ(wir, progress.boqItemId);
                          
                          return (
                            <TableRow key={wir.id}>
                              <TableCell className="font-medium">{wir.id}</TableCell>
                              <TableCell>{wir.contractor}</TableCell>
                              <TableCell>{wir.engineer}</TableCell>
                              <TableCell>{wir.value?.toLocaleString()}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  wir.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                  wir.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {wir.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {wir.result && (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    wir.result === 'A' ? 'bg-green-100 text-green-800' :
                                    wir.result === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {wir.result}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {wirAmountForThisItem > 0 ? formatter.format(wirAmountForThisItem) : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracking;
