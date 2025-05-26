
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractorTable from '@/components/staff/ContractorTable';
import ContractorForm from '@/components/staff/ContractorForm';
import EngineerTable from '@/components/staff/EngineerTable';
import EngineerForm from '@/components/staff/EngineerForm';
import { useStaffManagement } from '@/hooks/useStaffManagement';

const StaffManagement = () => {
  const { hasPermission } = useAuth();
  const {
    contractors,
    engineers,
    isContractorDialogOpen,
    setIsContractorDialogOpen,
    isEngineerDialogOpen,
    setIsEngineerDialogOpen,
    editingContractor,
    editingEngineer,
    newContractor,
    setNewContractor,
    newEngineer,
    setNewEngineer,
    handleAddContractor,
    handleEditContractor,
    handleDeleteContractor,
    handleCancelContractor,
    handleAddEngineer,
    handleEditEngineer,
    handleDeleteEngineer,
    handleCancelEngineer
  } = useStaffManagement();
  
  const canEdit = hasPermission(['admin', 'dataEntry']);
  const canDelete = hasPermission(['admin']);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Staff Management</h2>
      </div>
      
      <Tabs defaultValue="contractors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="engineers">Engineers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contractors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Contractors</h3>
            {canEdit && (
              <Dialog open={isContractorDialogOpen} onOpenChange={setIsContractorDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsContractorDialogOpen(true)}>
                    Add New Contractor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContractor ? 'Edit' : 'Add'} Contractor
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the contractor details below.
                    </DialogDescription>
                  </DialogHeader>
                  <ContractorForm
                    newContractor={newContractor}
                    setNewContractor={setNewContractor}
                    editingContractor={editingContractor}
                    onCancel={handleCancelContractor}
                    onSubmit={handleAddContractor}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <ContractorTable
            contractors={contractors}
            onEdit={handleEditContractor}
            onDelete={handleDeleteContractor}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </TabsContent>
        
        <TabsContent value="engineers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Engineers</h3>
            {canEdit && (
              <Dialog open={isEngineerDialogOpen} onOpenChange={setIsEngineerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsEngineerDialogOpen(true)}>
                    Add New Engineer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEngineer ? 'Edit' : 'Add'} Engineer
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the engineer details below.
                    </DialogDescription>
                  </DialogHeader>
                  <EngineerForm
                    newEngineer={newEngineer}
                    setNewEngineer={setNewEngineer}
                    editingEngineer={editingEngineer}
                    onCancel={handleCancelEngineer}
                    onSubmit={handleAddEngineer}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <EngineerTable
            engineers={engineers}
            onEdit={handleEditEngineer}
            onDelete={handleDeleteEngineer}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
