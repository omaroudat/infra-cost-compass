
import React from 'react';
import { WIR, WIRStatus, BOQItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const statusOptions: { value: WIRStatus, label: string }[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newWIR.boqItemId || !newWIR.description || !newWIR.submittalDate || !newWIR.status || !newWIR.contractor || !newWIR.engineer) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    onSubmit();
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="boqItemId" className="text-right">
          BOQ Item
        </Label>
        <div className="col-span-3">
          <Select
            value={newWIR.boqItemId}
            onValueChange={(value) => handleSelectChange('boqItemId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select BOQ Item" />
            </SelectTrigger>
            <SelectContent>
              {flattenedBOQItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.code} - {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractor" className="text-right">
          Contractor
        </Label>
        <Input
          id="contractor"
          name="contractor"
          value={newWIR.contractor || ''}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="engineer" className="text-right">
          Engineer
        </Label>
        <Input
          id="engineer"
          name="engineer"
          value={newWIR.engineer || ''}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={newWIR.description}
          onChange={handleInputChange}
          className="col-span-3 min-h-[80px]"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="submittalDate" className="text-right">
          Submittal Date
        </Label>
        <Input
          id="submittalDate"
          name="submittalDate"
          type="date"
          value={newWIR.submittalDate}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="receivedDate" className="text-right">
          Received Date
        </Label>
        <Input
          id="receivedDate"
          name="receivedDate"
          type="date"
          value={newWIR.receivedDate || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <div className="col-span-3">
          <Select
            value={newWIR.status}
            onValueChange={(value) => handleSelectChange('status', value as WIRStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(newWIR.status === 'B') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="statusConditions" className="text-right">
            Conditions
          </Label>
          <Textarea
            id="statusConditions"
            name="statusConditions"
            value={newWIR.statusConditions || ''}
            onChange={handleInputChange}
            className="col-span-3 min-h-[60px]"
          />
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {editingWIR ? 'Save Changes' : 'Add WIR'}
        </Button>
      </div>
    </div>
  );
};

export default WIRForm;
