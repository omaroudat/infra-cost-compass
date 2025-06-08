
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { calculateWIRAmount } from '@/utils/calculations';
import { toast } from 'sonner';

export const useWIROperations = () => {
  const { wirs, boqItems, breakdownItems, addWIR, updateWIR, deleteWIR } = useAppContext();

  const handleEditWIR = (wir: WIR, setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>, setEditingWIR: (id: string | null) => void, setIsSubmittingResult: (value: boolean) => void, setIsAddDialogOpen: (value: boolean) => void) => {
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

  const handleSubmitResult = (wir: WIR, setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>, setEditingWIR: (id: string | null) => void, setIsSubmittingResult: (value: boolean) => void, setIsAddDialogOpen: (value: boolean) => void) => {
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

  const handleAddWIR = async (newWIR: Partial<WIR>, editingWIR: string | null, isSubmittingResult: boolean, resetForm: () => void) => {
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
      // For regular WIR creation (not revisions), don't include ID
      const wirToAdd = { ...newWIR };
      delete wirToAdd.id; // Remove id field for regular creation
      addWIR(wirToAdd as Omit<WIR, 'calculatedAmount' | 'breakdownApplied'>);
      toast.success('WIR added successfully.');
    }
    
    resetForm();
  };

  const handleDeleteWIR = (id: string) => {
    deleteWIR(id);
    toast.success('WIR deleted successfully.');
  };

  return {
    wirs,
    boqItems,
    handleEditWIR,
    handleSubmitResult,
    handleAddWIR,
    handleDeleteWIR
  };
};
