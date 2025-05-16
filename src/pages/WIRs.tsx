
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import WIRTable from '@/components/wir/WIRTable';
import WIRDialog from '@/components/wir/WIRDialog';
import { useWIRManagement } from '@/hooks/useWIRManagement';

const WIRs = () => {
  const { hasPermission } = useAuth();
  const {
    wirs,
    flattenedBOQItems,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingWIR,
    newWIR,
    setNewWIR,
    handleAddWIR,
    handleEditWIR,
    handleDeleteWIR,
    handleCancelForm
  } = useWIRManagement();
  
  const canEdit = hasPermission(['admin', 'dataEntry']);
  const canDelete = hasPermission(['admin']);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Work Inspection Requests (WIRs)</h2>
        {canEdit && (
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>Add New WIR</Button>
            </DialogTrigger>
          </Dialog>
        )}
      </div>
      
      {canEdit && (
        <WIRDialog
          isOpen={isAddDialogOpen}
          setIsOpen={setIsAddDialogOpen}
          newWIR={newWIR}
          setNewWIR={setNewWIR}
          editingWIR={editingWIR}
          flattenedBOQItems={flattenedBOQItems}
          onCancel={handleCancelForm}
          onSubmit={handleAddWIR}
        />
      )}
      
      <WIRTable
        wirs={wirs}
        flattenedBOQItems={flattenedBOQItems}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEditWIR}
        onDelete={handleDeleteWIR}
      />
    </div>
  );
};

export default WIRs;
