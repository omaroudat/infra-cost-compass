
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import WIRBasicInfoForm from './WIRBasicInfoForm';
import WIRLocationForm from './WIRLocationForm';
import WIRResultForm from './WIRResultForm';
import WIRFormActions from './WIRFormActions';
import WIRBreakdownSelection from './WIRBreakdownSelection';
import { Package, MapPin, Settings, CheckCircle } from 'lucide-react';

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
      'contractor', 'engineer', 'region', 'value'
    ];
    
    const missing = required.filter(field => !newWIR[field as keyof typeof newWIR]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields.');
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
