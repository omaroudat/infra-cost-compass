
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
  keyword?: string;
  keywordAr?: string;
  description?: string;
  descriptionAr?: string;
  percentage?: number;
  value?: number;
  boqItemId: string;
  parentBreakdownId?: string; // For sub-items
  children?: BreakdownItem[]; // For sub-items
  unitRate?: number; // Inherited from BOQ item
  quantity?: number; // New field for actual quantities
  isLeaf?: boolean; // To identify leaf items
  parentInfo?: { // New field for parent information
    code: string;
    description: string;
    descriptionAr: string;
  };
};

// Keep PercentageAdjustment as an alias for backward compatibility
export type PercentageAdjustment = BreakdownItem;

export type WIRStatus = 'submitted' | 'completed';

export type WIRResult = 'A' | 'B' | 'C';

export type WIR = {
  id: string;
  wirNumber?: string; // Custom WIR number field
  boqItemId: string;
  description: string;
  descriptionAr?: string;
  submittalDate: string;
  receivedDate: string | null;
  status: WIRStatus;
  result?: WIRResult;
  statusConditions?: string;
  calculatedAmount: number | null;
  calculationEquation?: string; // New field to store the equation
  breakdownApplied: BreakdownItem | null;
  adjustmentApplied?: BreakdownItem | null; // For backward compatibility
  contractor: string;
  engineer: string;
  lengthOfLine: number; // meters
  diameterOfLine: number; // millimeters
  lineNo: string;
  region: string;
  manholeFrom: string; // New field - starting manhole
  manholeTo: string; // New field - ending manhole
  zone: string; // New field - zone information
  road: string; // New field - road information
  line: string; // New field - line information
  value: number; // New field for WIR value
  parentWIRId?: string; // for revisions
  revisionNumber?: number;
  linkedBOQItems: string[]; // multiple sub items
  originalWIRId?: string; // original WIR ID for revisions
  selectedBreakdownItems?: string[]; // New field for selected breakdown sub-items
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

export type Contractor = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  createdAt: string;
};

export type Engineer = {
  id: string;
  name: string;
  department?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  createdAt: string;
};
