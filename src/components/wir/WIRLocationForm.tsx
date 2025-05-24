
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
    const numericFields = ['lengthOfLine', 'diameterOfLine'];
    setNewWIR(prev => ({ 
      ...prev, 
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value 
    }));
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lengthOfLine" className="text-right">
          Length of Line (m) / طول الخط
        </Label>
        <Input
          id="lengthOfLine"
          name="lengthOfLine"
          type="number"
          value={newWIR.lengthOfLine || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="diameterOfLine" className="text-right">
          Diameter (mm) / القطر
        </Label>
        <Input
          id="diameterOfLine"
          name="diameterOfLine"
          type="number"
          value={newWIR.diameterOfLine || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lineNo" className="text-right">
          Line No / رقم الخط
        </Label>
        <Input
          id="lineNo"
          name="lineNo"
          value={newWIR.lineNo || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
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
