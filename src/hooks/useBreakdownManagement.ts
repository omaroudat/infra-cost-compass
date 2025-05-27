
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BreakdownItem } from '../types';
import { toast } from 'sonner';

export const useBreakdownManagement = () => {
  const { breakdownItems, boqItems, addBreakdownItem, updateBreakdownItem, deleteBreakdownItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BreakdownItem>>({
    keyword: '',
    keywordAr: '',
    description: '',
    descriptionAr: '',
    percentage: 0,
    value: 0,
    boqItemId: '',
  });

  const flattenedBOQItems = (items: any[]): any[] => {
    const result: any[] = [];
    items.forEach(item => {
      const codeLevel = (item.code.match(/\./g) || []).length + 1;
      if (codeLevel === 5) {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  // Auto-create breakdown items for Level 5 BOQ items
  useEffect(() => {
    const level5Items = flattenedBOQItems(boqItems);
    
    level5Items.forEach(boqItem => {
      const existingBreakdown = breakdownItems?.find(bd => bd.boqItemId === boqItem.id);
      
      if (!existingBreakdown) {
        const autoBreakdownItem = {
          keyword: boqItem.code,
          keywordAr: boqItem.code,
          description: boqItem.description,
          descriptionAr: boqItem.descriptionAr || boqItem.description,
          percentage: 0,
          value: boqItem.unitRate,
          boqItemId: boqItem.id,
        };
        
        addBreakdownItem(autoBreakdownItem);
      }
    });
  }, [boqItems, breakdownItems, addBreakdownItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'percentage' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // BOQ item selection is disabled
    return;
  };

  const handleSave = () => {
    if (!editingItem) {
      toast.error('No item selected for editing.');
      return;
    }
    
    // Get the current BOQ item to recalculate value based on percentage
    const currentBreakdown = breakdownItems?.find(item => item.id === editingItem);
    if (!currentBreakdown) {
      toast.error('Breakdown item not found.');
      return;
    }

    const boqItem = flattenedBOQItems(boqItems).find(item => item.id === currentBreakdown.boqItemId);
    if (!boqItem) {
      toast.error('Associated BOQ item not found.');
      return;
    }

    // Calculate value based on percentage of BOQ unit rate
    const calculatedValue = (boqItem.unitRate * (newItem.percentage || 0)) / 100;
    
    const updatedItem = {
      ...newItem,
      value: calculatedValue,
      boqItemId: currentBreakdown.boqItemId, // Keep original BOQ item
      keyword: currentBreakdown.keyword, // Keep original keyword
      keywordAr: currentBreakdown.keywordAr, // Keep original keyword
    };
    
    updateBreakdownItem(editingItem, updatedItem);
    toast.success('Breakdown item updated successfully.');
    
    resetForm();
  };

  const resetForm = () => {
    setNewItem({
      keyword: '',
      keywordAr: '',
      description: '',
      descriptionAr: '',
      percentage: 0,
      value: 0,
      boqItemId: '',
    });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: BreakdownItem) => {
    setNewItem({
      keyword: item.keyword,
      keywordAr: item.keywordAr,
      description: item.description,
      descriptionAr: item.descriptionAr,
      percentage: item.percentage,
      value: item.value,
      boqItemId: item.boqItemId,
    });
    setEditingItem(item.id);
    setIsAddDialogOpen(true);
  };

  // Disable add/delete functions
  const handleAddDisabled = () => {
    toast.info('Breakdown items are automatically created from Level 5 BOQ items.');
  };

  const handleDeleteDisabled = () => {
    toast.info('Breakdown items cannot be deleted. They are linked to BOQ items.');
  };

  return {
    breakdownItems,
    boqItems,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingItem,
    newItem,
    handleInputChange,
    handleSelectChange,
    handleSave,
    resetForm,
    handleEdit,
    deleteBreakdownItem: handleDeleteDisabled,
    addBreakdownItem: handleAddDisabled
  };
};
