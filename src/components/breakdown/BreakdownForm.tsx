
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreakdownItem, BOQItem } from '../../types';

interface BreakdownFormProps {
  newItem: Partial<BreakdownItem>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  boqItems: BOQItem[];
}

const BreakdownForm: React.FC<BreakdownFormProps> = ({
  newItem,
  onInputChange,
  onSelectChange,
  boqItems
}) => {
  const flattenedBOQItems = (items: BOQItem[]): BOQItem[] => {
    const result: BOQItem[] = [];
    items.forEach(item => {
      const codeLevel = (item.code.match(/\./g) || []).length + 1;
      if (codeLevel === 6) {
        result.push(item);
      }
      if (item.children && item.children.length > 0) {
        result.push(...flattenedBOQItems(item.children));
      }
    });
    return result;
  };

  const getBOQItemLabel = (item: BOQItem) => {
    return `${item.code} - ${item.description}`;
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="boqItemId" className="text-right">
          BOQ Item (Level 6)
        </Label>
        <div className="col-span-3">
          <Select
            value={newItem.boqItemId}
            onValueChange={(value) => onSelectChange('boqItemId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Level 6 BOQ Item" />
            </SelectTrigger>
            <SelectContent>
              {flattenedBOQItems(boqItems).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {getBOQItemLabel(item)}
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
          onChange={onInputChange}
          className="col-span-3"
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          className="col-span-3"
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          className="col-span-3"
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
          onChange={onInputChange}
          className="col-span-3"
        />
      </div>
    </div>
  );
};

export default BreakdownForm;
