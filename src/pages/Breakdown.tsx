
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BreakdownItem, BOQItem } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

const Breakdown = () => {
  const { breakdownItems, boqItems, addBreakdownItem, updateBreakdownItem, deleteBreakdownItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BreakdownItem>>({
    keyword: '',
    keywordAr: '',
    description: '',
    descriptionAr: '',
    percentage: 0,
    value: 0,
    boqItemId: '',
  });
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  
  const flattenedBOQItems = (items: BOQItem[]): BOQItem[] => {
    const result: BOQItem[] = [];
    items.forEach(item => {
      // Check if this item is at level 6 (code has 5 dots, meaning 6 levels)
      const codeLevel = (item.code.match(/\./g) || []).length + 1;
      if (codeLevel === 6) {
        result.push(item);
      }
      if (item.children) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'percentage' || name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewItem(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    if (!newItem.keyword || !newItem.description || !newItem.boqItemId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    if (editingItem) {
      updateBreakdownItem(editingItem, newItem);
      toast.success('Breakdown item updated successfully.');
    } else {
      addBreakdownItem(newItem as Omit<BreakdownItem, 'id'>);
      toast.success('Breakdown item added successfully.');
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setNewItem({
      keyword: '',
      keywordAr: '',
      description: '',
      descriptionAr: '',
      percentage: 0,
      value: 0,
      boqItemId: '',
    });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };
  
  const handleEdit = (item: BreakdownItem) => {
    setNewItem({
      keyword: item.keyword,
      keywordAr: item.keywordAr,
      description: item.description,
      descriptionAr: item.descriptionAr,
      percentage: item.percentage,
      value: item.value,
      boqItemId: item.boqItemId,
    });
    setEditingItem(item.id);
    setIsAddDialogOpen(true);
  };
  
  const getBOQItemLabel = (id: string) => {
    const item = flattenedBOQItems(boqItems).find(item => item.id === id);
    if (!item) return 'Unknown';
    const desc = language === 'en' ? item.description : (item.descriptionAr || item.description);
    return `${item.code} - ${desc}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Break-Down Items / وصف البنود الفرعية (Level 6 Only)</h2>
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Add New Break-Down</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Break-Down Item</DialogTitle>
              <DialogDescription>
                Define breakdown items with their associated percentages for Level 6 BOQ items only.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="boqItemId" className="text-right">
                  BOQ Item (Level 6)
                </Label>
                <div className="col-span-3">
                  <Select
                    value={newItem.boqItemId}
                    onValueChange={(value) => handleSelectChange('boqItemId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level 6 BOQ Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {flattenedBOQItems(boqItems).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {getBOQItemLabel(item.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keyword" className="text-right">
                  Keyword (EN)
                </Label>
                <Input
                  id="keyword"
                  name="keyword"
                  value={newItem.keyword}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="keywordAr" className="text-right">
                  Keyword (AR)
                </Label>
                <Input
                  id="keywordAr"
                  name="keywordAr"
                  value={newItem.keywordAr || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description (EN)
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
                  Description (AR)
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
                <Label htmlFor="percentage" className="text-right">
                  Percentage (%)
                </Label>
                <Input
                  id="percentage"
                  name="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.percentage}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value (SAR)
                </Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  value={newItem.value}
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
              <Button type="button" onClick={handleSave}>
                {editingItem ? 'Save Changes' : 'Add Break-Down'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'en' ? 'BOQ Item' : 'بند الكميات'}</TableHead>
              <TableHead>{language === 'en' ? 'Keyword' : 'الكلمة المفتاحية'}</TableHead>
              <TableHead>{language === 'en' ? 'Description' : 'الوصف'}</TableHead>
              <TableHead>{language === 'en' ? 'Percentage' : 'النسبة المئوية'}</TableHead>
              <TableHead>{language === 'en' ? 'Value (SAR)' : 'القيمة (ريال)'}</TableHead>
              <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdownItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{getBOQItemLabel(item.boqItemId)}</TableCell>
                <TableCell>
                  {language === 'en' ? item.keyword : (item.keywordAr || item.keyword)}
                </TableCell>
                <TableCell>
                  {language === 'en' ? item.description : (item.descriptionAr || item.description)}
                </TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>{item.value.toLocaleString('ar-SA')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        deleteBreakdownItem(item.id);
                        toast.success('Break-down item deleted successfully.');
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Breakdown;
