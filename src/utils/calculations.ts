
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
  // Only calculate for approved or conditionally approved WIRs
  if (wir.result !== 'A' && wir.result !== 'B') {
    return { amount: null, equation: '' };
  }

  let totalAmount = 0;
  let equations: string[] = [];

  // Calculate for each linked BOQ item
  for (const boqItemId of wir.linkedBOQItems || [wir.boqItemId]) {
    const boqItem = findBOQItemById(boqItemId);
    if (!boqItem) continue;

    const breakdown = findBreakdownItemByBOQId(boqItemId, breakdownItems);
    // Use breakdown percentage as decimal (0.4, not 40)
    const breakdownPercentage = breakdown?.percentage || 0;
    const wirValue = wir.value || 0;

    // Formula: WIR Value × BOQ Unit Rate × Breakdown Percentage (as decimal)
    const itemAmount = wirValue * boqItem.unitRate * breakdownPercentage;
    totalAmount += itemAmount;

    // Create equation string with proper formatting
    const equation = `${wirValue.toLocaleString('ar-SA')} × ${boqItem.unitRate.toLocaleString('ar-SA')} × ${breakdownPercentage.toLocaleString('ar-SA')} = ${itemAmount.toLocaleString('ar-SA')}`;
    equations.push(`${boqItem.code}: ${equation}`);
  }

  const finalEquation = equations.length > 1 
    ? `${equations.join(' + ')} = ${totalAmount.toLocaleString('ar-SA')} SAR`
    : `${equations[0]} SAR`;

  return { 
    amount: parseFloat(totalAmount.toFixed(2)), 
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
