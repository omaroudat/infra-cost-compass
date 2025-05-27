import { BOQItem, PercentageAdjustment, WIR, WIRResult, BreakdownItem } from "../types";
import { mockBOQItems, mockPercentageAdjustments } from "../data/mockData";

export function findBOQItemById(id: string, boqItems: BOQItem[]): BOQItem | undefined {
  console.log('Searching for BOQ item with ID:', id, 'in items:', boqItems.length);
  
  // First, check top-level items
  for (const item of boqItems) {
    if (item.id === id) {
      console.log('Found BOQ item at top level:', item);
      return item;
    }
    
    // Then check children recursively
    if (item.children) {
      const found = findInChildren(item.children, id);
      if (found) {
        console.log('Found BOQ item in children:', found);
        return found;
      }
    }
  }
  
  console.log('BOQ item not found for ID:', id);
  return undefined;
}

function findInChildren(children: BOQItem[], id: string): BOQItem | undefined {
  for (const child of children) {
    if (child.id === id) {
      return child;
    }
    if (child.children) {
      const found = findInChildren(child.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function findBreakdownItemByBOQCode(boqCode: string, breakdownItems: BreakdownItem[]): BreakdownItem | null {
  console.log('Searching for breakdown item with BOQ code:', boqCode);
  const found = breakdownItems.find(item => item.keyword === boqCode) || null;
  console.log('Found breakdown item by code:', found);
  return found;
}

export function findBreakdownItemByBOQId(boqItemId: string, breakdownItems: BreakdownItem[]): BreakdownItem | null {
  console.log('Searching for breakdown item with BOQ ID:', boqItemId);
  const found = breakdownItems.find(item => item.boqItemId === boqItemId) || null;
  console.log('Found breakdown item by ID:', found);
  return found;
}

export function calculateWIRAmount(wir: WIR, breakdownItems: BreakdownItem[], boqItems: BOQItem[]): { amount: number | null, equation: string } {
  console.log('calculateWIRAmount called with:', { 
    wir: wir.id, 
    breakdownItemsCount: breakdownItems?.length || 0,
    boqItemsCount: boqItems?.length || 0,
    wirResult: wir.result,
    wirStatus: wir.status
  });
  
  // Only calculate for approved or conditionally approved WIRs
  if (wir.result !== 'A' && wir.result !== 'B') {
    console.log('WIR result is not A or B, returning null amount');
    return { amount: null, equation: '' };
  }

  let totalAmount = 0;
  let equations: string[] = [];

  // Calculate for each linked BOQ item
  const boqItemIds = wir.linkedBOQItems && wir.linkedBOQItems.length > 0 ? wir.linkedBOQItems : [wir.boqItemId];
  console.log('Processing BOQ item IDs:', boqItemIds);
  
  for (const boqItemId of boqItemIds) {
    console.log('Processing BOQ item ID:', boqItemId);
    
    const boqItem = findBOQItemById(boqItemId, boqItems);
    if (!boqItem) {
      console.log('BOQ item not found for ID:', boqItemId);
      continue;
    }

    console.log('Found BOQ item:', { id: boqItem.id, code: boqItem.code, unitRate: boqItem.unitRate });

    // Try to find breakdown item by BOQ ID first, then by code
    let breakdown = findBreakdownItemByBOQId(boqItemId, breakdownItems);
    if (!breakdown) {
      breakdown = findBreakdownItemByBOQCode(boqItem.code, breakdownItems);
    }
    
    console.log('Found breakdown for BOQ item:', { boqItemId, breakdown: breakdown?.id, percentage: breakdown?.percentage });
    
    if (!breakdown || !breakdown.percentage || breakdown.percentage === 0) {
      console.log('No breakdown found or percentage is 0 for BOQ item:', boqItemId);
      continue;
    }
    
    // Use breakdown percentage as decimal (e.g., 0.4 for 40%)
    const breakdownPercentage = breakdown.percentage / 100;
    const wirValue = wir.value || 0;
    const unitRate = boqItem.unitRate || 0;

    console.log('Calculation values:', { wirValue, unitRate, breakdownPercentage, percentage: breakdown.percentage });

    // Formula: WIR Value × BOQ Unit Rate × Breakdown Percentage (as decimal)
    const itemAmount = wirValue * unitRate * breakdownPercentage;
    totalAmount += itemAmount;

    console.log('Calculated item amount:', itemAmount);

    // Create equation string with proper formatting
    const percentageDisplay = `${breakdown.percentage}%`;
    const equation = `${wirValue.toLocaleString('ar-SA')} × ${unitRate.toLocaleString('ar-SA')} × ${percentageDisplay} = ${itemAmount.toLocaleString('ar-SA')}`;
    equations.push(`${boqItem.code}: ${equation}`);
  }

  const finalEquation = equations.length > 1 
    ? `${equations.join(' + ')} = ${totalAmount.toLocaleString('ar-SA')} SAR`
    : equations.length > 0 ? `${equations[0]} SAR` : '';

  console.log('Final calculation result:', { amount: totalAmount, equation: finalEquation });

  return { 
    amount: totalAmount > 0 ? parseFloat(totalAmount.toFixed(2)) : null, 
    equation: finalEquation 
  };
}

export function findApplicableAdjustment(description: string): PercentageAdjustment | null {
  for (const adjustment of mockPercentageAdjustments) {
    if (description.toLowerCase().includes(adjustment.keyword.toLowerCase())) {
      return adjustment;
    }
  }
  return null;
}

export function generateFinancialSummary(wirs: WIR[]): {
  totalApprovedWIRs: number;
  totalConditionalWIRs: number;
  totalRejectedWIRs: number;
  totalApprovedAmount: number;
  totalConditionalAmount: number;
  costVarianceAgainstBOQ: number;
} {
  let totalApprovedWIRs = 0;
  let totalConditionalWIRs = 0;
  let totalRejectedWIRs = 0;
  let totalApprovedAmount = 0;
  let totalConditionalAmount = 0;
  let totalBOQAmount = 0;
  
  // Count WIRs by status and calculate amounts
  for (const wir of wirs) {
    const boqItem = findBOQItemById(wir.boqItemId, mockBOQItems);
    
    if (boqItem) {
      // Calculate BOQ amount (without adjustments)
      const boqAmount = boqItem.quantity * boqItem.unitRate;
      totalBOQAmount += boqAmount;
      
      // Calculate WIR amounts based on result
      if (wir.result === 'A') {
        totalApprovedWIRs++;
        totalApprovedAmount += wir.calculatedAmount || 0;
      } else if (wir.result === 'B') {
        totalConditionalWIRs++;
        totalConditionalAmount += wir.calculatedAmount || 0;
      } else if (wir.result === 'C') {
        totalRejectedWIRs++;
      }
    }
  }
  
  // Calculate cost variance (total WIR amounts vs. BOQ amount)
  const totalWIRAmount = totalApprovedAmount + totalConditionalAmount;
  const costVarianceAgainstBOQ = totalWIRAmount - totalBOQAmount;
  
  return {
    totalApprovedWIRs,
    totalConditionalWIRs,
    totalRejectedWIRs,
    totalApprovedAmount,
    totalConditionalAmount,
    costVarianceAgainstBOQ
  };
}
