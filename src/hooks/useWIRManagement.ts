import { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

export const useWIRManagement = () => {
  const { wirs, boqItems, addWIR, updateWIR, deleteWIR } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWIR, setEditingWIR] = useState<string | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [newWIR, setNewWIR] = useState<Partial<WIR>>({
    boqItemId: '',
    description: '',
    submittalDate: new Date().toISOString().split('T')[0],
    receivedDate: null,
    status: 'submitted',
    statusConditions: '',
    contractor: '',
    engineer: '',
    lengthOfLine: 0,
    diameterOfLine: 0,
    lineNo: '',
    region: '',
    linkedBOQItems: []
  });
  
  // Filter to only show Level 5 BOQ items
  const flattenedBOQItems = (() => {
    const result: BOQItem[] = [];
    const flattenItems = (items: BOQItem[]) => {
      items.forEach(item => {
        const codeLevel = (item.code.match(/\./g) || []).length + 1;
        if (codeLevel === 5) {
          result.push(item);
        }
        if (item.children && item.children.length > 0) {
          flattenItems(item.children);
        }
      });
    };
    flattenItems(boqItems);
    return result;
  })();
  
  const handleEditWIR = (wir: WIR) => {
    setNewWIR({
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: wir.submittalDate,
      receivedDate: wir.receivedDate,
      status: wir.status,
      result: wir.result,
      statusConditions: wir.statusConditions || '',
      contractor: wir.contractor || '',
      engineer: wir.engineer || '',
      lengthOfLine: wir.lengthOfLine || 0,
      diameterOfLine: wir.diameterOfLine || 0,
      lineNo: wir.lineNo || '',
      region: wir.region || '',
      linkedBOQItems: wir.linkedBOQItems || [wir.boqItemId]
    });
    setEditingWIR(wir.id);
    setIsSubmittingResult(false);
    setIsAddDialogOpen(true);
  };

  const handleSubmitResult = (wir: WIR) => {
    setNewWIR({
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: wir.submittalDate,
      receivedDate: wir.receivedDate,
      status: wir.status,
      result: wir.result,
      statusConditions: wir.statusConditions || '',
      contractor: wir.contractor || '',
      engineer: wir.engineer || '',
      lengthOfLine: wir.lengthOfLine || 0,
      diameterOfLine: wir.diameterOfLine || 0,
      lineNo: wir.lineNo || '',
      region: wir.region || '',
      linkedBOQItems: wir.linkedBOQItems || [wir.boqItemId]
    });
    setEditingWIR(wir.id);
    setIsSubmittingResult(true);
    setIsAddDialogOpen(true);
  };

  const handleRevisionRequest = (wir: WIR) => {
    // Create a new revision
    const revisionNumber = (wir.revisionNumber || 0) + 1;
    const originalWIRId = wir.originalWIRId || wir.id;
    
    const revisionWIR = {
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'submitted' as const,
      statusConditions: '',
      contractor: wir.contractor,
      engineer: wir.engineer,
      lengthOfLine: wir.lengthOfLine,
      diameterOfLine: wir.diameterOfLine,
      lineNo: wir.lineNo,
      region: wir.region,
      linkedBOQItems: wir.linkedBOQItems,
      parentWIRId: wir.id,
      revisionNumber: revisionNumber,
      originalWIRId: originalWIRId
    };

    addWIR(revisionWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied'>);
    toast.success(`Revision request created: ${originalWIRId}_R${revisionNumber}`);
  };
  
  const handleAddWIR = () => {
    if (editingWIR) {
      let updates = { ...newWIR };
      
      // If submitting result, set status to completed and received date
      if (isSubmittingResult) {
        updates.status = 'completed';
        updates.receivedDate = updates.receivedDate || new Date().toISOString().split('T')[0];
      }
      
      updateWIR(editingWIR, updates);
      toast.success(isSubmittingResult ? 'Result submitted successfully.' : 'WIR updated successfully.');
    } else {
      addWIR(newWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied'>);
      toast.success('WIR added successfully.');
    }
    
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'submitted',
      statusConditions: '',
      contractor: '',
      engineer: '',
      lengthOfLine: 0,
      diameterOfLine: 0,
      lineNo: '',
      region: '',
      linkedBOQItems: []
    });
    setEditingWIR(null);
    setIsSubmittingResult(false);
    setIsAddDialogOpen(false);
  };
  
  const handleDeleteWIR = (id: string) => {
    deleteWIR(id);
    toast.success('WIR deleted successfully.');
  };
  
  const handleCancelForm = () => {
    setIsAddDialogOpen(false);
    setEditingWIR(null);
    setIsSubmittingResult(false);
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'submitted',
      statusConditions: '',
      contractor: '',
      engineer: '',
      lengthOfLine: 0,
      diameterOfLine: 0,
      lineNo: '',
      region: '',
      linkedBOQItems: []
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
    handleCancelForm,
    handleSubmitResult,
    handleRevisionRequest
  };
};
