
export type BOQItem = {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  parentId?: string;
  children?: BOQItem[];
};

export type PercentageAdjustment = {
  id: string;
  keyword: string;
  description: string;
  percentage: number;
  value: number; // Added value field
};

export type WIRStatus = 'A' | 'B' | 'C';

export type StatusLabel = {
  A: 'Approved';
  B: 'Approved with Conditions';
  C: 'Rejected';
};

export type WIR = {
  id: string;
  boqItemId: string;
  description: string;
  submittalDate: string;
  receivedDate: string | null;
  status: WIRStatus;
  statusConditions?: string;
  calculatedAmount: number | null;
  adjustmentApplied: PercentageAdjustment | null;
  contractor: string;
  engineer: string;
};

export type FinancialSummary = {
  totalApprovedWIRs: number;
  totalConditionalWIRs: number;
  totalRejectedWIRs: number;
  totalApprovedAmount: number;
  totalConditionalAmount: number;
  costVarianceAgainstBOQ: number;
};

export type FilterType = 'contractor' | 'engineer' | 'all';
export type NameType = string;
