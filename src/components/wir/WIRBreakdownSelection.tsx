
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface WIRBreakdownSelectionProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission?: boolean;
}

const WIRBreakdownSelection: React.FC<WIRBreakdownSelectionProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission
}) => {
  const { breakdownItems } = useAppContext();

  // Get breakdown items for the selected BOQ items
  const getRelatedBreakdownItems = () => {
    if (!newWIR.linkedBOQItems || newWIR.linkedBOQItems.length === 0) {
      return [];
    }

    return breakdownItems?.filter(item => 
      newWIR.linkedBOQItems?.includes(item.boqItemId) && 
      item.isLeaf // Only show leaf items (sub-items)
    ) || [];
  };

  const relatedBreakdownItems = getRelatedBreakdownItems();

  const handleBreakdownSelection = (breakdownId: string, checked: boolean) => {
    setNewWIR(prev => {
      const currentSelected = prev.selectedBreakdownItems || [];
      if (checked) {
        return {
          ...prev,
          selectedBreakdownItems: [...currentSelected, breakdownId]
        };
      } else {
        return {
          ...prev,
          selectedBreakdownItems: currentSelected.filter(id => id !== breakdownId)
        };
      }
    });
  };

  if (!newWIR.linkedBOQItems || newWIR.linkedBOQItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Selection</CardTitle>
          <CardDescription>
            Please select BOQ items first to see related breakdown sub-items.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (relatedBreakdownItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Selection</CardTitle>
          <CardDescription>
            No breakdown sub-items found for the selected BOQ items. Please add sub-items to the breakdown first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown Sub-Items Selection</CardTitle>
        <CardDescription>
          Select the breakdown sub-items that apply to this WIR. Only leaf items (sub-items with percentages) can be selected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedBreakdownItems.map(item => (
          <div key={item.id} className="flex items-center space-x-2">
            <Checkbox
              id={`breakdown-${item.id}`}
              checked={newWIR.selectedBreakdownItems?.includes(item.id) || false}
              onCheckedChange={(checked) => handleBreakdownSelection(item.id, checked as boolean)}
              disabled={isResultSubmission}
            />
            <Label htmlFor={`breakdown-${item.id}`} className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <span>{item.description}</span>
                <div className="text-sm text-gray-500">
                  <span className="mr-2">{item.percentage}%</span>
                  <span>{item.value?.toLocaleString('en-US')} SAR</span>
                </div>
              </div>
            </Label>
          </div>
        ))}
        
        {relatedBreakdownItems.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Calculation Formula:</strong> WIR Value × Unit Rate × Breakdown Percentage = Final Amount
            </p>
            <p className="text-xs text-blue-600 mt-1">
              The selected breakdown percentages will be applied to calculate the final WIR amount.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WIRBreakdownSelection;
