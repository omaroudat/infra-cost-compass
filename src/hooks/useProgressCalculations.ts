
import { BOQItem, BreakdownItem, WIR, BOQProgress } from '@/types';
import { calculateWIRAmount } from '@/utils/calculations';

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

  // Create a map for quick BOQ item lookup
  const createBOQItemMap = (items: BOQItem[]): Map<string, BOQItem> => {
    const map = new Map<string, BOQItem>();
    
    const addToMap = (itemList: BOQItem[]) => {
      itemList.forEach(item => {
        map.set(item.id, item);
        if (item.children) {
          addToMap(item.children);
        }
      });
    };
    
    addToMap(items);
    return map;
  };

  const boqItemMap = createBOQItemMap(boqItems);
  
  const calculateBOQProgress = (): BOQProgress[] => {
    const flattened = flattenedBOQItems(boqItems);
    
    return flattened.map(boqItem => {
      let totalApprovedAmount = 0;
      
      // Check if this item has children (is a parent)
      const hasChildren = boqItem.children && boqItem.children.length > 0;
      
      if (hasChildren) {
        // For parent items, sum up approved amounts from all children recursively
        totalApprovedAmount = calculateChildrenApprovedAmount(boqItem);
        console.log(`Parent item ${boqItem.code} approved amount: ${totalApprovedAmount}`);
      } else {
        // For leaf items, calculate from direct WIRs using the proper calculation
        const relatedWIRs = wirs.filter(wir => 
          (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
          (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
        );
        
        totalApprovedAmount = relatedWIRs.reduce((sum, wir) => {
          const calculation = calculateWIRAmount(wir, breakdownItems, boqItems);
          const wirAmount = calculation.amount || 0;
          console.log(`Leaf item ${boqItem.code}, WIR ${wir.id} amount: ${wirAmount}`);
          return sum + wirAmount;
        }, 0);
        
        console.log(`Leaf item ${boqItem.code} total approved amount: ${totalApprovedAmount}`);
      }
      
      // Calculate BOQ total amount
      const boqTotalAmount = calculateBOQTotalAmount(boqItem);
      
      // Calculate completion percentage based on amount
      const completionPercentage = boqTotalAmount > 0 
        ? Math.min((totalApprovedAmount / boqTotalAmount) * 100, 100)
        : 0;
      
      console.log(`Item ${boqItem.code}: approved=${totalApprovedAmount}, total=${boqTotalAmount}, percentage=${completionPercentage}%`);
      
      // Calculate breakdown progress for leaf items only
      const breakdownProgress = hasChildren ? [] : calculateBreakdownProgress(boqItem, boqTotalAmount);
      
      return {
        boqItemId: boqItem.id,
        totalQuantity: boqItem.quantity,
        completedQuantity: totalApprovedAmount, // This represents the approved amount, not quantity
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
    console.log(`Calculating children approved amount for: ${boqItem.code} (${boqItem.id})`);
    
    if (!boqItem.children || boqItem.children.length === 0) {
      // Leaf item - calculate from WIRs using proper calculation
      console.log(`${boqItem.code} is a leaf item, calculating from WIRs`);
      const relatedWIRs = wirs.filter(wir => 
        (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItem.id)) ||
        (wir.boqItemId === boqItem.id && (wir.result === 'A' || wir.result === 'B'))
      );
      
      console.log(`Found ${relatedWIRs.length} related WIRs for ${boqItem.code}`);
      
      const amount = relatedWIRs.reduce((sum, wir) => {
        const calculation = calculateWIRAmount(wir, breakdownItems, boqItems);
        const wirAmount = calculation.amount || 0;
        console.log(`WIR ${wir.id} contributes ${wirAmount} to ${boqItem.code}`);
        return sum + wirAmount;
      }, 0);
      
      console.log(`Leaf item ${boqItem.code} approved amount: ${amount}`);
      return amount;
    }
    
    // Parent item - sum from all children
    console.log(`${boqItem.code} is a parent with ${boqItem.children.length} children`);
    const amount = boqItem.children.reduce((sum, child) => {
      const childAmount = calculateChildrenApprovedAmount(child);
      console.log(`Child ${child.code} contributes ${childAmount} to parent ${boqItem.code}`);
      return sum + childAmount;
    }, 0);
    
    console.log(`Parent item ${boqItem.code} total approved amount: ${amount}`);
    return amount;
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
        const calculation = calculateWIRAmount(wir, breakdownItems, boqItems);
        return sum + (calculation.amount || 0);
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
  
  const getBOQItem = (id: string) => {
    const item = boqItemMap.get(id);
    if (!item) {
      console.log(`BOQ item not found for ID: ${id}`);
    }
    return item;
  };
  
  const getWIRsForBOQ = (boqId: string) => {
    return wirs.filter(wir => 
      (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqId)) ||
      wir.boqItemId === boqId
    );
  };

  const getWIRAmountForBOQ = (wir: WIR, boqId: string) => {
    // Only count approved WIRs (A) or conditional approved (B)
    if (wir.result !== 'A' && wir.result !== 'B') {
      console.log(`WIR ${wir.id} not approved (result: ${wir.result}), returning 0`);
      return 0;
    }
    
    // Use the proper calculation method
    const calculation = calculateWIRAmount(wir, breakdownItems, boqItems);
    const amount = calculation.amount || 0;
    console.log(`WIR ${wir.id} approved amount: ${amount}`);
    
    // If WIR is linked to multiple BOQ items, divide the amount proportionally
    if (wir.linkedBOQItems && wir.linkedBOQItems.length > 1 && wir.linkedBOQItems.includes(boqId)) {
      const proportionalAmount = amount / wir.linkedBOQItems.length;
      console.log(`WIR ${wir.id} proportional amount for BOQ ${boqId}: ${proportionalAmount}`);
      return proportionalAmount;
    }
    
    // If it's the primary BOQ item or single linked item
    if (wir.boqItemId === boqId || (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqId))) {
      console.log(`WIR ${wir.id} full amount for BOQ ${boqId}: ${amount}`);
      return amount;
    }
    
    console.log(`WIR ${wir.id} not related to BOQ ${boqId}, returning 0`);
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
