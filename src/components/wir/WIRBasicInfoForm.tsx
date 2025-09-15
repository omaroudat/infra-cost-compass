
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BOQItemSelector from './BOQItemSelector';
import { useAppContext } from '@/context/AppContext';

interface WIRBasicInfoFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  flattenedBOQItems: BOQItem[];
  isResultSubmission?: boolean;
  showOnlyBOQ?: boolean;
}

const WIRBasicInfoForm: React.FC<WIRBasicInfoFormProps> = ({
  newWIR,
  setNewWIR,
  flattenedBOQItems,
  isResultSubmission = false,
  showOnlyBOQ = false,
}) => {
  const { contractors, engineers } = useAppContext();

  const handleLinkedBOQItemsChange = (selectedItems: string[]) => {
    if (selectedItems.length > 0) {
      setNewWIR(prev => ({
        ...prev,
        linkedBOQItems: selectedItems,
        boqItemId: selectedItems[0]
      }));
    }
  };

  if (showOnlyBOQ) {
    return (
      <BOQItemSelector
        flattenedBOQItems={flattenedBOQItems}
        selectedItems={newWIR.linkedBOQItems || []}
        onSelectionChange={handleLinkedBOQItemsChange}
        isResultSubmission={isResultSubmission}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="description">Work Description *</Label>
        <Textarea
          id="description"
          value={newWIR.description || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the work to be inspected..."
          disabled={isResultSubmission}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="submittalDate">Submittal Date *</Label>
        <Input
          id="submittalDate"
          type="date"
          value={newWIR.submittalDate || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, submittalDate: e.target.value }))}
          disabled={isResultSubmission}
        />
      </div>

      <div>
        <Label htmlFor="startTaskOnSite">Start Task on Site</Label>
        <Input
          id="startTaskOnSite"
          type="date"
          value={newWIR.startTaskOnSite || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, startTaskOnSite: e.target.value }))}
          disabled={isResultSubmission}
        />
      </div>

      <div>
        <Label htmlFor="value">Quantity *</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          min="0"
          value={newWIR.value || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
          placeholder="Enter quantity"
          readOnly={isResultSubmission}
          className={isResultSubmission ? 'bg-gray-50 cursor-not-allowed' : ''}
        />
      </div>

      <div>
        <Label htmlFor="typeOfRock">Type of Rock *</Label>
        <Select
          value={newWIR.typeOfRock || ''}
          onValueChange={(value: 'Rock' | 'Soil') => setNewWIR(prev => ({ ...prev, typeOfRock: value }))}
          disabled={isResultSubmission}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type of rock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rock">Rock</SelectItem>
            <SelectItem value="Soil">Soil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contractor">Contractor *</Label>
        <Input
          id="contractor"
          value={newWIR.contractor || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, contractor: e.target.value }))}
          placeholder="Enter contractor name"
          disabled={isResultSubmission}
          list="contractors-list"
        />
        <datalist id="contractors-list">
          {contractors.map(contractor => (
            <option key={contractor.id} value={contractor.name} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="engineer">Engineer *</Label>
        <Input
          id="engineer"
          value={newWIR.engineer || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, engineer: e.target.value }))}
          placeholder="Enter engineer name"
          disabled={isResultSubmission}
          list="engineers-list"
        />
        <datalist id="engineers-list">
          {engineers.map(engineer => (
            <option key={engineer.id} value={engineer.name} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default WIRBasicInfoForm;
