
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/SupabaseAuthContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface DataExportImportProps {
  className?: string;
}

const DataExportImport: React.FC<DataExportImportProps> = ({ className }) => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { boqItems, breakdownItems, wirs, contractors, engineers, addBOQItem, addBreakdownItem, addWIR, addContractor, addEngineer } = useAppContext();
  const { canEdit } = useAuth();

  const tableOptions = [
    { value: 'boq_items', label: 'BOQ Items', data: boqItems },
    { value: 'breakdown_items', label: 'Breakdown Items', data: breakdownItems },
    { value: 'wirs', label: 'WIRs', data: wirs },
    { value: 'contractors', label: 'Contractors', data: contractors },
    { value: 'engineers', label: 'Engineers', data: engineers }
  ];

  const exportData = async () => {
    if (!selectedTable) {
      toast.error('Please select a table to export');
      return;
    }

    setExporting(true);
    try {
      const tableOption = tableOptions.find(opt => opt.value === selectedTable);
      if (!tableOption) {
        throw new Error('Invalid table selection');
      }

      const ws = XLSX.utils.json_to_sheet(tableOption.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, tableOption.label);

      const fileName = `${selectedTable}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`${tableOption.label} exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTable) {
      toast.error('Please select a table to import to');
      return;
    }

    if (!canEdit()) {
      toast.error('You do not have permission to import data');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          switch (selectedTable) {
            case 'boq_items':
              await addBOQItem({
                code: row.code || '',
                description: row.description || '',
                descriptionAr: row.descriptionAr || '',
                quantity: parseFloat(row.quantity) || 0,
                unit: row.unit || '',
                unitAr: row.unitAr || '',
                unitRate: parseFloat(row.unitRate) || 0,
                totalAmount: parseFloat(row.totalAmount) || 0,
                level: parseInt(row.level) || 0,
                children: []
              });
              break;
            case 'breakdown_items':
              await addBreakdownItem({
                keyword: row.keyword || '',
                keywordAr: row.keywordAr || '',
                description: row.description || '',
                descriptionAr: row.descriptionAr || '',
                percentage: parseFloat(row.percentage) || 0,
                value: parseFloat(row.value) || 0,
                boqItemId: row.boqItemId || '',
                parentBreakdownId: row.parentBreakdownId,
                unitRate: parseFloat(row.unitRate) || 0,
                quantity: parseFloat(row.quantity) || 0,
                isLeaf: Boolean(row.isLeaf)
              });
              break;
            case 'contractors':
              await addContractor({
                name: row.name || '',
                company: row.company || '',
                email: row.email || '',
                phone: row.phone || ''
              });
              break;
            case 'engineers':
              await addEngineer({
                name: row.name || '',
                department: row.department || '',
                email: row.email || '',
                phone: row.phone || '',
                specialization: row.specialization || ''
              });
              break;
            // WIRs import would be more complex due to required fields
          }
          successCount++;
        } catch (error) {
          console.error('Import row error:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} records`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} records`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Export/Import
        </CardTitle>
        <CardDescription>
          Export data to Excel or import data from Excel files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="table-select">Select Table</Label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a table" />
            </SelectTrigger>
            <SelectContent>
              {tableOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.data.length} records)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={exportData} 
            disabled={!selectedTable || exporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>

          {canEdit() && (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileImport}
                disabled={!selectedTable || importing}
                className="hidden"
                id="file-import"
              />
              <Button 
                onClick={() => document.getElementById('file-import')?.click()}
                disabled={!selectedTable || importing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import from Excel'}
              </Button>
            </div>
          )}
        </div>

        {!canEdit() && (
          <p className="text-sm text-gray-500">
            Import functionality requires editor or admin permissions.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataExportImport;
