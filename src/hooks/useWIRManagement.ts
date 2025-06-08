
import { useAppContext } from '@/context/AppContext';
import { useWIRFormState } from './wir/useWIRFormState';
import { useWIROperations } from './wir/useWIROperations';
import { useWIRRevisions } from './wir/useWIRRevisions';
import { getFlattenedBOQItems } from '@/utils/wirUtils';

export const useWIRManagement = () => {
  const { boqItems } = useAppContext();
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWIR,
    setEditingWIR,
    isSubmittingResult,
    setIsSubmittingResult,
    newWIR,
    setNewWIR,
    resetForm
  } = useWIRFormState();

  const {
    wirs,
    handleEditWIR: editWIR,
    handleSubmitResult: submitResult,
    handleAddWIR: addWIRHandler,
    handleDeleteWIR
  } = useWIROperations();

  const {
    canRequestRevision,
    handleRevisionRequest
  } = useWIRRevisions();

  // Get flattened BOQ items
  const flattenedBOQItems = getFlattenedBOQItems(boqItems);

  const handleEditWIR = (wir: any) => {
    editWIR(wir, setNewWIR, setEditingWIR, setIsSubmittingResult, setIsAddDialogOpen);
  };

  const handleSubmitResult = (wir: any) => {
    submitResult(wir, setNewWIR, setEditingWIR, setIsSubmittingResult, setIsAddDialogOpen);
  };

  const handleAddWIR = () => {
    addWIRHandler(newWIR, editingWIR, isSubmittingResult, resetForm);
  };

  const handleCancelForm = () => {
    resetForm();
  };

  return {
    wirs,
    boqItems,
    flattenedBOQItems,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWIR,
    newWIR,
    setNewWIR,
    handleAddWIR,
    handleEditWIR,
    handleDeleteWIR,
    handleCancelForm,
    handleSubmitResult,
    handleRevisionRequest,
    canRequestRevision
  };
};
