
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle, X } from 'lucide-react';

interface WIRFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isResultSubmission?: boolean;
  editingWIR?: string | null;
}

const WIRFormActions: React.FC<WIRFormActionsProps> = ({
  onCancel,
  onSubmit,
  isResultSubmission = false,
  editingWIR,
}) => {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        className="flex items-center gap-2 min-w-[120px]"
      >
        {isResultSubmission ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Submit Result
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {editingWIR ? 'Update WIR' : 'Create WIR'}
          </>
        )}
      </Button>
    </div>
  );
};

export default WIRFormActions;
