
import { useMemo } from 'react';
import { WIR, BOQItem } from '@/types';

export interface MonthlyInvoiceData {
  month: string;
  previousAmount: number;
  currentAmount: number;
  totalBOQAmount: number;
  approvedWIRs: WIR[];
}

export const useInvoiceCalculations = (wirs: WIR[], boqItems: BOQItem[]) => {
  const flattenedBOQItems = useMemo(() => {
    const result: BOQItem[] = [];
    const flattenItems = (items: BOQItem[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flattenItems(item.children);
        }
      });
    };
    flattenItems(boqItems);
    return result;
  }, [boqItems]);

  const totalBOQAmount = useMemo(() => {
    return flattenedBOQItems.reduce((sum, item) => sum + (item.quantity * item.unitRate), 0);
  }, [flattenedBOQItems]);

  const approvedWIRs = useMemo(() => {
    return wirs.filter(wir => wir.result === 'A' && wir.calculatedAmount !== null);
  }, [wirs]);

  const getAvailableMonths = (): string[] => {
    const months = new Set<string>();
    
    approvedWIRs.forEach(wir => {
      if (wir.receivedDate) {
        const month = wir.receivedDate.slice(0, 7); // YYYY-MM format
        months.add(month);
      }
    });
    
    return Array.from(months).sort();
  };

  const getMonthlyInvoiceData = (targetMonth: string): MonthlyInvoiceData | null => {
    if (!targetMonth) return null;

    // Get WIRs approved in the target month
    const currentMonthWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate.slice(0, 7) === targetMonth
    );

    // Get WIRs approved before the target month
    const previousWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate.slice(0, 7) < targetMonth
    );

    const currentAmount = currentMonthWIRs.reduce((sum, wir) => 
      sum + (wir.calculatedAmount || 0), 0
    );

    const previousAmount = previousWIRs.reduce((sum, wir) => 
      sum + (wir.calculatedAmount || 0), 0
    );

    return {
      month: targetMonth,
      previousAmount,
      currentAmount,
      totalBOQAmount,
      approvedWIRs: currentMonthWIRs
    };
  };

  return {
    getMonthlyInvoiceData,
    getAvailableMonths,
    totalBOQAmount,
    approvedWIRs
  };
};
