
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PercentageAdjustment } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Adjustments = () => {
  const { percentageAdjustments, addPercentageAdjustment, updatePercentageAdjustment, deletePercentageAdjustment } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<string | null>(null);
  const [newAdjustment, setNewAdjustment] = useState<Partial<PercentageAdjustment>>({
    keyword: '',
    description: '',
    percentage: 0,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdjustment(prev => ({ 
      ...prev, 
      [name]: name === 'percentage' ? parseFloat(value) / 100 || 0 : value 
    }));
  };
  
  const handleAddAdjustment = () => {
    if (!newAdjustment.keyword || !newAdjustment.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (editingAdjustment) {
      updatePercentageAdjustment(editingAdjustment, newAdjustment);
      toast.success('Adjustment updated successfully.');
    } else {
      addPercentageAdjustment(newAdjustment as Omit<PercentageAdjustment, 'id'>);
      toast.success('Adjustment added successfully.');
    }
    
    setNewAdjustment({
      keyword: '',
      description: '',
      percentage: 0,
    });
    setEditingAdjustment(null);
    setIsAddDialogOpen(false);
  };
  
  const handleEditAdjustment = (adjustment: PercentageAdjustment) => {
    setNewAdjustment({
      keyword: adjustment.keyword,
      description: adjustment.description,
      percentage: adjustment.percentage,
    });
    setEditingAdjustment(adjustment.id);
    setIsAddDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Consultant-Agreed Percentage Adjustments</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Adjustment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAdjustment ? 'Edit' : 'Add'} Percentage Adjustment</DialogTitle>
              <DialogDescription>
                Define keywords and their associated percentage adjustments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keyword" className="text-right">
                  Keyword
                </Label>
                <Input
                  id="keyword"
                  name="keyword"
                  value={newAdjustment.keyword}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={newAdjustment.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Percentage (%)
                </Label>
                <Input
                  id="percentage"
                  name="percentage"
                  type="number"
                  value={newAdjustment.percentage ? newAdjustment.percentage * 100 : ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingAdjustment(null);
                setNewAdjustment({
                  keyword: '',
                  description: '',
                  percentage: 0,
                });
              }}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddAdjustment}>
                {editingAdjustment ? 'Save Changes' : 'Add Adjustment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage Adjustment
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {percentageAdjustments.map((adjustment) => (
              <tr key={adjustment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {adjustment.keyword}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {adjustment.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  +{(adjustment.percentage * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAdjustment(adjustment)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        deletePercentageAdjustment(adjustment.id);
                        toast.success('Adjustment deleted successfully.');
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">How Adjustments Work</h3>
        <p className="text-gray-600 mb-4">
          When a Work Inspection Request (WIR) description contains any of the keywords defined above, 
          the system will automatically apply the corresponding percentage adjustment to the calculated amount.
        </p>
        <div className="bg-white p-4 rounded border border-gray-200">
          <h4 className="font-medium mb-2">Example:</h4>
          <p className="text-sm text-gray-600">
            If a WIR description contains the word "holes" and the BOQ item has a base value of $1,000, 
            a +20% adjustment would be applied, resulting in a final amount of $1,200.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Adjustments;
