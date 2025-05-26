
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
    deleteBreakdownItem
  } = useBreakdownManagement();

  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Break-Down Items / وصف البنود الفرعية (Level 5 Only)</h2>
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
      </div>
      
      <BreakdownTable
        breakdownItems={breakdownItems}
        boqItems={boqItems}
        language={language}
        onEdit={handleEdit}
        onDelete={deleteBreakdownItem}
      />
    </div>
  );
};

export default Breakdown;
