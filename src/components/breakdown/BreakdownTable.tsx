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

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success('Break-down item deleted successfully.');
  };

  return (
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
              <TableCell>{item.value?.toLocaleString('ar-SA')}</TableCell>
              <TableCell className="text-right">
                <div className="flex space-x-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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
  );
};

export default BreakdownTable;
