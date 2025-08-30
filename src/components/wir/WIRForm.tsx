
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WIRBasicInfoForm from './WIRBasicInfoForm';
import WIRLocationForm from './WIRLocationForm';
import WIRLocationDetailsForm from './WIRLocationDetailsForm';
import WIRResultForm from './WIRResultForm';
import WIRFormActions from './WIRFormActions';
import WIRBreakdownSelection from './WIRBreakdownSelection';
import WIRAttachmentSelector from './WIRAttachmentSelector';
import { Package, MapPin, Settings, CheckCircle, Hash, Eye, Paperclip } from 'lucide-react';

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
      'lineNo', 'lengthOfLine', 'diameterOfLine',
      'manholeFrom', 'manholeTo', 'zone', 'road', 'line'
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
  
  // Check if this is a completed WIR (readonly mode)
  const isCompletedWIR = editingWIR && newWIR.status === 'completed';

  // Check if BOQ item is selected to show breakdown selection
  const hasBOQItemSelected = newWIR.linkedBOQItems && newWIR.linkedBOQItems.length > 0;

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* WIR Number Display - Show for all modes */}
      <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-indigo-200'}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-indigo-800'}`}>
            {isCompletedWIR ? <Eye className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
            WIR Number {isCompletedWIR ? '(View Only)' : isCreationMode ? 'Configuration' : 'Information'}
          </CardTitle>
          <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-indigo-600'}`}>
            {isCompletedWIR 
              ? 'This WIR has been completed and is in read-only mode'
              : isCreationMode 
                ? 'Auto-generated WIR number (modifiable before submission)'
                : 'WIR number for this inspection request'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label htmlFor="wirNumber">WIR Number</Label>
            <Input
              id="wirNumber"
              type="text"
              placeholder="WIR-09-06-2025-0001"
              value={newWIR.wirNumber || ''}
              onChange={(e) => setNewWIR(prev => ({ ...prev, wirNumber: e.target.value }))}
              disabled={!isCreationMode || isCompletedWIR}
              className={isCompletedWIR ? 'bg-blue-50 border-blue-200' : ''}
            />
            <p className="text-xs text-gray-500">
              {isCompletedWIR 
                ? 'Completed WIR number (cannot be modified)'
                : 'Format: WIR-DD-MM-YYYY-XXXX. Auto-generated but can be customized.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* BOQ Item Selection */}
      <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-blue-200'}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-blue-800'}`}>
            <Package className="w-5 h-5" />
            BOQ Item Selection
          </CardTitle>
          <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-blue-600'}`}>
            {isCompletedWIR ? 'Selected BOQ item for this completed inspection' : 'Select the Bill of Quantities item for this work inspection'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <WIRBasicInfoForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            flattenedBOQItems={flattenedBOQItems}
            isResultSubmission={isResultSubmission || isCompletedWIR}
            showOnlyBOQ={true}
          />
        </CardContent>
      </Card>

      {/* Breakdown Selection - Only show if BOQ item is selected */}
      {hasBOQItemSelected && (
        <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-emerald-200'}`}>
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-emerald-800'}`}>
              <Settings className="w-5 h-5" />
              Breakdown Sub-Items {isCompletedWIR ? 'Selection' : 'Selection'}
            </CardTitle>
            <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-emerald-600'}`}>
              {isCompletedWIR ? 'Breakdown components selected for this completed WIR' : 'Choose specific breakdown components if applicable'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <WIRBreakdownSelection
              newWIR={newWIR}
              setNewWIR={setNewWIR}
              isResultSubmission={isResultSubmission}
              isViewOnly={isCompletedWIR}
            />
          </CardContent>
        </Card>
      )}

      {/* Work Details */}
      <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-purple-200'}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-purple-800'}`}>
            <MapPin className="w-5 h-5" />
            Work Details
          </CardTitle>
          <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-purple-600'}`}>
            {isCompletedWIR ? 'Work inspection details (completed)' : 'Provide comprehensive information about the work inspection'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <WIRBasicInfoForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            flattenedBOQItems={flattenedBOQItems}
            isResultSubmission={isResultSubmission || isCompletedWIR}
            showOnlyBOQ={false}
          />
          
          <Separator className="my-4" />
          
          <WIRLocationDetailsForm
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            isResultSubmission={isResultSubmission || isCompletedWIR}
          />
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-teal-200'}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-teal-800'}`}>
            <Paperclip className="w-5 h-5" />
            Attachments
          </CardTitle>
          <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-teal-600'}`}>
            {isCompletedWIR ? 'Attachments linked to this completed WIR' : 'Link relevant attachments (PDFs, documents) to this WIR'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <WIRAttachmentSelector
            newWIR={newWIR}
            setNewWIR={setNewWIR}
            isViewOnly={isCompletedWIR}
          />
        </CardContent>
      </Card>
      
      {/* Inspection Results - Show for result submission OR completed WIRs */}
      {(isResultSubmission || isCompletedWIR) && !isCreationMode && (
        <Card className={`border-2 shadow-sm ${isCompletedWIR ? 'border-blue-200 bg-blue-50' : 'border-orange-200'}`}>
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isCompletedWIR ? 'text-blue-800' : 'text-orange-800'}`}>
              <CheckCircle className="w-5 h-5" />
              Inspection Results
            </CardTitle>
            <CardDescription className={`text-sm ${isCompletedWIR ? 'text-blue-600' : 'text-orange-600'}`}>
              {isCompletedWIR ? 'Final inspection results' : 'Record the inspection outcome and findings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <WIRResultForm
              newWIR={newWIR}
              setNewWIR={setNewWIR}
              isResultSubmission={isResultSubmission && !isCompletedWIR}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Only show form actions if not completed */}
      {!isCompletedWIR && (
        <WIRFormActions
          onCancel={onCancel}
          onSubmit={handleSubmit}
          isResultSubmission={isResultSubmission}
          editingWIR={editingWIR}
        />
      )}
      
      {/* Show close button for completed WIRs */}
      {isCompletedWIR && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default WIRForm;
