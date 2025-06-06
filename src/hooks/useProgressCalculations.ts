
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
      let totalSubmittedAmount = 0;
      
      // Check if this item has children (is a parent)
      const hasChildren = boqItem.children && boqItem.children.length > 0;
      
      if (hasChildren) {
        // For parent items, sum up approved amounts from all children recursively
        totalSubmittedAmount = calculateChildrenApprovedAmount(boqItem);
      } else {
        // For leaf items, calculate from direct WIRs
        const relatedWIRs = wirs.filter(wir => 
          (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
          (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
        );
        
        totalSubmittedAmount = relatedWIRs.reduce((sum, wir) => {
          const wirAmount = getWIRAmountForBOQ(wir, boqItem.id);
          return sum + wirAmount;
        }, 0);
      }
      
      // Calculate BOQ total amount
      const boqTotalAmount = calculateBOQTotalAmount(boqItem);
      
      // Calculate completion percentage based on amount
      const completionPercentage = boqTotalAmount > 0 
        ? Math.min((totalSubmittedAmount / boqTotalAmount) * 100, 100)
        : 0;
      
      // Calculate breakdown progress for leaf items only
      const breakdownProgress = hasChildren ? [] : calculateBreakdownProgress(boqItem, boqTotalAmount);
      
      return {
        boqItemId: boqItem.id,
        totalQuantity: boqItem.quantity,
        completedQuantity: totalSubmittedAmount,
        completionPercentage,
        breakdownProgress
      };
    });
  };

  // Calculate total BOQ amount (for parents, sum of children; for leaves, quantity * rate)
  const calculateBOQTotalAmount = (boqItem: BOQItem): number => {
    if (boqItem.children && boqItem.children.length > 0) {
      return boqItem.children.reduce((sum, child) => sum + calculateBOQTotalAmount(child), 0);
    }
    return boqItem.quantity * boqItem.unitRate;
  };

  // Calculate approved amount from all children recursively
  const calculateChildrenApprovedAmount = (boqItem: BOQItem): number => {
    if (!boqItem.children || boqItem.children.length === 0) {
      // Leaf item - calculate from WIRs
      const relatedWIRs = wirs.filter(wir => 
        (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
        (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
      );
      
      return relatedWIRs.reduce((sum, wir) => {
        return sum + getWIRAmountForBOQ(wir, boqItem.id);
      }, 0);
    }
    
    // Parent item - sum from all children
    return boqItem.children.reduce((sum, child) => {
      return sum + calculateChildrenApprovedAmount(child);
    }, 0);
  };

  // Calculate breakdown progress for leaf items
  const calculateBreakdownProgress = (boqItem: BOQItem, boqTotalAmount: number) => {
    const itemBreakdowns = breakdownItems?.filter(bd => bd.boqItemId === boqItem.id) || [];
    
    return itemBreakdowns.map(breakdown => {
      const relatedWIRs = wirs.filter(wir => 
        (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
        (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
      );
      
      const breakdownWIRs = relatedWIRs.filter(wir => 
        wir.description.toLowerCase().includes(breakdown.keyword?.toLowerCase() || '')
      );
      
      const breakdownAmount = breakdownWIRs.reduce((sum, wir) => {
        return sum + getWIRAmountForBOQ(wir, boqItem.id);
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
    // Only count approved WIRs
    if (wir.result !== 'A' && wir.result !== 'B') {
      return 0;
    }
    
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
    getWIRAmountForBOQ,
    calculateChildrenApprovedAmount
  };
};
