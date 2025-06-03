
import React, { createContext, useContext } from 'react';
import { BOQItem, BreakdownItem, WIR, Contractor, Engineer } from '../types';
import { useSupabaseBOQ } from '../hooks/useSupabaseBOQ';
import { useSupabaseBreakdown } from '../hooks/useSupabaseBreakdown';
import { useSupabaseWIRs } from '../hooks/useSupabaseWIRs';
import { useSupabaseStaff } from '../hooks/useSupabaseStaff';

interface AppContextType {
  boqItems: BOQItem[];
  breakdownItems: BreakdownItem[];
  percentageAdjustments: BreakdownItem[]; // Alias for backward compatibility
  wirs: WIR[];
  contractors: Contractor[];
  engineers: Engineer[];
  loading: boolean;
  addBOQItem: (item: Omit<BOQItem, 'id'>, parentId?: string) => Promise<any>;
  updateBOQItem: (id: string, updates: Partial<BOQItem>) => Promise<void>;
  deleteBOQItem: (id: string) => Promise<void>;
  addBreakdownItem: (item: Omit<BreakdownItem, 'id'>) => Promise<any>;
  addBreakdownSubItem: (parentId: string, item: Omit<BreakdownItem, 'id'>) => Promise<any>;
  updateBreakdownItem: (id: string, updates: Partial<BreakdownItem>) => Promise<void>;
  deleteBreakdownItem: (id: string) => Promise<void>;
  addPercentageAdjustment: (item: Omit<BreakdownItem, 'id'>) => Promise<any>; // Alias
  updatePercentageAdjustment: (id: string, updates: Partial<BreakdownItem>) => Promise<void>; // Alias
  deletePercentageAdjustment: (id: string) => Promise<void>; // Alias
  addWIR: (wir: Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied'>) => Promise<any>;
  updateWIR: (id: string, updates: Partial<WIR>) => Promise<void>;
  deleteWIR: (id: string) => Promise<void>;
  addContractor: (contractor: Omit<Contractor, 'id' | 'createdAt'>) => Promise<any>;
  updateContractor: (id: string, updates: Partial<Contractor>) => Promise<void>;
  deleteContractor: (id: string) => Promise<void>;
  addEngineer: (engineer: Omit<Engineer, 'id' | 'createdAt'>) => Promise<any>;
  updateEngineer: (id: string, updates: Partial<Engineer>) => Promise<void>;
  deleteEngineer: (id: string) => Promise<void>;
  refetchAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const {
    boqItems,
    loading: boqLoading,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    refetch: refetchBOQ
  } = useSupabaseBOQ();

  const {
    breakdownItems,
    loading: breakdownLoading,
    addBreakdownItem,
    updateBreakdownItem,
    deleteBreakdownItem,
    refetch: refetchBreakdown
  } = useSupabaseBreakdown();

  const {
    wirs,
    loading: wirsLoading,
    addWIR,
    updateWIR,
    deleteWIR,
    refetch: refetchWIRs
  } = useSupabaseWIRs();

  const {
    contractors,
    engineers,
    loading: staffLoading,
    addContractor,
    updateContractor,
    deleteContractor,
    addEngineer,
    updateEngineer,
    deleteEngineer,
    refetch: refetchStaff
  } = useSupabaseStaff();

  const loading = boqLoading || breakdownLoading || wirsLoading || staffLoading;

  const addBreakdownSubItem = async (parentId: string, item: Omit<BreakdownItem, 'id'>) => {
    const subItem = {
      ...item,
      parentBreakdownId: parentId
    };
    return await addBreakdownItem(subItem);
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchBOQ(),
      refetchBreakdown(),
      refetchWIRs(),
      refetchStaff()
    ]);
  };

  const value = {
    boqItems,
    breakdownItems,
    percentageAdjustments: breakdownItems, // Alias for backward compatibility
    wirs,
    contractors,
    engineers,
    loading,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    addBreakdownItem,
    addBreakdownSubItem,
    updateBreakdownItem,
    deleteBreakdownItem,
    addPercentageAdjustment: addBreakdownItem, // Alias
    updatePercentageAdjustment: updateBreakdownItem, // Alias
    deletePercentageAdjustment: deleteBreakdownItem, // Alias
    addWIR,
    updateWIR,
    deleteWIR,
    addContractor,
    updateContractor,
    deleteContractor,
    addEngineer,
    updateEngineer,
    deleteEngineer,
    refetchAll
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
