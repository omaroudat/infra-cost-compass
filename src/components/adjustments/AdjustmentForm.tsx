
import React from 'react';
import { PercentageAdjustment } from '@/types';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdjustmentFormProps {
  adjustment: Partial<PercentageAdjustment>;
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AdjustmentForm = ({
  adjustment,
  isEditing,
  onInputChange,
  onSave,
  onCancel
}: AdjustmentFormProps) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit' : 'Add'} Percentage Adjustment</DialogTitle>
        <DialogDescription>
          Define keywords and their associated percentage adjustments.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="keyword" className="text-right">
            Keyword
          </Label>
          <Input
            id="keyword"
            name="keyword"
            value={adjustment.keyword}
            onChange={onInputChange}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            name="description"
            value={adjustment.description}
            onChange={onInputChange}
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
            value={adjustment.value || ''}
            onChange={onInputChange}
            className="col-span-3"
            required
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
            value={adjustment.percentage ? adjustment.percentage * 100 : ''}
            onChange={onInputChange}
            className="col-span-3"
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave}>
          {isEditing ? 'Save Changes' : 'Add Adjustment'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AdjustmentForm;
