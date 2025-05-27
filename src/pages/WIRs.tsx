
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WIRTable from '@/components/wir/WIRTable';
import WIRDialog from '@/components/wir/WIRDialog';
import ContractorTable from '@/components/staff/ContractorTable';
import ContractorForm from '@/components/staff/ContractorForm';
import EngineerTable from '@/components/staff/EngineerTable';
import EngineerForm from '@/components/staff/EngineerForm';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWIRManagement } from '@/hooks/useWIRManagement';
import { useStaffManagement } from '@/hooks/useStaffManagement';

const WIRs = () => {
  const { hasPermission } = useAuth();
  const { t } = useLanguage();
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
    handleCancelForm,
    handleSubmitResult,
    handleRevisionRequest
  } = useWIRManagement();
  
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
        <h2 className="text-xl font-bold">{t('wirs.title')}</h2>
      </div>
      
      <Tabs defaultValue="wirs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wirs">{t('nav.wirs')}</TabsTrigger>
          <TabsTrigger value="contractors">{t('wirs.contractors')}</TabsTrigger>
          <TabsTrigger value="engineers">{t('wirs.engineers')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wirs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('wirs.management')}</h3>
            {canEdit && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAddDialogOpen(true)}>{t('wirs.addNew')}</Button>
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
            onSubmitResult={canEdit ? handleSubmitResult : undefined}
            onRevisionRequest={canEdit ? handleRevisionRequest : undefined}
          />
        </TabsContent>
        
        <TabsContent value="contractors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('wirs.contractors')}</h3>
            {canEdit && (
              <Dialog open={isContractorDialogOpen} onOpenChange={setIsContractorDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsContractorDialogOpen(true)}>
                    {t('wirs.addContractor')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContractor ? t('wirs.edit') : t('wirs.add')} {t('wirs.contractors')}
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
            <h3 className="text-lg font-semibold">{t('wirs.engineers')}</h3>
            {canEdit && (
              <Dialog open={isEngineerDialogOpen} onOpenChange={setIsEngineerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsEngineerDialogOpen(true)}>
                    {t('wirs.addEngineer')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEngineer ? t('wirs.edit') : t('wirs.add')} {t('wirs.engineers')}
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

export default WIRs;
