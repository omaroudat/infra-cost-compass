
import { useMemo } from 'react';
import { WIR, BOQItem } from '@/types';
import { calculateWIRAmount } from '@/utils/calculations';
import { useAppContext } from '@/context/AppContext';

export interface InvoiceData {
  period: string;
  previousAmount: number;
  currentAmount: number;
  totalBOQAmount: number;
  approvedWIRs: WIR[];
}

export interface MonthlyInvoiceData extends InvoiceData {}
export interface DailyInvoiceData extends InvoiceData {}

export const useInvoiceCalculations = (wirs: WIR[], boqItems: BOQItem[]) => {
  const { breakdownItems } = useAppContext();
  
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
    const filtered = wirs.filter(wir => {
      // Include WIRs with result 'A' (approved) or 'B' (conditional)
      const isApproved = wir.result === 'A' || wir.result === 'B';
      // Ensure we have a valid amount to work with
      const hasAmount = (wir.calculatedAmount && wir.calculatedAmount > 0) || (wir.value && wir.value > 0);
      
      console.log('WIR evaluation:', {
        id: wir.id,
        result: wir.result,
        isApproved,
        calculatedAmount: wir.calculatedAmount,
        value: wir.value,
        hasAmount,
        receivedDate: wir.receivedDate
      });
      
      return isApproved && hasAmount;
    });
    
    console.log('Approved WIRs found:', filtered.length, filtered);
    return filtered;
  }, [wirs]);

  const getAvailableMonths = (): string[] => {
    const months = new Set<string>();
    
    approvedWIRs.forEach(wir => {
      if (wir.receivedDate) {
        const month = wir.receivedDate.slice(0, 7); // YYYY-MM format
        months.add(month);
      }
    });
    
    console.log('Available months:', Array.from(months).sort());
    return Array.from(months).sort();
  };

  const getAvailableDates = (): string[] => {
    const dates = new Set<string>();
    
    approvedWIRs.forEach(wir => {
      if (wir.receivedDate) {
        dates.add(wir.receivedDate); // YYYY-MM-DD format
      }
    });
    
    return Array.from(dates).sort();
  };

  const getMonthlyInvoiceData = (targetMonth: string): MonthlyInvoiceData | null => {
    if (!targetMonth) return null;

    console.log('Calculating invoice data for month:', targetMonth);
    console.log('Total approved WIRs:', approvedWIRs.length);

    // Get WIRs approved in the target month
    const currentMonthWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate.slice(0, 7) === targetMonth
    );

    // Get WIRs approved before the target month
    const previousWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate.slice(0, 7) < targetMonth
    );

    console.log('Current month WIRs:', currentMonthWIRs.length, currentMonthWIRs);
    console.log('Previous WIRs:', previousWIRs.length, previousWIRs);

    // Calculate current month amount using proper calculation
    const currentAmount = currentMonthWIRs.reduce((sum, wir) => {
      const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems || []);
      const amount = calculation.amount || 0;
      console.log('Current month WIR amount:', wir.id, amount);
      return sum + amount;
    }, 0);

    // Calculate previous amount using proper calculation
    const previousAmount = previousWIRs.reduce((sum, wir) => {
      const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems || []);
      const amount = calculation.amount || 0;
      console.log('Previous WIR amount:', wir.id, amount);
      return sum + amount;
    }, 0);

    console.log('Calculated amounts:', {
      currentAmount,
      previousAmount,
      totalBOQAmount
    });

    return {
      period: targetMonth,
      previousAmount,
      currentAmount,
      totalBOQAmount,
      approvedWIRs: currentMonthWIRs
    };
  };

  const getDailyInvoiceData = (targetDate: string): DailyInvoiceData | null => {
    if (!targetDate) return null;

    console.log('Calculating invoice data for date:', targetDate);
    console.log('Total approved WIRs:', approvedWIRs.length);

    // Get WIRs approved on the target date
    const currentDayWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate === targetDate
    );

    // Get WIRs approved before the target date
    const previousWIRs = approvedWIRs.filter(wir => 
      wir.receivedDate && wir.receivedDate < targetDate
    );

    console.log('Current day WIRs:', currentDayWIRs.length, currentDayWIRs);
    console.log('Previous WIRs:', previousWIRs.length, previousWIRs);

    // Calculate current day amount using proper calculation
    const currentAmount = currentDayWIRs.reduce((sum, wir) => {
      const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems || []);
      const amount = calculation.amount || 0;
      console.log('Current day WIR amount:', wir.id, amount);
      return sum + amount;
    }, 0);

    // Calculate previous amount using proper calculation
    const previousAmount = previousWIRs.reduce((sum, wir) => {
      const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems || []);
      const amount = calculation.amount || 0;
      console.log('Previous WIR amount:', wir.id, amount);
      return sum + amount;
    }, 0);

    console.log('Calculated amounts:', {
      currentAmount,
      previousAmount,
      totalBOQAmount
    });

    return {
      period: targetDate,
      previousAmount,
      currentAmount,
      totalBOQAmount,
      approvedWIRs: currentDayWIRs
    };
  };

  return {
    getMonthlyInvoiceData,
    getDailyInvoiceData,
    getAvailableMonths,
    getAvailableDates,
    totalBOQAmount,
    approvedWIRs
  };
};
