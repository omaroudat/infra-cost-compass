
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WIRBasicInfoForm from './WIRBasicInfoForm';
import WIRLocationForm from './WIRLocationForm';
import WIRResultForm from './WIRResultForm';
import WIRFormActions from './WIRFormActions';
import WIRBreakdownSelection from './WIRBreakdownSelection';
import { Package, MapPin, Settings, CheckCircle, Hash } from 'lucide-react';

interface WIRFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  editingWIR: string | null;
  flattenedBOQItems: BOQItem[];
  onCancel: () => void;
  onSubmit: () => void;
}

const WIRForm: React.FC<WIRFormProps> = ({
  newWIR,
  setNewWIR,
  editingWIR,
  flattenedBOQItems,
  onCancel,
  onSubmit,
}) => {
  const handleSubmit = () => {
    const required = [
      'description', 'submittalDate', 'status', 
      'contractor', 'engineer', 'region', 'value',
      'lineNo', 'lengthOfLine', 'diameterOfLine'
    ];
    
    const missing = required.filter(field => {
      const value = newWIR[field as keyof typeof newWIR];
      return !value || (typeof value === 'number' && value <= 0);
    });
    
    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    // Check if at least one BOQ item is selected
    if (!newWIR.linkedBOQItems || newWIR.linkedBOQItems.length === 0) {
      toast.error('Please select a BOQ item.');
      return;
    }

    // Validate value is greater than 0
    if (!newWIR.value || newWIR.value <= 0) {
      toast.error('Value must be greater than 0.');
      return;
    }

    // Validate length and diameter are greater than 0
    if (!newWIR.lengthOfLine || newWIR.lengthOfLine <= 0) {
      toast.error('Length of line must be greater than 0.');
      return;
    }

    if (!newWIR.diameterOfLine || newWIR.diameterOfLine <= 0) {
      toast.error('Diameter of line must be greater than 0.');
      return;
    }
    
    onSubmit();
  };

  // Check if this is a result submission (editing an existing submitted WIR)
  const isResultSubmission = editingWIR && newWIR.status === 'submitted';
  
  // Check if this is creation mode (no editing WIR)
  const isCreationMode = !editingWIR;

  // Check if BOQ item is selected to show breakdown selection
  const hasBOQItemSelected = newWIR.linkedBOQItems && newWIR.linkedBOQItems.length > 0;

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* WIR Number Configuration - Only show for creation mode */}
      {isCreationMode && (
        <Card className="border-2 border-indigo-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              WIR Number Configuration
            </CardTitle>
            <CardDescription className="text-sm text-indigo-600">
              Optionally specify a custom WIR number, or leave blank for auto-generation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Label htmlFor="wirNumber">Custom WIR Number (Optional)</Label>
              <Input
                id="wirNumber"
                type="text"
                placeholder="e.g., WIR-2024-001"
                value={newWIR.wirNumber || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, wirNumber: e.target.value }))}
              />
              <p className="text-xs text-gray-500">
                Leave empty to auto-generate a unique WIR number
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOQ Item Selection */}
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Package className="w-5 h-5" />
            BOQ Item Selection
          </CardTitle>
          <CardDescription className="text-sm text-blue-600">
            Select the Bill of Quantities item for this work inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <WIRBasicInfoForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            flattenedBOQItems={flattenedBOQItems}
            isResultSubmission={isResultSubmission}
            showOnlyBOQ={true}
          />
        </CardContent>
      </Card>

      {/* Breakdown Selection - Only show if BOQ item is selected */}
      {hasBOQItemSelected && (
        <Card className="border-2 border-emerald-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-emerald-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Breakdown Sub-Items Selection
            </CardTitle>
            <CardDescription className="text-sm text-emerald-600">
              Choose specific breakdown components if applicable
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <WIRBreakdownSelection
              newWIR={newWIR}
              setNewWIR={setNewWIR}
              isResultSubmission={isResultSubmission}
            />
          </CardContent>
        </Card>
      )}

      {/* Work Details */}
      <Card className="border-2 border-purple-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Work Details
          </CardTitle>
          <CardDescription className="text-sm text-purple-600">
            Provide comprehensive information about the work inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <WIRBasicInfoForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            flattenedBOQItems={flattenedBOQItems}
            isResultSubmission={isResultSubmission}
            showOnlyBOQ={false}
          />
          
          <Separator className="my-4" />
          
          <WIRLocationForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            isResultSubmission={isResultSubmission}
          />
        </CardContent>
      </Card>
      
      {/* Inspection Results - Only show for result submission, NOT for creation */}
      {isResultSubmission && !isCreationMode && (
        <Card className="border-2 border-orange-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Inspection Results
            </CardTitle>
            <CardDescription className="text-sm text-orange-600">
              Record the inspection outcome and findings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <WIRResultForm
              newWIR={newWIR}
              setNewWIR={setNewWIR}
              isResultSubmission={isResultSubmission}
            />
          </CardContent>
        </Card>
      )}
      
      <WIRFormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isResultSubmission={isResultSubmission}
        editingWIR={editingWIR}
      />
    </div>
  );
};

export default WIRForm;
