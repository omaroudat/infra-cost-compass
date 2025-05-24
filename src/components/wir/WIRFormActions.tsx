
import React from 'react';
import { Button } from '@/components/ui/button';

interface WIRFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isResultSubmission: boolean;
  editingWIR: string | null;
}

const WIRFormActions: React.FC<WIRFormActionsProps> = ({
  onCancel,
  onSubmit,
  isResultSubmission,
  editingWIR,
}) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" onClick={onSubmit}>
        {isResultSubmission ? 'Submit Result' : editingWIR ? 'Save Changes' : 'Add WIR'}
      </Button>
    </div>
  );
};

export default WIRFormActions;
