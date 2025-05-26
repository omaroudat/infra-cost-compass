
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
}

const WIRBasicInfoForm: React.FC<WIRBasicInfoFormProps> = ({
  newWIR,
  setNewWIR,
  flattenedBOQItems,
  isResultSubmission,
}) => {
  const { contractors, engineers } = useAppContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ ...prev, [name]: value }));
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

  return (
    <>
      <BOQItemSelector
        flattenedBOQItems={flattenedBOQItems}
        selectedItems={newWIR.linkedBOQItems || []}
        onSelectionChange={handleBOQItemsChange}
        isResultSubmission={isResultSubmission}
      />
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractor" className="text-right">
          Contractor / المقاول
        </Label>
        <Select
          value={newWIR.contractor || ''}
          onValueChange={(value) => handleSelectChange('contractor', value)}
          disabled={isResultSubmission}
        >
          <SelectTrigger className="col-span-3">
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
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="engineer" className="text-right">
          Engineer / المهندس
        </Label>
        <Select
          value={newWIR.engineer || ''}
          onValueChange={(value) => handleSelectChange('engineer', value)}
          disabled={isResultSubmission}
        >
          <SelectTrigger className="col-span-3">
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
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description / الوصف
        </Label>
        <Textarea
          id="description"
          name="description"
          value={newWIR.description}
          onChange={handleInputChange}
          className="col-span-3 min-h-[80px]"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="submittalDate" className="text-right">
          Submittal Date / تاريخ التقديم
        </Label>
        <Input
          id="submittalDate"
          name="submittalDate"
          type="date"
          value={newWIR.submittalDate}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
    </>
  );
};

export default WIRBasicInfoForm;
