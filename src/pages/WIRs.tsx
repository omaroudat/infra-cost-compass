
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BOQItem, WIR, WIRStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { calculateWIRAmount, findApplicableAdjustment } from '../utils/calculations';

const WIRs = () => {
  const { wirs, boqItems, addWIR, updateWIR, deleteWIR } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWIR, setEditingWIR] = useState<string | null>(null);
  const [newWIR, setNewWIR] = useState<Partial<WIR>>({
    boqItemId: '',
    description: '',
    submittalDate: new Date().toISOString().split('T')[0],
    receivedDate: null,
    status: 'A',
    statusConditions: '',
  });
  
  const statusOptions: { value: WIRStatus, label: string }[] = [
    { value: 'A', label: 'Approved' },
    { value: 'B', label: 'Approved with Conditions' },
    { value: 'C', label: 'Rejected' },
  ];
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const flattenedBOQItems = boqItems.flatMap(item => 
    [item, ...(item.children || [])]
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddWIR = () => {
    if (!newWIR.boqItemId || !newWIR.description || !newWIR.submittalDate || !newWIR.status) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (editingWIR) {
      updateWIR(editingWIR, newWIR);
      toast.success('WIR updated successfully.');
    } else {
      addWIR(newWIR as Omit<WIR, 'id' | 'calculatedAmount' | 'adjustmentApplied'>);
      toast.success('WIR added successfully.');
    }
    
    setNewWIR({
      boqItemId: '',
      description: '',
      submittalDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'A',
      statusConditions: '',
    });
    setEditingWIR(null);
    setIsAddDialogOpen(false);
  };
  
  const handleEditWIR = (wir: WIR) => {
    setNewWIR({
      boqItemId: wir.boqItemId,
      description: wir.description,
      submittalDate: wir.submittalDate,
      receivedDate: wir.receivedDate,
      status: wir.status,
      statusConditions: wir.statusConditions || '',
    });
    setEditingWIR(wir.id);
    setIsAddDialogOpen(true);
  };

  const getBOQItemByIdWithLabel = (id: string): string => {
    const item = flattenedBOQItems.find(item => item.id === id);
    return item ? `${item.code} - ${item.description}` : 'Unknown';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Work Inspection Requests (WIRs)</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New WIR</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingWIR ? 'Edit' : 'Add'} Work Inspection Request</DialogTitle>
              <DialogDescription>
                Fill in the details for the work inspection request.
              </DialogDescription>
            </DialogHeader>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingWIR(null);
                setNewWIR({
                  boqItemId: '',
                  description: '',
                  submittalDate: new Date().toISOString().split('T')[0],
                  receivedDate: null,
                  status: 'A',
                  statusConditions: '',
                });
              }}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddWIR}>
                {editingWIR ? 'Save Changes' : 'Add WIR'}
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
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BOQ Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submittal Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wirs.map((wir) => (
              <tr key={wir.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {wir.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getBOQItemByIdWithLabel(wir.boqItemId)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{wir.description}</div>
                  {wir.adjustmentApplied && (
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      +{(wir.adjustmentApplied.percentage * 100).toFixed(0)}% ({wir.adjustmentApplied.keyword})
                    </div>
                  )}
                  {wir.status === 'B' && wir.statusConditions && (
                    <div className="mt-1 text-xs text-amber-600">
                      Conditions: {wir.statusConditions}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(wir.submittalDate).toLocaleDateString()}
                  {wir.receivedDate && (
                    <div className="text-xs text-gray-400">
                      Received: {new Date(wir.receivedDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={wir.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {wir.calculatedAmount ? formatter.format(wir.calculatedAmount) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditWIR(wir)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        deleteWIR(wir.id);
                        toast.success('WIR deleted successfully.');
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
    </div>
  );
};

export default WIRs;
