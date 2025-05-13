
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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingWIR ? 'Edit' : 'Add'} Work Inspection Request</DialogTitle>
          <DialogDescription>
            Fill in the details for the work inspection request.
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
