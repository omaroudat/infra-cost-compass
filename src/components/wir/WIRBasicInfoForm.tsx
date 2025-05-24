
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
        <Input
          id="contractor"
          name="contractor"
          value={newWIR.contractor || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="engineer" className="text-right">
          Engineer / المهندس
        </Label>
        <Input
          id="engineer"
          name="engineer"
          value={newWIR.engineer || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
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
