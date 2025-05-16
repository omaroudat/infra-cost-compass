import { BOQItem, PercentageAdjustment, WIR } from "../types";

export const mockBOQItems: BOQItem[] = [
  {
    id: "boq-1",
    code: "100",
    description: "Site Clearance",
    quantity: 1,
    unit: "LS",
    unitRate: 25000,
    children: [
      {
        id: "boq-1-1",
        code: "100.1",
        description: "Remove existing vegetation",
        quantity: 5000,
        unit: "m²",
        unitRate: 3.5,
        parentId: "boq-1"
      },
      {
        id: "boq-1-2",
        code: "100.2",
        description: "Demolish existing structures",
        quantity: 3,
        unit: "each",
        unitRate: 4500,
        parentId: "boq-1"
      }
    ]
  },
  {
    id: "boq-2",
    code: "200",
    description: "Earthworks",
    quantity: 1,
    unit: "LS",
    unitRate: 75000,
    children: [
      {
        id: "boq-2-1",
        code: "200.1",
        description: "Excavation for foundations",
        quantity: 850,
        unit: "m³",
        unitRate: 45,
        parentId: "boq-2"
      },
      {
        id: "boq-2-2",
        code: "200.2",
        description: "Backfill and compaction",
        quantity: 620,
        unit: "m³",
        unitRate: 28.5,
        parentId: "boq-2"
      }
    ]
  },
  {
    id: "boq-3",
    code: "300",
    description: "Concrete Works",
    quantity: 1,
    unit: "LS",
    unitRate: 150000,
    children: [
      {
        id: "boq-3-1",
        code: "300.1",
        description: "Foundation concrete",
        quantity: 320,
        unit: "m³",
        unitRate: 185,
        parentId: "boq-3"
      },
      {
        id: "boq-3-2",
        code: "300.2",
        description: "Column concrete",
        quantity: 150,
        unit: "m³",
        unitRate: 210,
        parentId: "boq-3"
      }
    ]
  }
];

export const mockPercentageAdjustments: PercentageAdjustment[] = [
  {
    id: "adj-1",
    keyword: "holes",
    description: "Additional work for drilling holes",
    percentage: 0.2, // 20%
    value: 1000
  },
  {
    id: "adj-2",
    keyword: "extension",
    description: "Extension of existing structure",
    percentage: 0.35, // 35%
    value: 2000
  },
  {
    id: "adj-3",
    keyword: "night",
    description: "Night work premium",
    percentage: 0.25, // 25%
    value: 1500
  },
  {
    id: "adj-4",
    keyword: "emergency",
    description: "Emergency response",
    percentage: 0.5, // 50%
    value: 3000
  }
];

export const mockWIRs: WIR[] = [
  {
    id: "wir-1",
    boqItemId: "boq-1-1",
    description: "Removal of existing vegetation completed as per spec",
    submittalDate: "2025-04-01",
    receivedDate: "2025-04-03",
    status: "A",
    calculatedAmount: 17500,
    adjustmentApplied: null,
    contractor: "ABC Contractors",
    engineer: "John Smith"
  },
  {
    id: "wir-2",
    boqItemId: "boq-2-1",
    description: "Excavation for foundations with additional holes for drainage",
    submittalDate: "2025-04-05",
    receivedDate: "2025-04-08",
    status: "B",
    statusConditions: "Subject to additional drainage inspection",
    calculatedAmount: 45900,
    adjustmentApplied: mockPercentageAdjustments[0],
    contractor: "Foundation Masters Ltd",
    engineer: "Emily Chen"
  },
  {
    id: "wir-3",
    boqItemId: "boq-3-2",
    description: "Column concrete work completed",
    submittalDate: "2025-04-10",
    receivedDate: "2025-04-12",
    status: "C",
    statusConditions: "Concrete mix does not meet specifications",
    calculatedAmount: null,
    adjustmentApplied: null,
    contractor: "Concrete Solutions Inc",
    engineer: "Mohammed Al-Faisal"
  }
];
