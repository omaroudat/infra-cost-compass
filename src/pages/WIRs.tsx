import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/SupabaseAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WIRTable from '@/components/wir/WIRTable';
import WIRDialog from '@/components/wir/WIRDialog';
import AdvancedWIRFilters, { AdvancedWIRFilterValues } from '@/components/wir/AdvancedWIRFilters';
import ContractorTable from '@/components/staff/ContractorTable';
import ContractorForm from '@/components/staff/ContractorForm';
import EngineerTable from '@/components/staff/EngineerTable';
import EngineerForm from '@/components/staff/EngineerForm';
import DataExportImport from '@/components/DataExportImport';
import UserProfileCard from '@/components/UserProfileCard';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWIRManagement } from '@/hooks/useWIRManagement';
import { useStaffManagement } from '@/hooks/useStaffManagement';

const WIRs = () => {
  const { canEdit, canDelete } = useAuth();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<AdvancedWIRFilterValues>({});
  
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
    handleRevisionRequest,
    canRequestRevision
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

  // Filter WIRs based on applied filters
  const filteredWIRs = useMemo(() => {
    console.log('Applying filters:', filters);
    console.log('All WIRs:', wirs);
    
    return wirs.filter(wir => {
      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim() !== '') {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableText = [
          wir.description,
          wir.descriptionAr,
          wir.lineNo,
          wir.region,
          wir.contractor,
          wir.engineer
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.trim() !== '') {
        if (wir.status !== filters.status) {
          return false;
        }
      }

      // Result filter
      if (filters.result && filters.result.trim() !== '') {
        if (wir.result !== filters.result) {
          return false;
        }
      }

      // Engineer filter
      if (filters.engineer && filters.engineer.trim() !== '') {
        if (wir.engineer !== filters.engineer) {
          return false;
        }
      }

      // Contractor filter
      if (filters.contractor && filters.contractor.trim() !== '') {
        if (wir.contractor !== filters.contractor) {
          return false;
        }
      }

      // Region filter
      if (filters.region && filters.region.trim() !== '') {
        if (wir.region !== filters.region) {
          return false;
        }
      }

      // Line number filter
      if (filters.lineNo && filters.lineNo.trim() !== '') {
        if (!wir.lineNo.toLowerCase().includes(filters.lineNo.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (filters.fromDate || filters.toDate) {
        const wirDate = new Date(wir.submittalDate);
        
        if (filters.fromDate && filters.fromDate.trim() !== '') {
          const fromDate = new Date(filters.fromDate);
          if (wirDate < fromDate) {
            return false;
          }
        }
        
        if (filters.toDate && filters.toDate.trim() !== '') {
          const toDate = new Date(filters.toDate);
          if (wirDate > toDate) {
            return false;
          }
        }
      }

      // Value range filter
      if (filters.minValue !== undefined || filters.maxValue !== undefined) {
        if (filters.minValue !== undefined && wir.value < filters.minValue) {
          return false;
        }
        if (filters.maxValue !== undefined && wir.value > filters.maxValue) {
          return false;
        }
      }

      // BOQ Item Code filter
      if (filters.boqItemCode && filters.boqItemCode.trim() !== '') {
        const boqItem = flattenedBOQItems.find(item => item.id === wir.boqItemId);
        if (!boqItem || !boqItem.code.toLowerCase().includes(filters.boqItemCode.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [wirs, filters, flattenedBOQItems]);

  // Get unique values for filter options
  const uniqueContractors = useMemo(() => {
    const contractorSet = new Set(wirs.map(wir => wir.contractor).filter(Boolean));
    return Array.from(contractorSet).sort();
  }, [wirs]);

  const uniqueEngineers = useMemo(() => {
    const engineerSet = new Set(wirs.map(wir => wir.engineer).filter(Boolean));
    return Array.from(engineerSet).sort();
  }, [wirs]);

  const uniqueRegions = useMemo(() => {
    const regionSet = new Set(wirs.map(wir => wir.region).filter(Boolean));
    return Array.from(regionSet).sort();
  }, [wirs]);

  console.log('Filtered WIRs count:', filteredWIRs.length);
  console.log('Current filters:', filters);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">{t('wirs.title')}</h2>
        <UserProfileCard />
      </div>
      
      <Tabs defaultValue="wirs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wirs">{t('nav.wirs')}</TabsTrigger>
          <TabsTrigger value="contractors">{t('wirs.contractors')}</TabsTrigger>
          <TabsTrigger value="engineers">{t('wirs.engineers')}</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wirs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('wirs.management')}</h3>
            {canEdit() && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAddDialogOpen(true)}>{t('wirs.addNew')}</Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>

          <AdvancedWIRFilters
            onFiltersChange={setFilters}
            engineers={uniqueEngineers}
            contractors={uniqueContractors}
            regions={uniqueRegions}
          />
          
          {canEdit() && (
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
            wirs={filteredWIRs}
            flattenedBOQItems={flattenedBOQItems}
            canEdit={canEdit()}
            canDelete={canDelete()}
            onEdit={handleEditWIR}
            onDelete={handleDeleteWIR}
            onSubmitResult={canEdit() ? handleSubmitResult : undefined}
            onRevisionRequest={canEdit() ? handleRevisionRequest : undefined}
          />
        </TabsContent>
        
        <TabsContent value="contractors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('wirs.contractors')}</h3>
            {canEdit() && (
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
            canEdit={canEdit()}
            canDelete={canDelete()}
          />
        </TabsContent>
        
        <TabsContent value="engineers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t('wirs.engineers')}</h3>
            {canEdit() && (
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
            canEdit={canEdit()}
            canDelete={canDelete()}
          />
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Management</h3>
            <DataExportImport />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WIRs;
