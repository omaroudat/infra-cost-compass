
import React from 'react';
import { WIR } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WIRLocationFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission: boolean;
}

const WIRLocationForm: React.FC<WIRLocationFormProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="region" className="text-sm font-medium text-gray-700">
        Zone / المنطقة *
      </Label>
      <Input
        id="region"
        name="region"
        value={newWIR.region || ''}
        onChange={handleInputChange}
        className="w-full"
        disabled={isResultSubmission}
        required
        placeholder="Enter project zone or area"
      />
    </div>
  );
};

export default WIRLocationForm;
