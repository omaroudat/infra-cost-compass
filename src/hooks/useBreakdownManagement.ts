
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BreakdownItem } from '../types';
import { toast } from 'sonner';

export const useBreakdownManagement = () => {
  const { 
    breakdownItems, 
    boqItems, 
    addBreakdownItem, 
    updateBreakdownItem, 
    deleteBreakdownItem, 
    addBreakdownSubItem,
    loading 
  } = useAppContext();
  
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
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  // Auto-create breakdown items for leaf items that have quantity > 0
  useEffect(() => {
    if (loading || !boqItems.length) return;

    const allFlatItems = flattenedBOQItems(boqItems);
    
    // Find leaf items (items that don't have children and have quantity > 0)
    const leafItemsWithQuantity = allFlatItems.filter(item => {
      const hasChildren = item.children && item.children.length > 0;
      const hasQuantity = item.quantity && item.quantity > 0;
      return !hasChildren && hasQuantity;
    });
    
    console.log('Leaf items with quantity:', leafItemsWithQuantity.map(item => ({ code: item.code, quantity: item.quantity, hasChildren: item.children?.length > 0 })));
    
    leafItemsWithQuantity.forEach(async (boqItem) => {
      const existingBreakdown = breakdownItems?.find(bd => bd.boqItemId === boqItem.id && !bd.parentBreakdownId);
      
      if (!existingBreakdown) {
        const autoBreakdownItem = {
          keyword: boqItem.code,
          keywordAr: boqItem.code,
          description: boqItem.description,
          descriptionAr: boqItem.descriptionAr || boqItem.description,
          percentage: 0,
          value: boqItem.unitRate,
          boqItemId: boqItem.id,
          unitRate: boqItem.unitRate,
          quantity: boqItem.quantity,
          isLeaf: true
        };
        
        console.log('Creating breakdown item for:', boqItem.code);
        try {
          await addBreakdownItem(autoBreakdownItem);
        } catch (error) {
          console.error('Error creating auto breakdown item:', error);
        }
      }
    });
  }, [boqItems, breakdownItems, addBreakdownItem, loading]);

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

  const handleSave = async () => {
    if (!editingItem) {
      toast.error('No item selected for editing.');
      return;
    }
    
    // Get the current breakdown item
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

    // Calculate value based on percentage of BOQ unit rate (for sub-items)
    let calculatedValue = currentBreakdown.value;
    if (currentBreakdown.parentBreakdownId && newItem.percentage) {
      calculatedValue = (boqItem.unitRate * (newItem.percentage || 0)) / 100;
    }
    
    const updatedItem = {
      ...newItem,
      value: calculatedValue,
      boqItemId: currentBreakdown.boqItemId,
      keyword: currentBreakdown.keyword,
      keywordAr: currentBreakdown.keywordAr,
      parentBreakdownId: currentBreakdown.parentBreakdownId,
      unitRate: boqItem.unitRate,
      quantity: boqItem.quantity
    };
    
    try {
      await updateBreakdownItem(editingItem, updatedItem);
      toast.success('Breakdown item updated successfully.');
      resetForm();
    } catch (error) {
      console.error('Error updating breakdown item:', error);
    }
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

  const handleAddSubItem = async (parentId: string, subItemData: Omit<BreakdownItem, 'id'>) => {
    // Get parent breakdown item to inherit BOQ quantity
    const parentBreakdown = breakdownItems?.find(item => item.id === parentId);
    if (parentBreakdown) {
      const boqItem = flattenedBOQItems(boqItems).find(item => item.id === parentBreakdown.boqItemId);
      if (boqItem) {
        // Use BOQ quantity for sub-items as well
        const subItemWithQuantity = {
          ...subItemData,
          quantity: boqItem.quantity
        };
        
        try {
          await addBreakdownSubItem(parentId, subItemWithQuantity);
        } catch (error) {
          console.error('Error adding sub-item:', error);
        }
      }
    }
  };

  // Disable add/delete functions for main items
  const handleAddDisabled = () => {
    toast.info('Breakdown items are automatically created from leaf BOQ items with quantities.');
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
    loading,
    handleInputChange,
    handleSelectChange,
    handleSave,
    resetForm,
    handleEdit,
    handleAddSubItem,
    deleteBreakdownItem: handleDeleteDisabled,
    addBreakdownItem: handleAddDisabled
  };
};
