
import React from 'react';
import { WIR } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WIRLocationFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission?: boolean;
}

const WIRLocationForm: React.FC<WIRLocationFormProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="region">Region *</Label>
        <Input
          id="region"
          value={newWIR.region || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, region: e.target.value }))}
          placeholder="Enter region"
          disabled={isResultSubmission}
        />
      </div>


      <div>
        <Label htmlFor="lengthOfLine">Length of Line (meters) *</Label>
        <Input
          id="lengthOfLine"
          type="number"
          step="0.01"
          min="0"
          value={newWIR.lengthOfLine || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, lengthOfLine: parseFloat(e.target.value) || 0 }))}
          placeholder="Enter length in meters"
          disabled={isResultSubmission}
        />
      </div>

      <div>
        <Label htmlFor="diameterOfLine">Diameter of Line (mm) *</Label>
        <Input
          id="diameterOfLine"
          type="number"
          step="0.01"
          min="0"
          value={newWIR.diameterOfLine || ''}
          onChange={(e) => setNewWIR(prev => ({ ...prev, diameterOfLine: parseFloat(e.target.value) || 0 }))}
          placeholder="Enter diameter in mm"
          disabled={isResultSubmission}
        />
      </div>
    </div>
  );
};

export default WIRLocationForm;
