
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { toast } from 'sonner';
import WIRBasicInfoForm from './WIRBasicInfoForm';
import WIRLocationForm from './WIRLocationForm';
import WIRResultForm from './WIRResultForm';
import WIRFormActions from './WIRFormActions';

interface WIRFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  editingWIR: string | null;
  flattenedBOQItems: BOQItem[];
  onCancel: () => void;
  onSubmit: () => void;
}

const WIRForm: React.FC<WIRFormProps> = ({
  newWIR,
  setNewWIR,
  editingWIR,
  flattenedBOQItems,
  onCancel,
  onSubmit,
}) => {
  const handleSubmit = () => {
    const required = [
      'boqItemId', 'description', 'submittalDate', 'status', 
      'contractor', 'engineer', 'lengthOfLine', 'diameterOfLine', 
      'lineNo', 'region'
    ];
    
    const missing = required.filter(field => !newWIR[field as keyof typeof newWIR]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    onSubmit();
  };

  // Check if this is a result submission (editing an existing submitted WIR)
  const isResultSubmission = editingWIR && newWIR.status === 'submitted';

  return (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <WIRBasicInfoForm
        newWIR={newWIR}
        setNewWIR={setNewWIR}
        flattenedBOQItems={flattenedBOQItems}
        isResultSubmission={isResultSubmission}
      />
      
      <WIRLocationForm
        newWIR={newWIR}
        setNewWIR={setNewWIR}
        isResultSubmission={isResultSubmission}
      />
      
      <WIRResultForm
        newWIR={newWIR}
        setNewWIR={setNewWIR}
        isResultSubmission={isResultSubmission}
      />
      
      <WIRFormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isResultSubmission={isResultSubmission}
        editingWIR={editingWIR}
      />
    </div>
  );
};

export default WIRForm;
