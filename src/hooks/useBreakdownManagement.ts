
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
      if (codeLevel === 6) {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  // Auto-create breakdown items for Level 6 BOQ items
  useEffect(() => {
    const level6Items = flattenedBOQItems(boqItems);
    
    level6Items.forEach(boqItem => {
      const existingBreakdown = breakdownItems?.find(bd => bd.boqItemId === boqItem.id);
      
      if (!existingBreakdown) {
        const autoBreakdownItem = {
          keyword: '',
          keywordAr: '',
          description: '',
          descriptionAr: '',
          percentage: 0,
          value: 0,
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
      [name]: name === 'percentage' || name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!newItem.boqItemId) {
      toast.error('Please select a BOQ item.');
      return;
    }
    
    if (editingItem) {
      updateBreakdownItem(editingItem, newItem);
      toast.success('Breakdown item updated successfully.');
    } else {
      addBreakdownItem(newItem as Omit<BreakdownItem, 'id'>);
      toast.success('Breakdown item added successfully.');
    }
    
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
    deleteBreakdownItem
  };
};
