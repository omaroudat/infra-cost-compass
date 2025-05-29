
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Settings, Calculator, Info } from 'lucide-react';

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
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">BOQ Item Required</p>
        <p className="text-xs text-gray-500">Please select BOQ items first to see related breakdown sub-items.</p>
      </div>
    );
  }

  if (relatedBreakdownItems.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 font-medium">No Breakdown Items Available</p>
        <p className="text-xs text-gray-500">No breakdown sub-items found for the selected BOQ items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-emerald-600" />
        <Label className="text-sm font-medium text-gray-700">
          Available Breakdown Sub-Items
        </Label>
      </div>
      
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
        {relatedBreakdownItems.map(item => (
          <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-emerald-50 transition-colors">
            <Checkbox
              id={`breakdown-${item.id}`}
              checked={newWIR.selectedBreakdownItems?.includes(item.id) || false}
              onCheckedChange={(checked) => handleBreakdownSelection(item.id, checked as boolean)}
              disabled={isResultSubmission}
              className="mt-1 border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <Label htmlFor={`breakdown-${item.id}`} className="flex-1 cursor-pointer">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">{item.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{item.percentage}%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{item.value?.toLocaleString('en-US')} SAR</span>
                  </span>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </div>
      
      {/* Calculation Info */}
      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-emerald-800 font-medium mb-1">Calculation Formula</p>
            <p className="text-emerald-700 text-xs">
              WIR Value × Unit Rate × Breakdown Percentage = Final Amount
            </p>
            <p className="text-emerald-600 text-xs mt-1">
              Selected breakdown percentages will be applied to calculate the final WIR amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WIRBreakdownSelection;
