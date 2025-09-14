
import { useState, useEffect } from 'react';
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';

const generateDefaultWIRNumber = (): string => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  return `WIR-${day}-${month}-${year}-0001`;
};

export const useWIRFormState = () => {
  const { generateWIRNumber } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWIR, setEditingWIR] = useState<string | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [newWIR, setNewWIR] = useState<Partial<WIR>>({
    boqItemId: '',
    description: '',
    submittalDate: new Date().toISOString().split('T')[0],
    startTaskOnSite: '',
    receivedDate: null,
    status: 'submitted',
    statusConditions: '',
    contractor: '',
    engineer: '',
    region: '',
    manholeFrom: '',
    manholeTo: '',
    zone: '',
    road: '',
    line: '',
    value: 0,
    linkedBOQItems: [],
    lengthOfLine: 0,
    diameterOfLine: 0,
    lineNo: '',
    attachments: [],
    wirNumber: generateDefaultWIRNumber()
  });

  // Auto-generate WIR number when dialog opens for new WIR
  useEffect(() => {
    if (isAddDialogOpen && !editingWIR && generateWIRNumber) {
      generateWIRNumber().then(wirNumber => {
        setNewWIR(prev => ({ ...prev, wirNumber }));
      });
    }
  }, [isAddDialogOpen, editingWIR, generateWIRNumber]);

  const resetForm = () => {
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      startTaskOnSite: '',
      receivedDate: null,
      status: 'submitted',
      statusConditions: '',
      contractor: '',
      engineer: '',
      region: '',
      manholeFrom: '',
      manholeTo: '',
      zone: '',
      road: '',
      line: '',
      value: 0,
      linkedBOQItems: [],
      lengthOfLine: 0,
      diameterOfLine: 0,
      lineNo: '',
      attachments: [],
      wirNumber: generateDefaultWIRNumber()
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
