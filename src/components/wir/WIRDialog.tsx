
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WIRForm from './WIRForm';

interface WIRDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  editingWIR: string | null;
  flattenedBOQItems: BOQItem[];
  onCancel: () => void;
  onSubmit: () => void;
}

const WIRDialog: React.FC<WIRDialogProps> = ({
  isOpen,
  setIsOpen,
  newWIR,
  setNewWIR,
  editingWIR,
  flattenedBOQItems,
  onCancel,
  onSubmit
}) => {
  const isResultSubmission = editingWIR && newWIR.status === 'submitted';
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isResultSubmission 
              ? 'Submit Inspection Result' 
              : editingWIR 
                ? 'Edit Work Inspection Request' 
                : 'Create New Work Inspection Request'
            }
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isResultSubmission 
              ? 'Review and submit the inspection results for this WIR.'
              : 'Fill in the comprehensive details for the work inspection request. All required fields must be completed.'
            }
          </DialogDescription>
        </DialogHeader>
        <WIRForm
          newWIR={newWIR}
          setNewWIR={setNewWIR}
          editingWIR={editingWIR}
          flattenedBOQItems={flattenedBOQItems}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WIRDialog;
