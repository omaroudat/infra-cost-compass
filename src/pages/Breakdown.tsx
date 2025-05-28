
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BreakdownDialog from '../components/breakdown/BreakdownDialog';
import BreakdownTable from '../components/breakdown/BreakdownTable';
import { useBreakdownManagement } from '../hooks/useBreakdownManagement';

const Breakdown = () => {
  const {
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
    handleAddSubItem,
    deleteBreakdownItem
  } = useBreakdownManagement();

  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Organize breakdown items into hierarchical structure
  const organizedBreakdownItems = breakdownItems?.map(item => {
    if (!item.parentBreakdownId) {
      return {
        ...item,
        children: breakdownItems?.filter(child => child.parentBreakdownId === item.id) || []
      };
    }
    return null;
  }).filter(Boolean) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Break-Down Items / وصف البنود الفرعية (Level 5 with Quantities)</h2>
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('ar')}
            >
              عربي
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Breakdown items are automatically created from Level 5 BOQ items with quantities {'>'}  0</p>
          <p>Add sub-items with percentages for detailed breakdown</p>
        </div>
      </div>
      
      {/* Only show dialog for editing sub-items */}
      {editingItem && (
        <BreakdownDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editingItem={editingItem}
          newItem={newItem}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onSave={handleSave}
          onReset={resetForm}
          boqItems={boqItems}
        />
      )}
      
      <BreakdownTable
        breakdownItems={organizedBreakdownItems}
        boqItems={boqItems}
        language={language}
        onEdit={handleEdit}
        onDelete={deleteBreakdownItem}
        onAddSubItem={handleAddSubItem}
      />
    </div>
  );
};

export default Breakdown;
