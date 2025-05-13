
import { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

export const useWIRManagement = () => {
  const { wirs, boqItems, addWIR, updateWIR, deleteWIR } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWIR, setEditingWIR] = useState<string | null>(null);
  const [newWIR, setNewWIR] = useState<Partial<WIR>>({
    boqItemId: '',
    description: '',
    submittalDate: new Date().toISOString().split('T')[0],
    receivedDate: null,
    status: 'A',
    statusConditions: '',
    contractor: '',
    engineer: '',
  });
  
  const flattenedBOQItems = boqItems.flatMap(item => 
    [item, ...(item.children || [])]
  );
  
  const handleEditWIR = (wir: WIR) => {
    setNewWIR({
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: wir.submittalDate,
      receivedDate: wir.receivedDate,
      status: wir.status,
      statusConditions: wir.statusConditions || '',
      contractor: wir.contractor || '',
      engineer: wir.engineer || '',
    });
    setEditingWIR(wir.id);
    setIsAddDialogOpen(true);
  };
  
  const handleAddWIR = () => {
    if (editingWIR) {
      updateWIR(editingWIR, newWIR);
      toast.success('WIR updated successfully.');
    } else {
      addWIR(newWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'adjustmentApplied'>);
      toast.success('WIR added successfully.');
    }
    
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'A',
      statusConditions: '',
      contractor: '',
      engineer: '',
    });
    setEditingWIR(null);
    setIsAddDialogOpen(false);
  };
  
  const handleDeleteWIR = (id: string) => {
    deleteWIR(id);
    toast.success('WIR deleted successfully.');
  };
  
  const handleCancelForm = () => {
    setIsAddDialogOpen(false);
    setEditingWIR(null);
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'A',
      statusConditions: '',
      contractor: '',
      engineer: '',
    });
  };
  
  return {
    wirs,
    boqItems,
    flattenedBOQItems,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWIR,
    newWIR,
    setNewWIR,
    handleAddWIR,
    handleEditWIR,
    handleDeleteWIR,
    handleCancelForm
  };
};
