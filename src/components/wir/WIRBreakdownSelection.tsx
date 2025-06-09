
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WIR } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Settings, Info, CheckCircle, Eye } from 'lucide-react';

interface WIRBreakdownSelectionProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission?: boolean;
  isViewOnly?: boolean;
}

const WIRBreakdownSelection: React.FC<WIRBreakdownSelectionProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission = false,
  isViewOnly = false
}) => {
  const { breakdownItems } = useAppContext();

  // Get breakdown items for the selected BOQ items - only sub-items (leaf items)
  const getRelatedBreakdownSubItems = () => {
    if (!newWIR.linkedBOQItems || newWIR.linkedBOQItems.length === 0) {
      return [];
    }

    return breakdownItems?.filter(item => 
      newWIR.linkedBOQItems?.includes(item.boqItemId) && 
      item.isLeaf && // Only show leaf items (sub-items)
      item.parentBreakdownId // Only show items that have a parent (are sub-items)
    ) || [];
  };

  const relatedBreakdownSubItems = getRelatedBreakdownSubItems();

  const handleBreakdownSelection = (breakdownId: string, checked: boolean) => {
    if (isViewOnly) return;
    
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
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-gray-200">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">BOQ Item Required</p>
        <p className="text-xs text-gray-500 mt-1">Please select BOQ items first to see related breakdown sub-items.</p>
      </div>
    );
  }

  if (relatedBreakdownSubItems.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-gray-200">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 font-medium">No Breakdown Sub-Items Available</p>
        <p className="text-xs text-gray-500 mt-1">No breakdown sub-items found for the selected BOQ items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {isViewOnly ? (
          <Eye className="w-4 h-4 text-blue-600" />
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        )}
        <Label className="text-sm font-medium text-gray-700">
          {isViewOnly ? 'Selected Breakdown Sub-Items' : 'Available Breakdown Sub-Items'}
        </Label>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {relatedBreakdownSubItems.map(item => {
          const isSelected = newWIR.selectedBreakdownItems?.includes(item.id) || false;
          
          // In view-only mode, only show selected items
          if (isViewOnly && !isSelected) {
            return null;
          }
          
          return (
            <div key={item.id} className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all duration-200 ${
              isViewOnly 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
            }`}>
              <Checkbox
                id={`breakdown-${item.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => handleBreakdownSelection(item.id, checked as boolean)}
                disabled={isResultSubmission || isViewOnly}
                className={`mt-1 ${
                  isViewOnly 
                    ? 'border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                    : 'border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
                }`}
              />
              <Label htmlFor={`breakdown-${item.id}`} className={`flex-1 ${isViewOnly ? '' : 'cursor-pointer'}`}>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900 leading-relaxed">{item.description}</div>
                  <div className="flex items-center gap-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className={`font-medium ${isViewOnly ? 'text-blue-700' : 'text-emerald-700'}`}>
                        {item.percentage}%
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`font-medium ${isViewOnly ? 'text-blue-700' : 'text-emerald-700'}`}>
                        {item.value?.toLocaleString('en-US')} SAR
                      </span>
                    </span>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
        
        {isViewOnly && relatedBreakdownSubItems.filter(item => 
          newWIR.selectedBreakdownItems?.includes(item.id)
        ).length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No breakdown sub-items were selected for this WIR.
          </div>
        )}
      </div>
      
      {/* Calculation Info - only show if not view-only */}
      {!isViewOnly && (
        <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-emerald-800 font-semibold mb-2">Calculation Formula</p>
              <p className="text-emerald-700 text-sm mb-1">
                WIR Value × Unit Rate × Breakdown Percentage = Final Amount
              </p>
              <p className="text-emerald-600 text-xs">
                Selected breakdown percentages will be applied to calculate the final WIR amount.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WIRBreakdownSelection;
