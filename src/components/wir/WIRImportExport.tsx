
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WIR, WIRStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { FileSpreadsheet, Import } from 'lucide-react';
import * as XLSX from 'xlsx';

interface WIRImportExportProps {
  onImport: (wirs: Partial<WIR>[]) => void;
}

const WIRImportExport = ({ onImport }: WIRImportExportProps) => {
  const { wirs, boqItems } = useAppContext();
  const flattenedBOQItems = boqItems.flatMap(item => [item, ...(item.children || [])]);
  
  const handleExport = () => {
    // Format WIRs for export
    const data = wirs.map(wir => {
      const boqItem = flattenedBOQItems.find(item => item.id === wir.boqItemId);
      return {
        'ID': wir.id,
        'Description': wir.description,
        'BOQ Item': boqItem?.description || '',
        'BOQ Item ID': wir.boqItemId,
        'Submittal Date': wir.submittalDate,
        'Received Date': wir.receivedDate || '',
        'Status': wir.status === 'A' ? 'Approved' : wir.status === 'B' ? 'Conditional' : 'Rejected',
        'Conditions': wir.statusConditions || '',
        'Contractor': wir.contractor || '',
        'Engineer': wir.engineer || '',
        'Calculated Amount': wir.calculatedAmount || 0
      };
    });

    // Create workbook and add worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WIRs');

    // Set column widths
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 30 }, // Description
      { wch: 30 }, // BOQ Item
      { wch: 10 }, // BOQ Item ID
      { wch: 15 }, // Submittal Date
      { wch: 15 }, // Received Date
      { wch: 15 }, // Status
      { wch: 30 }, // Conditions
      { wch: 20 }, // Contractor
      { wch: 20 }, // Engineer
      { wch: 15 }, // Calculated Amount
    ];
    worksheet['!cols'] = colWidths;

    // Generate the file and trigger download
    XLSX.writeFile(workbook, 'WIRs_Export.xlsx');
    toast.success('WIRs exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map the Excel data to WIR objects
        const importedWirs = jsonData.map((row: any) => {
          let status: WIRStatus = 'A';
          if (row['Status'] === 'Conditional') status = 'B';
          if (row['Status'] === 'Rejected') status = 'C';
          
          return {
            boqItemId: row['BOQ Item ID'] || '',
            description: row['Description'] || '',
            submittalDate: row['Submittal Date'] || new Date().toISOString().split('T')[0],
            receivedDate: row['Received Date'] || null,
            status,
            statusConditions: row['Conditions'] || '',
            contractor: row['Contractor'] || '',
            engineer: row['Engineer'] || ''
          };
        });
        
        onImport(importedWirs);
        toast.success(`Successfully imported ${importedWirs.length} WIRs.`);
        
        // Reset the file input
        event.target.value = '';
      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Failed to import file. Please check the format and try again.');
        // Reset the file input
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        <span>Export to Excel</span>
      </Button>
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
        />
        <Button variant="outline" className="flex items-center gap-2">
          <Import className="h-4 w-4" />
          <span>Import from Excel</span>
        </Button>
      </div>
    </div>
  );
};

export default WIRImportExport;
