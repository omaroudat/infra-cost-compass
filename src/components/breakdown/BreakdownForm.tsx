
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      if (codeLevel === 5) {
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

  // Find the current BOQ item to show its details
  const currentBOQItem = flattenedBOQItems(boqItems).find(item => item.id === newItem.boqItemId);

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="boqItemDisplay" className="text-right">
          BOQ Item (Level 5)
        </Label>
        <div className="col-span-3">
          <Input
            id="boqItemDisplay"
            value={currentBOQItem ? getBOQItemLabel(currentBOQItem) : ''}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            BOQ item cannot be changed. Breakdown items are automatically created from Level 5 BOQ items.
          </p>
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
          disabled
          className="col-span-3 bg-gray-100"
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
          disabled
          className="col-span-3 bg-gray-100"
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
        <div className="col-span-3">
          <Input
            id="percentage"
            name="percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={newItem.percentage}
            onChange={onInputChange}
          />
          <p className="text-xs text-gray-500 mt-1">
            Value will be automatically calculated as percentage of BOQ unit rate ({currentBOQItem?.unitRate?.toLocaleString('ar-SA')} SAR)
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="value" className="text-right">
          Value (SAR)
        </Label>
        <Input
          id="value"
          name="value"
          type="number"
          value={currentBOQItem && newItem.percentage ? 
            ((currentBOQItem.unitRate * (newItem.percentage || 0)) / 100).toFixed(2) : 
            newItem.value}
          disabled
          className="col-span-3 bg-gray-100"
        />
      </div>
    </div>
  );
};

export default BreakdownForm;
