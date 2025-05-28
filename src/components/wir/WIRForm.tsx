
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

  // Check if BOQ item is selected to show breakdown selection
  const hasBOQItemSelected = newWIR.linkedBOQItems && newWIR.linkedBOQItems.length > 0;

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto p-1">
      {/* BOQ Item Selection */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-blue-700 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            BOQ Item Selection
          </CardTitle>
          <CardDescription>Select the Bill of Quantities item for this work inspection</CardDescription>
        </CardHeader>
        <CardContent>
          <WIRBasicInfoForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            flattenedBOQItems={flattenedBOQItems}
            isResultSubmission={isResultSubmission}
            showOnlyBOQ={true}
          />
        </CardContent>
      </Card>

      {/* Breakdown Selection */}
      {hasBOQItemSelected && (
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-green-700 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Breakdown Sub-Items Selection
            </CardTitle>
            <CardDescription>Choose specific breakdown components if applicable</CardDescription>
          </CardHeader>
          <CardContent>
            <WIRBreakdownSelection
              newWIR={newWIR}
              setNewWIR={setNewWIR}
              isResultSubmission={isResultSubmission}
            />
          </CardContent>
        </Card>
      )}

      {/* Work Details */}
      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-purple-700 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Work Details
          </CardTitle>
          <CardDescription>Provide comprehensive information about the work inspection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
      
      {/* Inspection Results */}
      <Card className="border-orange-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-orange-700 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            Inspection Results
          </CardTitle>
          <CardDescription>Record the inspection outcome and findings</CardDescription>
        </CardHeader>
        <CardContent>
          <WIRResultForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            isResultSubmission={isResultSubmission}
          />
        </CardContent>
      </Card>
      
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
