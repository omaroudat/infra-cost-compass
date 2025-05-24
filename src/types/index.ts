
export type BOQItem = {
  id: string;
  code: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unit: string;
  unitAr?: string;
  unitRate: number;
  totalAmount?: number;
  parentId?: string;
  children?: BOQItem[];
  level?: number;
};

export type BreakdownItem = {
  id: string;
  keyword: string;
  keywordAr?: string;
  description: string;
  descriptionAr?: string;
  percentage: number;
  value: number;
  boqItemId: string;
};

export type WIRStatus = 'submitted' | 'received' | 'revision';

export type WIRResult = 'A' | 'B' | 'C';

export type WIR = {
  id: string;
  boqItemId: string;
  description: string;
  descriptionAr?: string;
  submittalDate: string;
  receivedDate: string | null;
  status: WIRStatus;
  result?: WIRResult;
  statusConditions?: string;
  calculatedAmount: number | null;
  breakdownApplied: BreakdownItem | null;
  contractor: string;
  engineer: string;
  lengthOfLine: number; // meters
  diameterOfLine: number; // millimeters
  lineNo: string;
  region: string;
  parentWIRId?: string; // for revisions
  revisionNumber?: number;
  linkedBOQItems: string[]; // multiple sub items
};

export type FinancialSummary = {
  totalSubmittedWIRs: number;
  totalReceivedWIRs: number;
  totalRevisionWIRs: number;
  totalApprovedAmount: number;
  totalConditionalAmount: number;
  costVarianceAgainstBOQ: number;
};

export type FilterType = 'contractor' | 'engineer' | 'all';
export type NameType = string;

export type BOQProgress = {
  boqItemId: string;
  totalQuantity: number;
  completedQuantity: number;
  completionPercentage: number;
  breakdownProgress: {
    breakdownId: string;
    percentage: number;
    completedPercentage: number;
  }[];
};
