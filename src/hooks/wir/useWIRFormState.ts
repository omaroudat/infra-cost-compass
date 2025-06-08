
import { useState } from 'react';
import { WIR } from '@/types';

export const useWIRFormState = () => {
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

  const resetForm = () => {
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

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWIR,
    setEditingWIR,
    isSubmittingResult,
    setIsSubmittingResult,
    newWIR,
    setNewWIR,
    resetForm
  };
};
