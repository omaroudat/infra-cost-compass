
import { BOQItem, BreakdownItem, WIR, BOQProgress } from '@/types';

export const useProgressCalculations = (
  boqItems: BOQItem[],
  breakdownItems: BreakdownItem[],
  wirs: WIR[]
) => {
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

  const allFlatBOQ = flattenedBOQItems(boqItems);
  
  const getBOQItem = (id: string) => allFlatBOQ.find(item => item.id === id);
  
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

  return {
    calculateBOQProgress,
    getBOQItem,
    getWIRsForBOQ,
    getWIRAmountForBOQ
  };
};
