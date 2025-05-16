
import { BOQItem, PercentageAdjustment, WIR, WIRStatus } from "../types";
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

export function findApplicableAdjustment(description: string): PercentageAdjustment | null {
  for (const adjustment of mockPercentageAdjustments) {
    if (description.toLowerCase().includes(adjustment.keyword.toLowerCase())) {
      return adjustment;
    }
  }
  return null;
}

export function calculateWIRAmount(wir: WIR): number | null {
  // Only calculate for approved or conditionally approved WIRs
  if (wir.status !== 'A' && wir.status !== 'B') {
    return null;
  }

  const boqItem = findBOQItemById(wir.boqItemId);
  if (!boqItem) return null;

  const adjustment = findApplicableAdjustment(wir.description);
  let totalAmount = boqItem.quantity * boqItem.unitRate;

  if (adjustment) {
    // Apply the adjustment directly (multiply by percentage) instead of adding
    // e.g., if percentage is 0.2 (20%), multiply by 0.2 to get 20% of the value
    return parseFloat((adjustment.value * adjustment.percentage).toFixed(2));
  }

  return parseFloat(totalAmount.toFixed(2));
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
      
      // Calculate WIR amounts based on status
      if (wir.status === 'A') {
        totalApprovedWIRs++;
        totalApprovedAmount += wir.calculatedAmount || 0;
      } else if (wir.status === 'B') {
        totalConditionalWIRs++;
        totalConditionalAmount += wir.calculatedAmount || 0;
      } else if (wir.status === 'C') {
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
