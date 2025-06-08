
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

export const useWIRRevisions = () => {
  const { wirs, addWIR } = useAppContext();

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
    
    // Get the base WIR number (remove any existing revision suffix from wir_number)
    const baseWIRNumber = wir.id.split('_R')[0];
    
    // Find existing revisions for this base WIR by checking parentWIRId
    const existingRevisions = wirs.filter(w => w.parentWIRId === wir.id);
    
    // Calculate next revision number
    const revisionNumber = existingRevisions.length + 1;
    const revisionWIRNumber = `${baseWIRNumber}_R${revisionNumber}`;
    
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
      selectedBreakdownItems: wir.selectedBreakdownItems,
      parentWIRId: wir.id,
      revisionNumber: revisionNumber,
      originalWIRId: wir.originalWIRId || wir.id,
      lengthOfLine: wir.lengthOfLine,
      diameterOfLine: wir.diameterOfLine,
      lineNo: wir.lineNo,
      // Set custom WIR number but let database generate UUID for id
      wirNumber: revisionWIRNumber
    };

    // Add the revision WIR - don't include custom id field
    addWIR(revisionWIR as Omit<WIR, 'calculatedAmount' | 'breakdownApplied'>);
    
    toast.success(`Revision request created: ${revisionWIRNumber}`);
  };

  return {
    canRequestRevision,
    handleRevisionRequest
  };
};
