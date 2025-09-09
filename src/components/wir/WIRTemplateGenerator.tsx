import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface WIRTemplateGeneratorProps {
  className?: string;
}

const WIRTemplateGenerator: React.FC<WIRTemplateGeneratorProps> = ({ className }) => {
  const { boqItems, breakdownItems } = useAppContext();

  const generateWIRTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Template sheet with sample data and instructions
      const templateData = [
        {
          wirNumber: 'WIR-001 (Optional - will be auto-generated)',
          description: 'Sample WIR Description',
          descriptionAr: 'وصف العمل بالعربية (اختياري)',
          submittalDate: '2024-01-15',
          receivedDate: '2024-01-16 (Optional)',
          status: 'submitted',
          result: 'A (A/B/C - Only for completed WIRs)',
          statusConditions: 'Any status conditions (Optional)',
          calculationEquation: 'Calculation equation (Optional)',
          contractor: 'Contractor Name',
          engineer: 'Engineer Name',
          lengthOfLine: 100,
          diameterOfLine: 300,
          lineNo: 'L001',
          region: 'Region 1',
          manholeFrom: 'MH001',
          manholeTo: 'MH002',
          zone: 'Zone A',
          road: 'Main Street',
          line: 'Line 1',
          value: 50000,
          boqItemCode: 'Use BOQ code from BOQ Reference sheet',
          boqItemDescription: 'Or use BOQ description for matching',
          selectedBreakdownKeywords: 'Keyword1, Keyword2 (from Breakdown Reference)',
          attachmentNames: 'file1.pdf, file2.jpg (Optional)',
          parentWIRId: 'Parent WIR ID for revisions (Optional)',
          revisionNumber: 0,
          originalWIRId: 'Original WIR ID for revisions (Optional)'
        }
      ];

      const templateSheet = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, templateSheet, 'WIR Template');

      // Instructions sheet
      const instructions = [
        { Field: 'wirNumber', Description: 'Optional. Will be auto-generated if not provided', Required: 'No' },
        { Field: 'description', Description: 'WIR description in English', Required: 'Yes' },
        { Field: 'descriptionAr', Description: 'WIR description in Arabic (optional)', Required: 'No' },
        { Field: 'submittalDate', Description: 'Date in YYYY-MM-DD format', Required: 'Yes' },
        { Field: 'receivedDate', Description: 'Date in YYYY-MM-DD format (optional)', Required: 'No' },
        { Field: 'status', Description: 'submitted or completed', Required: 'Yes' },
        { Field: 'result', Description: 'A, B, or C (only for completed WIRs)', Required: 'No' },
        { Field: 'contractor', Description: 'Contractor name', Required: 'Yes' },
        { Field: 'engineer', Description: 'Engineer name', Required: 'Yes' },
        { Field: 'lengthOfLine', Description: 'Length in meters (number)', Required: 'Yes' },
        { Field: 'diameterOfLine', Description: 'Diameter in millimeters (number)', Required: 'Yes' },
        { Field: 'lineNo', Description: 'Line number/identifier', Required: 'Yes' },
        { Field: 'region', Description: 'Region name', Required: 'Yes' },
        { Field: 'value', Description: 'WIR value (number)', Required: 'Yes' },
        { Field: 'boqItemCode', Description: 'BOQ item code (see BOQ Reference sheet)', Required: 'Yes' },
        { Field: 'boqItemDescription', Description: 'Alternative to boqItemCode for matching', Required: 'No' },
        { Field: 'selectedBreakdownKeywords', Description: 'Comma-separated breakdown keywords (see Breakdown Reference)', Required: 'No' },
        { Field: 'attachmentNames', Description: 'Comma-separated attachment file names', Required: 'No' }
      ];

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

      // BOQ reference sheet
      const boqReference = boqItems.map(item => ({
        code: item.code,
        description: item.description,
        descriptionAr: item.descriptionAr || '',
        unit: item.unit,
        unitRate: item.unitRate,
        quantity: item.quantity
      }));

      const boqSheet = XLSX.utils.json_to_sheet(boqReference);
      XLSX.utils.book_append_sheet(wb, boqSheet, 'BOQ Reference');

      // Breakdown reference sheet
      const breakdownReference = breakdownItems.map(item => {
        const boqItem = boqItems.find(boq => boq.id === item.boqItemId);
        return {
          keyword: item.keyword || '',
          keywordAr: item.keywordAr || '',
          description: item.description || '',
          descriptionAr: item.descriptionAr || '',
          percentage: item.percentage || 0,
          boqItemCode: boqItem?.code || '',
          boqItemDescription: boqItem?.description || ''
        };
      });

      const breakdownSheet = XLSX.utils.json_to_sheet(breakdownReference);
      XLSX.utils.book_append_sheet(wb, breakdownSheet, 'Breakdown Reference');

      const fileName = `WIR_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('WIR import template generated successfully!');
    } catch (error) {
      console.error('Template generation error:', error);
      toast.error('Failed to generate WIR template');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          WIR Import Template
        </CardTitle>
        <CardDescription>
          Generate an Excel template with instructions and reference data for importing WIRs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={generateWIRTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download WIR Import Template
        </Button>
        <div className="mt-4 text-sm text-gray-600">
          <p>The template includes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Sample WIR data with field descriptions</li>
            <li>Instructions sheet with field requirements</li>
            <li>BOQ reference data for item mapping</li>
            <li>Breakdown reference data for breakdown selection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WIRTemplateGenerator;