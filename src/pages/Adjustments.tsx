
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PercentageAdjustment } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdjustmentForm from '@/components/adjustments/AdjustmentForm';
import AdjustmentsTable from '@/components/adjustments/AdjustmentsTable';
import AdjustmentInfoPanel from '@/components/adjustments/AdjustmentInfoPanel';

const Adjustments = () => {
  const { percentageAdjustments, addPercentageAdjustment, updatePercentageAdjustment, deletePercentageAdjustment } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<string | null>(null);
  const [newAdjustment, setNewAdjustment] = useState<Partial<PercentageAdjustment>>({
    keyword: '',
    description: '',
    percentage: 0,
    value: 0,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdjustment(prev => ({ 
      ...prev, 
      [name]: name === 'percentage' ? parseFloat(value) / 100 || 0 : 
              name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleAddAdjustment = () => {
    if (!newAdjustment.keyword || !newAdjustment.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (editingAdjustment) {
      updatePercentageAdjustment(editingAdjustment, newAdjustment);
      toast.success('Adjustment updated successfully.');
    } else {
      addPercentageAdjustment(newAdjustment as Omit<PercentageAdjustment, 'id'>);
      toast.success('Adjustment added successfully.');
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setNewAdjustment({
      keyword: '',
      description: '',
      percentage: 0,
      value: 0,
    });
    setEditingAdjustment(null);
    setIsAddDialogOpen(false);
  };

  const handleEditAdjustment = (adjustment: PercentageAdjustment) => {
    setNewAdjustment({
      keyword: adjustment.keyword,
      description: adjustment.description,
      percentage: adjustment.percentage,
      value: adjustment.value || 0,
    });
    setEditingAdjustment(adjustment.id);
    setIsAddDialogOpen(true);
  };

  const handleDeleteAdjustment = (id: string) => {
    deletePercentageAdjustment(id);
    toast.success('Adjustment deleted successfully.');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Consultant-Agreed Percentage Adjustments</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Adjustment</Button>
          </DialogTrigger>
          <AdjustmentForm 
            adjustment={newAdjustment}
            isEditing={!!editingAdjustment}
            onInputChange={handleInputChange}
            onSave={handleAddAdjustment}
            onCancel={resetForm}
          />
        </Dialog>
      </div>
      
      <AdjustmentsTable 
        adjustments={percentageAdjustments}
        onEdit={handleEditAdjustment}
        onDelete={handleDeleteAdjustment}
      />
      
      <AdjustmentInfoPanel />
    </div>
  );
};

export default Adjustments;
