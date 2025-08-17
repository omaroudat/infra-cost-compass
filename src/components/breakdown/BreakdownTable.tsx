import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BreakdownItem, BOQItem } from '../../types';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';

interface BreakdownTableProps {
  breakdownItems: BreakdownItem[];
  boqItems: BOQItem[];
  language: 'en' | 'ar';
  onEdit: (item: BreakdownItem) => void;
  onDelete: (id: string) => void;
  onAddSubItem?: (parentId: string, subItem: Omit<BreakdownItem, 'id'>) => void;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({
  breakdownItems,
  boqItems,
  language,
  onEdit,
  onDelete,
  onAddSubItem
}) => {
  const [isAddSubItemDialogOpen, setIsAddSubItemDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<BreakdownItem | null>(null);
  const [newSubItem, setNewSubItem] = useState({
    description: '',
    descriptionAr: '',
    percentage: 0
  });

  const flattenedBOQItems = (items: BOQItem[]): BOQItem[] => {
    const result: BOQItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  const getBOQItemDetails = (id: string) => {
    const allItems = flattenedBOQItems(boqItems);
    const item = allItems.find(item => item.id === id);
    if (!item) return { code: 'Unknown', unitRate: 0, quantity: 0 };
    
    return {
      code: item.code,
      unitRate: item.unitRate || 0,
      quantity: item.quantity || 0
    };
  };

  const handleAddSubItem = (parent: BreakdownItem) => {
    setSelectedParent(parent);
    setNewSubItem({
      description: '',
      descriptionAr: '',
      percentage: 0
    });
    setIsAddSubItemDialogOpen(true);
  };

  const handleSaveSubItem = async () => {
    if (!selectedParent || !onAddSubItem) return;
    
    if (!newSubItem.description || newSubItem.percentage <= 0) {
      toast.error('Please fill in description and percentage.');
      return;
    }

    const boqDetails = getBOQItemDetails(selectedParent.boqItemId);
    
    const subItemData = {
      keyword: `${selectedParent.keyword}-${Date.now()}`,
      keywordAr: `${selectedParent.keywordAr}-${Date.now()}`,
      description: newSubItem.description,
      descriptionAr: newSubItem.descriptionAr,
      percentage: newSubItem.percentage,
      value: (boqDetails.unitRate * newSubItem.percentage) / 100,
      boqItemId: selectedParent.boqItemId,
      parentBreakdownId: selectedParent.id,
      unitRate: boqDetails.unitRate,
      quantity: boqDetails.quantity,
      isLeaf: true
    };

    await onAddSubItem(selectedParent.id, subItemData);
    setIsAddSubItemDialogOpen(false);
    setSelectedParent(null);
    toast.success('Sub-item added successfully.');
  };

  // Calculate parent percentage based on child percentages
  const calculateParentPercentage = (parentItem: BreakdownItem) => {
    if (!parentItem.children || parentItem.children.length === 0) {
      return 0;
    }
    return parentItem.children.reduce((sum, child) => sum + (child.percentage || 0), 0);
  };

  const handleDeleteClick = () => {
    toast.info('Breakdown items cannot be deleted. They are automatically managed based on BOQ items.');
  };

  // Always use English number formatting
  const numberFormatter = new Intl.NumberFormat('en-US');

  const renderBreakdownItem = (item: BreakdownItem, level: number = 0) => {
    const indentLevel = level * 20;
    const boqDetails = getBOQItemDetails(item.boqItemId);
    const parentPercentage = calculateParentPercentage(item);
    
    return (
      <React.Fragment key={item.id}>
        <TableRow className={level > 0 ? 'bg-gray-50' : ''}>
          <TableCell className="font-mono text-sm" style={{ paddingLeft: `${indentLevel + 16}px` }}>
            <div className="text-blue-600">
              {boqDetails.code}
            </div>
          </TableCell>
          <TableCell className="text-sm">
            <div className={language === 'ar' ? 'text-right' : ''}>
              {level === 0 ? '' : (language === 'en' ? item.description : (item.descriptionAr || item.description))}
            </div>
          </TableCell>
          <TableCell className="text-sm">
            {numberFormatter.format(boqDetails.unitRate)}
          </TableCell>
          <TableCell>
            {level > 0 ? `${item.percentage}%` : (parentPercentage > 0 ? `${parentPercentage}%` : '-')}
          </TableCell>
          <TableCell>
            {numberFormatter.format(boqDetails.quantity)}
          </TableCell>
          <TableCell>
            {level > 0 && item.value ? numberFormatter.format(item.value) : 
             (level === 0 && parentPercentage > 0 ? numberFormatter.format((boqDetails.unitRate * parentPercentage) / 100) : '-')}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex space-x-2 justify-end">
              {level === 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddSubItem(item)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {language === 'en' ? 'Add Sub-item' : 'إضافة عنصر فرعي'}
                </Button>
              )}
              {level > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {language === 'en' ? 'Edit' : 'تعديل'}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteClick}
                disabled
                className="opacity-50 cursor-not-allowed"
              >
                {language === 'en' ? 'Delete' : 'حذف'}
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {item.children && item.children.map(child => renderBreakdownItem(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{language === 'en' ? 'BOQ Item' : 'بند الكميات'}</TableHead>
            <TableHead>{language === 'en' ? 'Description' : 'الوصف'}</TableHead>
            <TableHead>{language === 'en' ? 'BOQ Unit Rate' : 'السعر الافرادي'}</TableHead>
            <TableHead>{language === 'en' ? 'Percentage' : 'النسبة المئوية'}</TableHead>
            <TableHead>{language === 'en' ? 'Quantity' : 'الكمية'}</TableHead>
            <TableHead>{language === 'en' ? 'Amount' : 'المبلغ'}</TableHead>
            <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdownItems?.filter(item => !item.parentBreakdownId).map(item => renderBreakdownItem(item))}
        </TableBody>
      </Table>

      <Dialog open={isAddSubItemDialogOpen} onOpenChange={setIsAddSubItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Add Sub-Item' : 'إضافة عنصر فرعي'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Add a new sub-item under the selected breakdown item.' 
                : 'إضافة عنصر فرعي جديد تحت البند المحدد.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-description" className="text-right">
                {language === 'en' ? 'Description (EN)' : 'الوصف (إنجليزي)'}
              </Label>
              <Textarea
                id="sub-description"
                value={newSubItem.description}
                onChange={(e) => setNewSubItem(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-descriptionAr" className="text-right">
                {language === 'en' ? 'Description (AR)' : 'الوصف (عربي)'}
              </Label>
              <Textarea
                id="sub-descriptionAr"
                value={newSubItem.descriptionAr}
                onChange={(e) => setNewSubItem(prev => ({ ...prev, descriptionAr: e.target.value }))}
                className="col-span-3"
                dir="rtl"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-percentage" className="text-right">
                {language === 'en' ? 'Percentage (%)' : 'النسبة المئوية (%)'}
              </Label>
              <div className="col-span-3">
                <Input
                  id="sub-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={newSubItem.percentage}
                  onChange={(e) => setNewSubItem(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedParent && 
                    `Amount will be: ${getBOQItemDetails(selectedParent.boqItemId).unitRate.toLocaleString()} × ${newSubItem.percentage}% = ${((getBOQItemDetails(selectedParent.boqItemId).unitRate * newSubItem.percentage) / 100).toLocaleString()} SAR`
                  }
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddSubItemDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button type="button" onClick={handleSaveSubItem}>
              {language === 'en' ? 'Add Sub-Item' : 'إضافة العنصر الفرعي'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreakdownTable;
