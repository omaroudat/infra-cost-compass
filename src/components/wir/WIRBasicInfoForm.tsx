
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import BOQItemSelector from './BOQItemSelector';

interface WIRBasicInfoFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  flattenedBOQItems: BOQItem[];
  isResultSubmission: boolean;
  showOnlyBOQ?: boolean;
}

const WIRBasicInfoForm: React.FC<WIRBasicInfoFormProps> = ({
  newWIR,
  setNewWIR,
  flattenedBOQItems,
  isResultSubmission,
  showOnlyBOQ = false,
}) => {
  const { contractors, engineers } = useAppContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ 
      ...prev, 
      [name]: name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  const handleBOQItemsChange = (selectedItems: string[]) => {
    setNewWIR(prev => ({ 
      ...prev, 
      linkedBOQItems: selectedItems,
      // Set the first selected item as the main boqItemId for backward compatibility
      boqItemId: selectedItems.length > 0 ? selectedItems[0] : ''
    }));
  };

  if (showOnlyBOQ) {
    return (
      <BOQItemSelector
        flattenedBOQItems={flattenedBOQItems}
        selectedItems={newWIR.linkedBOQItems || []}
        onSelectionChange={handleBOQItemsChange}
        isResultSubmission={isResultSubmission}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contractor" className="text-sm font-medium text-gray-700">
            Contractor / المقاول *
          </Label>
          <Select
            value={newWIR.contractor || ''}
            onValueChange={(value) => handleSelectChange('contractor', value)}
            disabled={isResultSubmission}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a contractor" />
            </SelectTrigger>
            <SelectContent>
              {contractors.map((contractor) => (
                <SelectItem key={contractor.id} value={contractor.name}>
                  {contractor.name} {contractor.company && `(${contractor.company})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="engineer" className="text-sm font-medium text-gray-700">
            Engineer / المهندس *
          </Label>
          <Select
            value={newWIR.engineer || ''}
            onValueChange={(value) => handleSelectChange('engineer', value)}
            disabled={isResultSubmission}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an engineer" />
            </SelectTrigger>
            <SelectContent>
              {engineers.map((engineer) => (
                <SelectItem key={engineer.id} value={engineer.name}>
                  {engineer.name} {engineer.department && `(${engineer.department})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="value" className="text-sm font-medium text-gray-700">
            Value / القيمة (SAR) *
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={newWIR.value || 0}
            onChange={handleInputChange}
            className="w-full"
            disabled={isResultSubmission}
            required
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="submittalDate" className="text-sm font-medium text-gray-700">
            Submittal Date / تاريخ التقديم *
          </Label>
          <Input
            id="submittalDate"
            name="submittalDate"
            type="date"
            value={newWIR.submittalDate}
            onChange={handleInputChange}
            className="w-full"
            disabled={isResultSubmission}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description / الوصف *
        </Label>
        <Textarea
          id="description"
          name="description"
          value={newWIR.description}
          onChange={handleInputChange}
          className="w-full min-h-[100px] resize-vertical"
          disabled={isResultSubmission}
          required
          placeholder="Provide detailed description of the work inspection..."
        />
      </div>
    </div>
  );
};

export default WIRBasicInfoForm;
