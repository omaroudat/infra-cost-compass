
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BreakdownItem, BOQItem } from '../../types';
import { toast } from 'sonner';

interface BreakdownTableProps {
  breakdownItems: BreakdownItem[];
  boqItems: BOQItem[];
  language: 'en' | 'ar';
  onEdit: (item: BreakdownItem) => void;
  onDelete: (id: string) => void;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({
  breakdownItems,
  boqItems,
  language,
  onEdit,
  onDelete
}) => {
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

  const handleDeleteClick = () => {
    toast.info('Breakdown items cannot be deleted. They are automatically managed based on BOQ items.');
  };

  // Always use English number formatting
  const numberFormatter = new Intl.NumberFormat('en-US');

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{language === 'en' ? 'BOQ Item' : 'بند الكميات'}</TableHead>
            <TableHead>{language === 'en' ? 'BOQ Unit Rate' : 'السعر الافرادي'}</TableHead>
            <TableHead>{language === 'en' ? 'Description' : 'الوصف'}</TableHead>
            <TableHead>{language === 'en' ? 'Percentage' : 'النسبة المئوية'}</TableHead>
            <TableHead className="text-right">{language === 'en' ? 'Actions' : 'الإجراءات'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdownItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-sm">
                {getBOQItemLabel(item.boqItemId)}
              </TableCell>
              <TableCell className="text-sm">
                {numberFormatter.format(getBOQItemUnitRate(item.boqItemId))}
              </TableCell>
              <TableCell>
                {language === 'en' ? item.description : (item.descriptionAr || item.description)}
              </TableCell>
              <TableCell>{item.percentage}%</TableCell>
              <TableCell className="text-right">
                <div className="flex space-x-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    {language === 'en' ? 'Edit' : 'تعديل'}
                  </Button>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BreakdownTable;
