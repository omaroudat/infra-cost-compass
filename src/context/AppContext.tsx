
import React, { createContext, useContext, useState } from 'react';
import { BOQItem, PercentageAdjustment, WIR } from '../types';
import { mockBOQItems, mockPercentageAdjustments, mockWIRs } from '../data/mockData';
import { calculateWIRAmount, findApplicableAdjustment, findBOQItemById } from '../utils/calculations';

interface AppContextType {
  boqItems: BOQItem[];
  percentageAdjustments: PercentageAdjustment[];
  wirs: WIR[];
  addBOQItem: (item: Omit<BOQItem, 'id'>, parentId?: string) => void;
  updateBOQItem: (id: string, updates: Partial<BOQItem>) => void;
  deleteBOQItem: (id: string) => void;
  addPercentageAdjustment: (adjustment: Omit<PercentageAdjustment, 'id'>) => void;
  updatePercentageAdjustment: (id: string, updates: Partial<PercentageAdjustment>) => void;
  deletePercentageAdjustment: (id: string) => void;
  addWIR: (wir: Omit<WIR, 'id' | 'calculatedAmount' | 'adjustmentApplied'>) => void;
  updateWIR: (id: string, updates: Partial<WIR>) => void;
  deleteWIR: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [boqItems, setBoqItems] = useState<BOQItem[]>(mockBOQItems);
  const [percentageAdjustments, setPercentageAdjustments] = useState<PercentageAdjustment[]>(mockPercentageAdjustments);
  const [wirs, setWirs] = useState<WIR[]>(mockWIRs);

  // BOQ Item functions
  const addBOQItem = (item: Omit<BOQItem, 'id'>, parentId?: string) => {
    const newItem = {
      ...item,
      id: `boq-${Date.now()}`
    };

    if (parentId) {
      setBoqItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), { ...newItem, parentId }]
            };
          }
          return item;
        });
      });
    } else {
      setBoqItems(prevItems => [...prevItems, newItem]);
    }
  };

  const updateBOQItem = (id: string, updates: Partial<BOQItem>) => {
    setBoqItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map(child => {
              if (child.id === id) {
                return { ...child, ...updates };
              }
              return child;
            })
          };
        }
        return item;
      });
    });
  };

  const deleteBOQItem = (id: string) => {
    setBoqItems(prevItems => {
      // Filter out the item if it's a top-level item
      const filteredItems = prevItems.filter(item => item.id !== id);
      
      // If the length is the same, the item wasn't a top-level item
      if (filteredItems.length === prevItems.length) {
        // Filter the item from children arrays
        return filteredItems.map(item => {
          if (item.children) {
            return {
              ...item,
              children: item.children.filter(child => child.id !== id)
            };
          }
          return item;
        });
      }
      
      return filteredItems;
    });
  };

  // Percentage Adjustment functions
  const addPercentageAdjustment = (adjustment: Omit<PercentageAdjustment, 'id'>) => {
    const newAdjustment = {
      ...adjustment,
      id: `adj-${Date.now()}`
    };
    setPercentageAdjustments(prev => [...prev, newAdjustment]);
  };

  const updatePercentageAdjustment = (id: string, updates: Partial<PercentageAdjustment>) => {
    setPercentageAdjustments(prev => {
      return prev.map(adjustment => {
        if (adjustment.id === id) {
          return { ...adjustment, ...updates };
        }
        return adjustment;
      });
    });
  };

  const deletePercentageAdjustment = (id: string) => {
    setPercentageAdjustments(prev => prev.filter(adjustment => adjustment.id !== id));
  };

  // WIR functions
  const addWIR = (wir: Omit<WIR, 'id' | 'calculatedAmount' | 'adjustmentApplied'>) => {
    const adjustment = findApplicableAdjustment(wir.description);
    
    const newWIR: WIR = {
      ...wir,
      id: `wir-${Date.now()}`,
      calculatedAmount: null,
      adjustmentApplied: adjustment
    };

    // Calculate amount if status is A or B
    if (wir.status === 'A' || wir.status === 'B') {
      newWIR.calculatedAmount = calculateWIRAmount(newWIR);
    }

    setWirs(prev => [...prev, newWIR]);
  };

  const updateWIR = (id: string, updates: Partial<WIR>) => {
    setWirs(prev => {
      return prev.map(wir => {
        if (wir.id === id) {
          const updatedWIR = { ...wir, ...updates };
          
          // Recalculate amount if relevant fields changed
          if (
            updates.boqItemId !== undefined ||
            updates.description !== undefined ||
            updates.status !== undefined
          ) {
            // Find applicable adjustment based on description
            const adjustment = updates.description 
              ? findApplicableAdjustment(updates.description) 
              : wir.adjustmentApplied;
            
            updatedWIR.adjustmentApplied = adjustment;
            
            // Calculate amount if status is A or B
            if ((updates.status === 'A' || updates.status === 'B') || 
                ((wir.status === 'A' || wir.status === 'B') && updates.status === undefined)) {
              updatedWIR.calculatedAmount = calculateWIRAmount(updatedWIR);
            } else if (updates.status === 'C') {
              updatedWIR.calculatedAmount = null;
            }
          }
          
          return updatedWIR;
        }
        return wir;
      });
    });
  };

  const deleteWIR = (id: string) => {
    setWirs(prev => prev.filter(wir => wir.id !== id));
  };

  const value = {
    boqItems,
    percentageAdjustments,
    wirs,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    addPercentageAdjustment,
    updatePercentageAdjustment,
    deletePercentageAdjustment,
    addWIR,
    updateWIR,
    deleteWIR
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
