
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BOQItem } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BOQ = () => {
  const { boqItems, addBOQItem, updateBOQItem, deleteBOQItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BOQItem>>({
    code: '',
    description: '',
    quantity: 0,
    unit: '',
    unitRate: 0,
  });
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'unitRate' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleAddItem = () => {
    if (!newItem.code || !newItem.description || !newItem.unit) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    addBOQItem(newItem as Omit<BOQItem, 'id'>, parentId);
    setNewItem({
      code: '',
      description: '',
      quantity: 0,
      unit: '',
      unitRate: 0,
    });
    setParentId(undefined);
    setIsAddDialogOpen(false);
    toast.success('BOQ item added successfully.');
  };
  
  const renderBOQItem = (item: BOQItem, level: number = 0) => {
    const totalValue = item.quantity * item.unitRate;
    
    return (
      <React.Fragment key={item.id}>
        <tr className={level === 0 ? 'bg-gray-50' : ''}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ paddingLeft: `${level * 20 + 24}px` }}>
            {item.code}
          </td>
          <td className="px-6 py-4 text-sm text-gray-500">
            {item.description}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item.quantity} {item.unit}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatter.format(item.unitRate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {formatter.format(totalValue)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setNewItem({
                    code: `${item.code}.`,
                    description: '',
                    quantity: 0,
                    unit: '',
                    unitRate: 0,
                  });
                  setParentId(item.id);
                  setIsAddDialogOpen(true);
                }}
              >
                Add Sub-item
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  deleteBOQItem(item.id);
                  toast.success('BOQ item deleted successfully.');
                }}
              >
                Delete
              </Button>
            </div>
          </td>
        </tr>
        {item.children && item.children.map(child => renderBOQItem(child, level + 1))}
      </React.Fragment>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Bill of Quantities</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add BOQ Item</DialogTitle>
              <DialogDescription>
                {parentId ? 'Add a sub-item to the selected BOQ item.' : 'Create a new top-level BOQ item.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={newItem.code}
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
                  value={newItem.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="unit"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unitRate" className="text-right">
                  Unit Rate
                </Label>
                <Input
                  id="unitRate"
                  name="unitRate"
                  type="number"
                  value={newItem.unitRate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddItem}>
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boqItems.map(item => renderBOQItem(item))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BOQ;
