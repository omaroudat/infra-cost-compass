
import React from 'react';
import { Contractor } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ContractorFormProps {
  newContractor: Partial<Contractor>;
  setNewContractor: React.Dispatch<React.SetStateAction<Partial<Contractor>>>;
  editingContractor: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

const ContractorForm: React.FC<ContractorFormProps> = ({
  newContractor,
  setNewContractor,
  editingContractor,
  onCancel,
  onSubmit
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContractor(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name *
        </Label>
        <Input
          id="name"
          name="name"
          value={newContractor.name || ''}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="company" className="text-right">
          Company
        </Label>
        <Input
          id="company"
          name="company"
          value={newContractor.company || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="email" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={newContractor.email || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">
          Phone
        </Label>
        <Input
          id="phone"
          name="phone"
          value={newContractor.phone || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {editingContractor ? 'Update' : 'Add'} Contractor
        </Button>
      </div>
    </div>
  );
};

export default ContractorForm;
