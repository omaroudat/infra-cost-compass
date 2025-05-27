
import { BOQItem, PercentageAdjustment, WIR, WIRResult, BreakdownItem } from "../types";
import { mockBOQItems, mockPercentageAdjustments } from "../data/mockData";

export function findBOQItemById(id: string): BOQItem | undefined {
  // First, check top-level items
  for (const item of mockBOQItems) {
    if (item.id === id) return item;
    
    // Then check children
    if (item.children) {
      for (const child of item.children) {
        if (child.id === id) return child;
      }
    }
  }
  return undefined;
}

export function findBreakdownItemByBOQId(boqItemId: string, breakdownItems: BreakdownItem[]): BreakdownItem | null {
  return breakdownItems.find(item => item.boqItemId === boqItemId) || null;
}

export function calculateWIRAmount(wir: WIR, breakdownItems: BreakdownItem[]): { amount: number | null, equation: string } {
  console.log('calculateWIRAmount called with:', { wir, breakdownItems });
  
  // Only calculate for approved or conditionally approved WIRs
  if (wir.result !== 'A' && wir.result !== 'B') {
    console.log('WIR result is not A or B, returning null amount');
    return { amount: null, equation: '' };
  }

  let totalAmount = 0;
  let equations: string[] = [];

  // Calculate for each linked BOQ item
  const boqItemIds = wir.linkedBOQItems && wir.linkedBOQItems.length > 0 ? wir.linkedBOQItems : [wir.boqItemId];
  
  for (const boqItemId of boqItemIds) {
    const boqItem = findBOQItemById(boqItemId);
    if (!boqItem) {
      console.log('BOQ item not found for ID:', boqItemId);
      continue;
    }

    const breakdown = findBreakdownItemByBOQId(boqItemId, breakdownItems);
    console.log('Found breakdown for BOQ item:', { boqItemId, breakdown });
    
    // Use breakdown percentage as decimal (e.g., 0.4 for 40%)
    const breakdownPercentage = breakdown && breakdown.percentage ? breakdown.percentage / 100 : 0;
    const wirValue = wir.value || 0;
    const unitRate = boqItem.unitRate || 0;

    console.log('Calculation values:', { wirValue, unitRate, breakdownPercentage });

    // Formula: WIR Value × BOQ Unit Rate × Breakdown Percentage (as decimal)
    const itemAmount = wirValue * unitRate * breakdownPercentage;
    totalAmount += itemAmount;

    console.log('Calculated item amount:', itemAmount);

    // Create equation string with proper formatting
    const percentageDisplay = breakdown && breakdown.percentage ? `${breakdown.percentage}%` : '0%';
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
    const boqItem = findBOQItemById(wir.boqItemId);
    
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
