
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import WIRTable from '@/components/wir/WIRTable';
import WIRDialog from '@/components/wir/WIRDialog';
import WIRImportExport from '@/components/wir/WIRImportExport';
import { useWIRManagement } from '@/hooks/useWIRManagement';
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

const WIRs = () => {
  const { hasPermission } = useAuth();
  const { addWIR } = useAppContext();
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
  
  const handleImportWIRs = (importedWirs: Partial<WIR>[]) => {
    // Loop through imported WIRs and add them one by one
    importedWirs.forEach(wir => {
      if (wir.boqItemId && wir.description) {
        addWIR(wir as Omit<WIR, 'id' | 'calculatedAmount' | 'adjustmentApplied'>);
      } else {
        toast.error(`Skipped importing WIR with missing required fields: ${wir.description || 'Unknown'}`);
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Work Inspection Requests (WIRs)</h2>
        <div className="flex space-x-2">
          <WIRImportExport onImport={handleImportWIRs} />
          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>Add New WIR</Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
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
