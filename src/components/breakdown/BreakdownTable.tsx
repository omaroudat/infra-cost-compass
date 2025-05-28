
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
      const codeLevel = (item.code.match(/\./g) || []).length + 1;
      if (codeLevel === 5) {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  const getBOQItemLabel = (id: string) => {
    const item = flattenedBOQItems(boqItems).find(item => item.id === id);
    if (!item) return 'Unknown';
    const desc = language === 'en' ? item.description : (item.descriptionAr || item.description);
    return `${item.code} - ${desc}`;
  };

  const getBOQItemUnitRate = (id: string) => {
    const item = flattenedBOQItems(boqItems).find(item => item.id === id);
    return item?.unitRate || 0;
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

  const handleSaveSubItem = () => {
    if (!selectedParent || !onAddSubItem) return;
    
    if (!newSubItem.description || newSubItem.percentage <= 0) {
      toast.error('Please fill in description and percentage.');
      return;
    }

    const unitRate = getBOQItemUnitRate(selectedParent.boqItemId);
    const subItemData = {
      keyword: `${selectedParent.keyword}-${Date.now()}`,
      keywordAr: `${selectedParent.keywordAr}-${Date.now()}`,
      description: newSubItem.description,
      descriptionAr: newSubItem.descriptionAr,
      percentage: newSubItem.percentage,
      value: (unitRate * newSubItem.percentage) / 100,
      boqItemId: selectedParent.boqItemId,
      parentBreakdownId: selectedParent.id,
      unitRate: unitRate,
      quantity: (newSubItem.percentage / 100), // Convert percentage to quantity ratio
      isLeaf: true
    };

    onAddSubItem(selectedParent.id, subItemData);
    setIsAddSubItemDialogOpen(false);
    setSelectedParent(null);
    toast.success('Sub-item added successfully.');
  };

  const handleDeleteClick = () => {
    toast.info('Breakdown items cannot be deleted. They are automatically managed based on BOQ items.');
  };

  // Always use English number formatting
  const numberFormatter = new Intl.NumberFormat('en-US');

  const renderBreakdownItem = (item: BreakdownItem, level: number = 0) => {
    const indentLevel = level * 20;
    const isParent = item.children && item.children.length > 0;
    
    return (
      <React.Fragment key={item.id}>
        <TableRow className={level > 0 ? 'bg-gray-50' : ''}>
          <TableCell className="font-mono text-sm" style={{ paddingLeft: `${indentLevel + 16}px` }}>
            {getBOQItemLabel(item.boqItemId)}
          </TableCell>
          <TableCell className="text-sm">
            <div className={language === 'ar' ? 'text-right' : ''}>
              {language === 'en' ? item.description : (item.descriptionAr || item.description)}
            </div>
          </TableCell>
          <TableCell className="text-sm">
            {numberFormatter.format(getBOQItemUnitRate(item.boqItemId))}
          </TableCell>
          <TableCell>
            {level > 0 ? `${item.percentage}%` : '-'}
          </TableCell>
          <TableCell>
            {item.quantity ? numberFormatter.format(item.quantity) : (isParent ? '-' : '1')}
          </TableCell>
          <TableCell>
            {level > 0 && item.value ? numberFormatter.format(item.value) : '-'}
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
                    `Amount will be: ${getBOQItemUnitRate(selectedParent.boqItemId).toLocaleString()} × ${newSubItem.percentage}% = ${((getBOQItemUnitRate(selectedParent.boqItemId) * newSubItem.percentage) / 100).toLocaleString()} SAR`
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
