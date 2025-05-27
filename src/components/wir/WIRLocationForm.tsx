
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
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="region" className="text-right">
          Region / المنطقة
        </Label>
        <Input
          id="region"
          name="region"
          value={newWIR.region || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
    </>
  );
};

export default WIRLocationForm;
