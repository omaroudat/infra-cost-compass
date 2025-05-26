
import React from 'react';
import { Engineer } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EngineerFormProps {
  newEngineer: Partial<Engineer>;
  setNewEngineer: React.Dispatch<React.SetStateAction<Partial<Engineer>>>;
  editingEngineer: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

const EngineerForm: React.FC<EngineerFormProps> = ({
  newEngineer,
  setNewEngineer,
  editingEngineer,
  onCancel,
  onSubmit
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEngineer(prev => ({ ...prev, [name]: value }));
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
          value={newEngineer.name || ''}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="department" className="text-right">
          Department
        </Label>
        <Input
          id="department"
          name="department"
          value={newEngineer.department || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="specialization" className="text-right">
          Specialization
        </Label>
        <Input
          id="specialization"
          name="specialization"
          value={newEngineer.specialization || ''}
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
          value={newEngineer.email || ''}
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
          value={newEngineer.phone || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {editingEngineer ? 'Update' : 'Add'} Engineer
        </Button>
      </div>
    </div>
  );
};

export default EngineerForm;
