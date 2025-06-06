
import { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { calculateWIRAmount } from '@/utils/calculations';
import { toast } from 'sonner';

export const useWIRManagement = () => {
  const { wirs, boqItems, breakdownItems, addWIR, updateWIR, deleteWIR } = useAppContext();
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
    region: '',
    value: 0,
    linkedBOQItems: [],
    lengthOfLine: 0,
    diameterOfLine: 0,
    lineNo: ''
  });
  
  // Filter to show leaf BOQ items with quantity > 0 (same logic as breakdown)
  const flattenedBOQItems = (() => {
    const result: BOQItem[] = [];
    const flattenItems = (items: BOQItem[]) => {
      items.forEach(item => {
        // Check if this item is a leaf (no children) and has quantity > 0
        const hasChildren = item.children && item.children.length > 0;
        const hasQuantity = item.quantity && item.quantity > 0;
        
        if (!hasChildren && hasQuantity) {
          result.push(item);
        }
        
        // Continue flattening children
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
      region: wir.region || '',
      value: wir.value || 0,
      linkedBOQItems: wir.linkedBOQItems || [wir.boqItemId],
      lengthOfLine: wir.lengthOfLine || 0,
      diameterOfLine: wir.diameterOfLine || 0,
      lineNo: wir.lineNo || ''
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
      region: wir.region || '',
      value: wir.value || 0,
      linkedBOQItems: wir.linkedBOQItems || [wir.boqItemId],
      lengthOfLine: wir.lengthOfLine || 0,
      diameterOfLine: wir.diameterOfLine || 0,
      lineNo: wir.lineNo || ''
    });
    setEditingWIR(wir.id);
    setIsSubmittingResult(true);
    setIsAddDialogOpen(true);
  };

  // Check if a WIR can have a revision requested
  const canRequestRevision = (wir: WIR) => {
    // Can only request revision for completed WIRs with result 'C' (rejected)
    if (wir.status !== 'completed' || wir.result !== 'C') {
      return false;
    }
    
    // Check if this WIR already has revisions
    const hasRevisions = wirs.some(w => w.parentWIRId === wir.id);
    return !hasRevisions;
  };

  const handleRevisionRequest = (wir: WIR) => {
    // Check if revision can be requested
    if (!canRequestRevision(wir)) {
      toast.error('Cannot request revision for this WIR.');
      return;
    }
    
    // Get the base WIR ID (remove any existing revision suffix)
    const baseWIRId = wir.originalWIRId || wir.id.split('-R')[0];
    
    // Find existing revisions for this base WIR
    const existingRevisions = wirs.filter(w => {
      const wOriginalId = w.originalWIRId || w.id.split('-R')[0];
      return wOriginalId === baseWIRId && w.id.includes('-R');
    });
    
    // Calculate next revision number
    const revisionNumber = existingRevisions.length + 1;
    const revisionId = `${baseWIRId}-R${revisionNumber}`;
    
    const revisionWIR = {
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'submitted' as const,
      statusConditions: '',
      contractor: wir.contractor,
      engineer: wir.engineer,
      region: wir.region,
      value: wir.value,
      linkedBOQItems: wir.linkedBOQItems,
      parentWIRId: wir.id,
      revisionNumber: revisionNumber,
      originalWIRId: baseWIRId
    };

    // Create revision with the specific ID
    const newRevision = addWIR(revisionWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied' | 'calculationEquation'>);
    
    // Update the revision ID in context after creation
    setTimeout(() => {
      const createdRevision = wirs.find(w => w.parentWIRId === wir.id && w.revisionNumber === revisionNumber);
      if (createdRevision && createdRevision.id !== revisionId) {
        updateWIR(createdRevision.id, { id: revisionId });
      }
    }, 100);
    
    toast.success(`Revision request created: ${revisionId}`);
  };
  
  const handleAddWIR = () => {
    if (editingWIR) {
      let updates = { ...newWIR };
      
      // If submitting result, set status to completed and received date
      if (isSubmittingResult) {
        updates.status = 'completed';
        updates.receivedDate = updates.receivedDate || new Date().toISOString().split('T')[0];
        
        // Calculate amount and equation when result is submitted
        if (updates.result === 'A' || updates.result === 'B') {
          const calculation = calculateWIRAmount(updates as WIR, breakdownItems || [], boqItems);
          updates.calculatedAmount = calculation.amount;
          updates.calculationEquation = calculation.equation;
        }
      }
      
      updateWIR(editingWIR, updates);
      toast.success(isSubmittingResult ? 'Result submitted successfully.' : 'WIR updated successfully.');
    } else {
      addWIR(newWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied' | 'calculationEquation'>);
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
      region: '',
      value: 0,
      linkedBOQItems: [],
      lengthOfLine: 0,
      diameterOfLine: 0,
      lineNo: ''
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
      region: '',
      value: 0,
      linkedBOQItems: [],
      lengthOfLine: 0,
      diameterOfLine: 0,
      lineNo: ''
    });
  };

  // Check if a WIR can have a revision requested
  const canRequestRevision = (wir: WIR) => {
    // Can only request revision for completed WIRs with result 'C' (rejected)
    if (wir.status !== 'completed' || wir.result !== 'C') {
      return false;
    }
    
    // Check if this WIR already has revisions
    const hasRevisions = wirs.some(w => w.parentWIRId === wir.id);
    return !hasRevisions;
  };

  const handleRevisionRequest = (wir: WIR) => {
    // Check if revision can be requested
    if (!canRequestRevision(wir)) {
      toast.error('Cannot request revision for this WIR.');
      return;
    }
    
    // Get the base WIR ID (remove any existing revision suffix)
    const baseWIRId = wir.originalWIRId || wir.id.split('-R')[0];
    
    // Find existing revisions for this base WIR
    const existingRevisions = wirs.filter(w => {
      const wOriginalId = w.originalWIRId || w.id.split('-R')[0];
      return wOriginalId === baseWIRId && w.id.includes('-R');
    });
    
    // Calculate next revision number
    const revisionNumber = existingRevisions.length + 1;
    const revisionId = `${baseWIRId}-R${revisionNumber}`;
    
    const revisionWIR = {
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'submitted' as const,
      statusConditions: '',
      contractor: wir.contractor,
      engineer: wir.engineer,
      region: wir.region,
      value: wir.value,
      linkedBOQItems: wir.linkedBOQItems,
      parentWIRId: wir.id,
      revisionNumber: revisionNumber,
      originalWIRId: baseWIRId,
      lengthOfLine: wir.lengthOfLine,
      diameterOfLine: wir.diameterOfLine,
      lineNo: wir.lineNo
    };

    // Create revision with the specific ID
    const newRevision = addWIR(revisionWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'breakdownApplied' | 'calculationEquation'>);
    
    // Update the revision ID in context after creation
    setTimeout(() => {
      const createdRevision = wirs.find(w => w.parentWIRId === wir.id && w.revisionNumber === revisionNumber);
      if (createdRevision && createdRevision.id !== revisionId) {
        updateWIR(createdRevision.id, { id: revisionId });
      }
    }, 100);
    
    toast.success(`Revision request created: ${revisionId}`);
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
    handleRevisionRequest,
    canRequestRevision
  };
};
