
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/ManualAuthContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { WIRStatus, WIRResult } from '@/types';

interface DataExportImportProps {
  className?: string;
}

// Type definitions for Excel row data
interface ExcelBOQRow {
  code?: string;
  description?: string;
  descriptionAr?: string;
  quantity?: number;
  unit?: string;
  unitAr?: string;
  unitRate?: number;
  totalAmount?: number;
  level?: number;
}

interface ExcelBreakdownRow {
  keyword?: string;
  keywordAr?: string;
  description?: string;
  descriptionAr?: string;
  percentage?: number;
  value?: number;
  boqItemId?: string;
  parentBreakdownId?: string;
  unitRate?: number;
  quantity?: number;
  isLeaf?: boolean;
}

interface ExcelContractorRow {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface ExcelEngineerRow {
  name?: string;
  department?: string;
  email?: string;
  phone?: string;
  specialization?: string;
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
              const boqRow = row as ExcelBOQRow;
              await addBOQItem({
                code: boqRow.code || '',
                description: boqRow.description || '',
                descriptionAr: boqRow.descriptionAr || '',
                quantity: Number(boqRow.quantity) || 0,
                unit: boqRow.unit || '',
                unitAr: boqRow.unitAr || '',
                unitRate: Number(boqRow.unitRate) || 0,
                totalAmount: Number(boqRow.totalAmount) || 0,
                level: Number(boqRow.level) || 0,
                children: []
              });
              break;
            case 'breakdown_items':
              const breakdownRow = row as ExcelBreakdownRow;
              await addBreakdownItem({
                keyword: breakdownRow.keyword || '',
                keywordAr: breakdownRow.keywordAr || '',
                description: breakdownRow.description || '',
                descriptionAr: breakdownRow.descriptionAr || '',
                percentage: Number(breakdownRow.percentage) || 0,
                value: Number(breakdownRow.value) || 0,
                boqItemId: breakdownRow.boqItemId || '',
                parentBreakdownId: breakdownRow.parentBreakdownId,
                unitRate: Number(breakdownRow.unitRate) || 0,
                quantity: Number(breakdownRow.quantity) || 0,
                isLeaf: Boolean(breakdownRow.isLeaf)
              });
              break;
            case 'contractors':
              const contractorRow = row as ExcelContractorRow;
              await addContractor({
                name: contractorRow.name || '',
                company: contractorRow.company || '',
                email: contractorRow.email || '',
                phone: contractorRow.phone || ''
              });
              break;
            case 'engineers':
              const engineerRow = row as ExcelEngineerRow;
              await addEngineer({
                name: engineerRow.name || '',
                department: engineerRow.department || '',
                email: engineerRow.email || '',
                phone: engineerRow.phone || '',
                specialization: engineerRow.specialization || ''
              });
              break;
            case 'wirs':
              const wirRow = row as any;
              // Skip rows with missing required fields
              if (!wirRow.description || !wirRow.submittalDate || !wirRow.contractor || !wirRow.engineer) {
                console.warn('Skipping WIR row due to missing required fields:', wirRow);
                errorCount++;
                continue;
              }
              
              // Handle Excel date conversion
              const convertExcelDate = (excelDate: any): string => {
                if (!excelDate) return new Date().toISOString().split('T')[0];
                
                // If it's already a string in YYYY-MM-DD format, return as is
                if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
                  return excelDate;
                }
                
                // If it's an Excel serial number (number greater than 1000)
                if (typeof excelDate === 'number' && excelDate > 1000) {
                  // Excel's epoch is January 1, 1900 (but Excel incorrectly treats 1900 as a leap year)
                  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
                  const date = new Date(excelEpoch.getTime() + (excelDate * 24 * 60 * 60 * 1000));
                  return date.toISOString().split('T')[0];
                }
                
                // Try to parse as date
                const parsedDate = new Date(excelDate);
                if (!isNaN(parsedDate.getTime())) {
                  return parsedDate.toISOString().split('T')[0];
                }
                
                // Fallback to current date
                return new Date().toISOString().split('T')[0];
              };
              
              // Find BOQ item by name/description if BOQ item ID is not provided
              let boqItemId = wirRow.boqItemId || '';
              if (!boqItemId && (wirRow.boqItemName || wirRow.boqItemDescription)) {
                const searchTerm = wirRow.boqItemName || wirRow.boqItemDescription;
                const matchingBOQItem = boqItems.find(item => 
                  item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.descriptionAr?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (matchingBOQItem) {
                  boqItemId = matchingBOQItem.id;
                  console.log(`Found BOQ item for "${searchTerm}": ${matchingBOQItem.code} - ${matchingBOQItem.description}`);
                } else {
                  console.warn(`No BOQ item found for "${searchTerm}"`);
                  // Use the first BOQ item as fallback if available
                  if (boqItems.length > 0) {
                    boqItemId = boqItems[0].id;
                  }
                }
              }
              
              if (!boqItemId) {
                console.warn('Skipping WIR row due to missing BOQ item reference:', wirRow);
                errorCount++;
                continue;
              }
              
              await addWIR({
                id: '', // Will be generated by Supabase
                wirNumber: wirRow.wirNumber || '',
                description: wirRow.description || '',
                descriptionAr: wirRow.descriptionAr || '',
                submittalDate: convertExcelDate(wirRow.submittalDate),
                receivedDate: wirRow.receivedDate ? convertExcelDate(wirRow.receivedDate) : null,
                status: (wirRow.status as WIRStatus) || 'submitted',
                result: wirRow.result as WIRResult,
                statusConditions: wirRow.statusConditions || '',
                calculationEquation: wirRow.calculationEquation || '',
                contractor: wirRow.contractor || '',
                engineer: wirRow.engineer || '',
                lengthOfLine: Number(wirRow.lengthOfLine) || 0,
                diameterOfLine: Number(wirRow.diameterOfLine) || 0,
                lineNo: wirRow.lineNo || '',
                region: wirRow.region || '',
                value: Number(wirRow.value) || 0,
                boqItemId: boqItemId,
                manholeFrom: wirRow.manholeFrom || '',
                manholeTo: wirRow.manholeTo || '',
                zone: wirRow.zone || '',
                road: wirRow.road || '',
                line: wirRow.line || '',
                parentWIRId: wirRow.parentWIRId || undefined,
                revisionNumber: Number(wirRow.revisionNumber) || 0,
                originalWIRId: wirRow.originalWIRId || undefined,
                linkedBOQItems: Array.isArray(wirRow.linkedBOQItems) ? wirRow.linkedBOQItems : 
                               (typeof wirRow.linkedBOQItems === 'string' && wirRow.linkedBOQItems ? JSON.parse(wirRow.linkedBOQItems) : []),
                selectedBreakdownItems: Array.isArray(wirRow.selectedBreakdownItems) ? wirRow.selectedBreakdownItems :
                                      (typeof wirRow.selectedBreakdownItems === 'string' && wirRow.selectedBreakdownItems ? JSON.parse(wirRow.selectedBreakdownItems) : []),
                attachments: Array.isArray(wirRow.attachments) ? wirRow.attachments :
                           (typeof wirRow.attachments === 'string' && wirRow.attachments ? JSON.parse(wirRow.attachments) : [])
              });
              break;
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
