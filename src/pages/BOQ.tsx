
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { BOQItem } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Upload, Plus, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';

const BOQ = () => {
  const { boqItems, addBOQItem, updateBOQItem, deleteBOQItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Always use English number formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // Calculate total amount for an item (sum of children if parent, or own calculation if leaf)
  const calculateItemTotal = (item: BOQItem): number => {
    if (item.children && item.children.length > 0) {
      // Parent item: sum of all children's totals
      return item.children.reduce((sum, child) => sum + calculateItemTotal(child), 0);
    } else {
      // Leaf item: quantity * unitRate
      return item.quantity * item.unitRate;
    }
  };
  
  // Function to find BOQ item by code recursively
  const findItemByCode = (items: BOQItem[], code: string): BOQItem | null => {
    for (const item of items) {
      if (item.code === code) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItemByCode(item.children, code);
        if (found) return found;
      }
    }
    return null;
  };
  
  // Function to flatten BOQ items for export
  const flattenBOQItems = (items: BOQItem[], level: number = 0, parentCode: string = ''): any[] => {
    const result: any[] = [];
    items.forEach(item => {
      const totalValue = calculateItemTotal(item);
      result.push({
        'Item Code': item.code,
        'Description (EN)': item.description,
        'Description (AR)': item.descriptionAr || '',
        'Quantity': item.quantity,
        'Unit (EN)': item.unit,
        'Unit (AR)': item.unitAr || '',
        'Unit Rate': item.unitRate,
        'Total Amount': totalValue,
        'Level': level,
        'Parent Code': parentCode
      });
      
      if (item.children && item.children.length > 0) {
        result.push(...flattenBOQItems(item.children, level + 1, item.code));
      }
    });
    return result;
  };
  
  const exportToExcel = () => {
    try {
      const flattenedData = flattenBOQItems(boqItems);
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BOQ Items');
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 15 }, // Item Code
        { width: 40 }, // Description (EN)
        { width: 40 }, // Description (AR)
        { width: 12 }, // Quantity
        { width: 15 }, // Unit (EN)
        { width: 15 }, // Unit (AR)
        { width: 15 }, // Unit Rate
        { width: 18 }, // Total Amount
        { width: 8 },  // Level
        { width: 15 }  // Parent Code
      ];
      
      XLSX.writeFile(workbook, `BOQ_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('BOQ data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export BOQ data');
    }
  };
  
  const importFromExcel = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Imported data:', jsonData);
        
        // Process imported data and build hierarchy
        let importCount = 0;
        let skippedCount = 0;
        
        // First, sort data by level to ensure parents are created before children
        const sortedData = jsonData.sort((a: any, b: any) => {
          const levelA = parseInt(a['Level']) || 0;
          const levelB = parseInt(b['Level']) || 0;
          return levelA - levelB;
        });
        
        // Keep track of created items by code for parent lookup
        const createdItemsMap = new Map<string, string>(); // code -> id
        
        for (const row of sortedData) {
          const itemData = {
            code: row['Item Code'] || '',
            description: row['Description (EN)'] || '',
            descriptionAr: row['Description (AR)'] || '',
            quantity: parseFloat(row['Quantity']) || 0,
            unit: row['Unit (EN)'] || '',
            unitAr: row['Unit (AR)'] || '',
            unitRate: parseFloat(row['Unit Rate']) || 0,
            level: parseInt(row['Level']) || 0,
            parentCode: row['Parent Code'] || ''
          };
          
          console.log('Processing item:', itemData);
          
          // Only import if required fields are present
          if (itemData.code && itemData.description && itemData.unit) {
            // Check if item already exists
            const existingItem = findItemByCode(boqItems, itemData.code);
            if (existingItem) {
              console.log('Item already exists, skipping:', itemData.code);
              // Add to map even if skipped for parent lookup
              createdItemsMap.set(itemData.code, existingItem.id);
              skippedCount++;
              continue;
            }
            
            let parentId: string | undefined = undefined;
            
            // Find parent if parentCode is provided
            if (itemData.parentCode) {
              // First check in created items map
              const parentIdFromMap = createdItemsMap.get(itemData.parentCode);
              if (parentIdFromMap) {
                parentId = parentIdFromMap;
                console.log('Found parent from map for', itemData.code, ':', itemData.parentCode, parentIdFromMap);
              } else {
                // Fallback to searching existing items
                const parentItem = findItemByCode(boqItems, itemData.parentCode);
                if (parentItem) {
                  parentId = parentItem.id;
                  createdItemsMap.set(itemData.parentCode, parentItem.id);
                  console.log('Found parent in existing items for', itemData.code, ':', parentItem.code, parentItem.id);
                } else {
                  console.log('Parent not found for', itemData.code, ', parent code:', itemData.parentCode);
                }
              }
            }
            
            const itemToAdd = {
              code: itemData.code,
              description: itemData.description,
              descriptionAr: itemData.descriptionAr,
              quantity: itemData.quantity,
              unit: itemData.unit,
              unitAr: itemData.unitAr,
              unitRate: itemData.unitRate,
              level: itemData.level
            };
            
            console.log('Adding item:', itemToAdd, 'with parentId:', parentId);
            
            try {
              const createdItem = await addBOQItem(itemToAdd, parentId);
              // Store the created item ID for future parent lookups
              if (createdItem && createdItem.id) {
                createdItemsMap.set(itemData.code, createdItem.id);
              }
              importCount++;
            } catch (error) {
              console.error('Error adding item:', itemData.code, error);
              skippedCount++;
            }
          } else {
            console.log('Skipping item due to missing required fields:', itemData);
            skippedCount++;
          }
        }
        
        if (importCount > 0) {
          toast.success(`Successfully imported ${importCount} BOQ items!${skippedCount > 0 ? ` (${skippedCount} items skipped)` : ''}`);
        } else {
          toast.warning('No items were imported. Please check the file format and data.');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import BOQ data. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
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
    
    if (editingItem) {
      // Update existing item
      updateBOQItem(editingItem, newItem);
      toast.success('BOQ item updated successfully.');
    } else {
      // Add new item
      const totalAmount = (newItem.quantity || 0) * (newItem.unitRate || 0);
      const itemToAdd = {
        ...newItem,
        totalAmount,
        level: parentId ? (getItemLevel(parentId) + 1) : 0
      };
      
      addBOQItem(itemToAdd as Omit<BOQItem, 'id'>, parentId);
      toast.success('BOQ item added successfully.');
    }
    
    resetForm();
  };
  
  const resetForm = () => {
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
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };
  
  const handleEditItem = (item: BOQItem) => {
    setNewItem({
      code: item.code,
      description: item.description,
      descriptionAr: item.descriptionAr,
      quantity: item.quantity,
      unit: item.unit,
      unitAr: item.unitAr,
      unitRate: item.unitRate,
    });
    setEditingItem(item.id);
    setParentId(undefined);
    setIsAddDialogOpen(true);
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
  
  const handleDeleteItem = (itemId: string, itemCode: string) => {
    deleteBOQItem(itemId);
    toast.success(`BOQ item ${itemCode} deleted successfully.`);
  };
  
  const renderBOQItem = (item: BOQItem, level: number = 0) => {
    const totalValue = calculateItemTotal(item);
    const indentLevel = level * 30;
    const isParent = item.children && item.children.length > 0;
    
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
            {isParent ? '-' : item.quantity.toLocaleString('en-US')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {isParent ? '-' : (language === 'en' ? item.unit : (item.unitAr || item.unit))}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {isParent ? '-' : formatter.format(item.unitRate)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {formatter.format(totalValue)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditItem(item)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the BOQ item "{item.code}" 
                      {isParent ? ' and all its sub-items' : ''}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteItem(item.id, item.code)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
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
              <Button onClick={resetForm}>Add New Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit BOQ Item / تعديل بند كميات' : 'Add BOQ Item / إضافة بند كميات'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Edit the BOQ item details.'
                    : parentId 
                      ? 'Add a sub-item to the selected BOQ item.' 
                      : 'Create a new top-level BOQ item.'
                  }
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
                    step="any"
                    min="0"
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
                    step="any"
                    min="0"
                    value={newItem.unitRate}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddItem}>
                  {editingItem ? 'Save Changes' : 'Add Item'}
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
                  {language === 'en' ? 'Unit' : 'الوحدة'}
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
