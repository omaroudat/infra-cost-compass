import React, { createContext, useContext, useState, useEffect } from 'react';
import { BOQItem, BreakdownItem, WIR, Contractor, Engineer } from '../types';
import { mockBOQItems, mockPercentageAdjustments, mockWIRs } from '../data/mockData';
import { calculateWIRAmount } from '../utils/calculations';

interface AppContextType {
  boqItems: BOQItem[];
  breakdownItems: BreakdownItem[];
  percentageAdjustments: BreakdownItem[]; // Alias for backward compatibility
  wirs: WIR[];
  contractors: Contractor[];
  engineers: Engineer[];
  addBOQItem: (item: Omit<BOQItem, 'id'>, parentId?: string) => void;
  updateBOQItem: (id: string, updates: Partial<BOQItem>) => void;
  deleteBOQItem: (id: string) => void;
  addBreakdownItem: (item: Omit<BreakdownItem, 'id'>) => void;
  updateBreakdownItem: (id: string, updates: Partial<BreakdownItem>) => void;
  deleteBreakdownItem: (id: string) => void;
  addPercentageAdjustment: (item: Omit<BreakdownItem, 'id'>) => void; // Alias
  updatePercentageAdjustment: (id: string, updates: Partial<BreakdownItem>) => void; // Alias
  deletePercentageAdjustment: (id: string) => void; // Alias
  addWIR: (wir: Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied'>) => void;
  updateWIR: (id: string, updates: Partial<WIR>) => void;
  deleteWIR: (id: string) => void;
  addContractor: (contractor: Omit<Contractor, 'id' | 'createdAt'>) => void;
  updateContractor: (id: string, updates: Partial<Contractor>) => void;
  deleteContractor: (id: string) => void;
  addEngineer: (engineer: Omit<Engineer, 'id' | 'createdAt'>) => void;
  updateEngineer: (id: string, updates: Partial<Engineer>) => void;
  deleteEngineer: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load data from localStorage or use mock data
  const [boqItems, setBoqItems] = useState<BOQItem[]>(() => {
    const saved = localStorage.getItem('wir-boq-items');
    return saved ? JSON.parse(saved) : mockBOQItems;
  });
  
  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>(() => {
    const saved = localStorage.getItem('wir-breakdown-items');
    return saved ? JSON.parse(saved) : mockPercentageAdjustments.map(adj => ({
      ...adj,
      boqItemId: mockBOQItems[0]?.id || ''
    }));
  });
  
  const [wirs, setWirs] = useState<WIR[]>(() => {
    const saved = localStorage.getItem('wir-wirs');
    return saved ? JSON.parse(saved) : mockWIRs.map(wir => ({
      ...wir,
      region: 'Central',
      linkedBOQItems: [wir.boqItemId]
    }));
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    const saved = localStorage.getItem('wir-contractors');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [engineers, setEngineers] = useState<Engineer[]>(() => {
    const saved = localStorage.getItem('wir-engineers');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('wir-boq-items', JSON.stringify(boqItems));
  }, [boqItems]);

  useEffect(() => {
    localStorage.setItem('wir-breakdown-items', JSON.stringify(breakdownItems));
  }, [breakdownItems]);

  useEffect(() => {
    localStorage.setItem('wir-wirs', JSON.stringify(wirs));
  }, [wirs]);

  useEffect(() => {
    localStorage.setItem('wir-contractors', JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem('wir-engineers', JSON.stringify(engineers));
  }, [engineers]);

  // BOQ Item functions
  const addBOQItem = (item: Omit<BOQItem, 'id'>, parentId?: string) => {
    const newItem = {
      ...item,
      id: `boq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      totalAmount: item.quantity * item.unitRate
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
          if (item.children) {
            return {
              ...item,
              children: item.children.map(child => 
                addToNestedItem(child, parentId, newItem)
              )
            };
          }
          return item;
        });
      });
    } else {
      setBoqItems(prevItems => [...prevItems, newItem]);
    }
  };

  const addToNestedItem = (item: BOQItem, parentId: string, newItem: BOQItem): BOQItem => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), { ...newItem, parentId }]
      };
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => addToNestedItem(child, parentId, newItem))
      };
    }
    return item;
  };

  const updateBOQItem = (id: string, updates: Partial<BOQItem>) => {
    setBoqItems(prevItems => {
      return prevItems.map(item => updateNestedBOQItem(item, id, updates));
    });
  };

  const updateNestedBOQItem = (item: BOQItem, id: string, updates: Partial<BOQItem>): BOQItem => {
    if (item.id === id) {
      const updated = { ...item, ...updates };
      if (updates.quantity !== undefined || updates.unitRate !== undefined) {
        updated.totalAmount = updated.quantity * updated.unitRate;
      }
      return updated;
    }
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => updateNestedBOQItem(child, id, updates))
      };
    }
    return item;
  };

  const deleteBOQItem = (id: string) => {
    setBoqItems(prevItems => {
      return prevItems.filter(item => item.id !== id).map(item => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter(child => child.id !== id).map(child => 
              deleteFromNestedItem(child, id)
            )
          };
        }
        return item;
      });
    });
  };

  const deleteFromNestedItem = (item: BOQItem, id: string): BOQItem => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => child.id !== id).map(child => 
          deleteFromNestedItem(child, id)
        )
      };
    }
    return item;
  };

  // Breakdown Item functions
  const addBreakdownItem = (item: Omit<BreakdownItem, 'id'>) => {
    const newItem = {
      ...item,
      id: `breakdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setBreakdownItems(prev => [...prev, newItem]);
  };

  const updateBreakdownItem = (id: string, updates: Partial<BreakdownItem>) => {
    setBreakdownItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
    });
  };

  const deleteBreakdownItem = (id: string) => {
    setBreakdownItems(prev => prev.filter(item => item.id !== id));
  };

  // WIR functions
  const addWIR = (wir: Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied'>) => {
    const baseId = wir.originalWIRId || `wir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWIR: WIR = {
      ...wir,
      id: baseId,
      calculatedAmount: null,
      breakdownApplied: null,
      linkedBOQItems: wir.linkedBOQItems || [wir.boqItemId]
    };

    console.log('Adding new WIR:', newWIR);
    setWirs(prev => [...prev, newWIR]);
  };

  const updateWIR = (id: string, updates: Partial<WIR>) => {
    console.log('Updating WIR:', id, updates);
    setWirs(prev => {
      return prev.map(wir => {
        if (wir.id === id) {
          const updatedWIR = { ...wir, ...updates };
          
          console.log('Updated WIR before calculation:', updatedWIR);
          
          // Calculate amount if result is A or B and status is completed
          if ((updatedWIR.result === 'A' || updatedWIR.result === 'B') && 
              updatedWIR.status === 'completed') {
            console.log('Calculating amount for WIR:', updatedWIR);
            const calculation = calculateWIRAmount(updatedWIR, breakdownItems, boqItems);
            console.log('Calculation result:', calculation);
            updatedWIR.calculatedAmount = calculation.amount;
            updatedWIR.calculationEquation = calculation.equation;
          } else if (updatedWIR.result === 'C' || updatedWIR.status === 'submitted') {
            updatedWIR.calculatedAmount = null;
            updatedWIR.calculationEquation = '';
          }
          
          console.log('Final updated WIR:', updatedWIR);
          return updatedWIR;
        }
        return wir;
      });
    });
  };

  const deleteWIR = (id: string) => {
    setWirs(prev => prev.filter(wir => wir.id !== id));
  };

  // Contractor functions
  const addContractor = (contractor: Omit<Contractor, 'id' | 'createdAt'>) => {
    const newContractor: Contractor = {
      ...contractor,
      id: `contractor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setContractors(prev => [...prev, newContractor]);
  };

  const updateContractor = (id: string, updates: Partial<Contractor>) => {
    setContractors(prev => prev.map(contractor => 
      contractor.id === id ? { ...contractor, ...updates } : contractor
    ));
  };

  const deleteContractor = (id: string) => {
    setContractors(prev => prev.filter(contractor => contractor.id !== id));
  };

  // Engineer functions
  const addEngineer = (engineer: Omit<Engineer, 'id' | 'createdAt'>) => {
    const newEngineer: Engineer = {
      ...engineer,
      id: `engineer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setEngineers(prev => [...prev, newEngineer]);
  };

  const updateEngineer = (id: string, updates: Partial<Engineer>) => {
    setEngineers(prev => prev.map(engineer => 
      engineer.id === id ? { ...engineer, ...updates } : engineer
    ));
  };

  const deleteEngineer = (id: string) => {
    setEngineers(prev => prev.filter(engineer => engineer.id !== id));
  };

  const value = {
    boqItems,
    breakdownItems,
    percentageAdjustments: breakdownItems, // Alias for backward compatibility
    wirs,
    contractors,
    engineers,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    addBreakdownItem,
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
    deleteEngineer
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
