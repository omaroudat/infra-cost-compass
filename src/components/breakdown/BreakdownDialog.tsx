
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BreakdownItem, BOQItem } from '../../types';
import BreakdownForm from './BreakdownForm';

interface BreakdownDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: string | null;
  newItem: Partial<BreakdownItem>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  boqItems: BOQItem[];
}

const BreakdownDialog: React.FC<BreakdownDialogProps> = ({
  isOpen,
  onOpenChange,
  editingItem,
  newItem,
  onInputChange,
  onSelectChange,
  onSave,
  onReset,
  boqItems
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Break-Down Item</DialogTitle>
          <DialogDescription>
            Modify the description and percentage for this breakdown item. 
            The value will be automatically calculated based on the BOQ item's unit rate.
          </DialogDescription>
        </DialogHeader>
        <BreakdownForm
          newItem={newItem}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
          boqItems={boqItems}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onReset}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BreakdownDialog;
