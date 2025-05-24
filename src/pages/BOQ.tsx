
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BOQItem } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Upload, Plus } from 'lucide-react';

const BOQ = () => {
  const { boqItems, addBOQItem, updateBOQItem, deleteBOQItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BOQItem>>({
    code: '',
    description: '',
    descriptionAr: '',
    quantity: 0,
    unit: '',
    unitAr: '',
    unitRate: 0,
  });
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'unitRate' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const generateNextCode = (parentCode?: string, siblings?: BOQItem[]) => {
    if (!parentCode) {
      const topLevelItems = boqItems.filter(item => !item.parentId);
      const maxNumber = topLevelItems.reduce((max, item) => {
        const num = parseInt(item.code);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      return (maxNumber + 1).toString();
    }
    
    const siblingCodes = siblings || [];
    const maxSubNumber = siblingCodes.reduce((max, item) => {
      const parts = item.code.split('.');
      const lastPart = parseInt(parts[parts.length - 1]);
      return isNaN(lastPart) ? max : Math.max(max, lastPart);
    }, 0);
    
    return `${parentCode}.${maxSubNumber + 1}`;
  };
  
  const handleAddItem = () => {
    if (!newItem.code || !newItem.description || !newItem.unit) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    const totalAmount = (newItem.quantity || 0) * (newItem.unitRate || 0);
    const itemToAdd = {
      ...newItem,
      totalAmount,
      level: parentId ? (getItemLevel(parentId) + 1) : 0
    };
    
    addBOQItem(itemToAdd as Omit<BOQItem, 'id'>, parentId);
    setNewItem({
      code: '',
      description: '',
      descriptionAr: '',
      quantity: 0,
      unit: '',
      unitAr: '',
      unitRate: 0,
    });
    setParentId(undefined);
    setIsAddDialogOpen(false);
    toast.success('BOQ item added successfully.');
  };
  
  const getItemLevel = (itemId: string): number => {
    const findItem = (items: BOQItem[], id: string): BOQItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const item = findItem(boqItems, itemId);
    return item?.level || 0;
  };
  
  const renderBOQItem = (item: BOQItem, level: number = 0) => {
    const totalValue = item.quantity * item.unitRate;
    const indentLevel = level * 30;
    
    return (
      <React.Fragment key={item.id}>
        <tr className={level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-blue-50' : level === 2 ? 'bg-green-50' : 'bg-yellow-50'}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ paddingLeft: `${indentLevel + 24}px` }}>
            {item.code}
          </td>
          <td className="px-6 py-4 text-sm text-gray-500">
            <div>{language === 'en' ? item.description : (item.descriptionAr || item.description)}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item.quantity} {language === 'en' ? item.unit : (item.unitAr || item.unit)}
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
                  const nextCode = generateNextCode(item.code, item.children);
                  setNewItem({
                    code: nextCode,
                    description: '',
                    descriptionAr: '',
                    quantity: 0,
                    unit: '',
                    unitAr: '',
                    unitRate: 0,
                  });
                  setParentId(item.id);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
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
  
  const exportToExcel = () => {
    // This would typically use a library like xlsx
    toast.info('Excel export functionality will be implemented with xlsx library');
  };
  
  const importFromExcel = () => {
    // This would typically use a library like xlsx
    toast.info('Excel import functionality will be implemented with xlsx library');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Bill of Quantities / قائمة الكميات</h2>
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('ar')}
            >
              عربي
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={importFromExcel}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add BOQ Item / إضافة بند كميات</DialogTitle>
                <DialogDescription>
                  {parentId ? 'Add a sub-item to the selected BOQ item.' : 'Create a new top-level BOQ item.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    {language === 'en' ? 'Item Code' : 'رقم البند'}
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
                    {language === 'en' ? 'Description (EN)' : 'الوصف (إنجليزي)'}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newItem.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descriptionAr" className="text-right">
                    {language === 'en' ? 'Description (AR)' : 'الوصف (عربي)'}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    name="descriptionAr"
                    value={newItem.descriptionAr || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    {language === 'en' ? 'Quantity' : 'الكمية'}
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
                    {language === 'en' ? 'Unit (EN)' : 'الوحدة (إنجليزي)'}
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
                  <Label htmlFor="unitAr" className="text-right">
                    {language === 'en' ? 'Unit (AR)' : 'الوحدة (عربي)'}
                  </Label>
                  <Input
                    id="unitAr"
                    name="unitAr"
                    value={newItem.unitAr || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitRate" className="text-right">
                    {language === 'en' ? 'Unit Rate' : 'السعر الافرادي'}
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
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Code' : 'رقم البند'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Description' : 'الوصف'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Quantity' : 'الكمية'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Unit Rate' : 'السعر الافرادي'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Total Amount' : 'السعر الإجمالي'}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Actions' : 'الإجراءات'}
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
