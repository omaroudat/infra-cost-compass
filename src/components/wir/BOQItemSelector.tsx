
import React, { useState, useMemo } from 'react';
import { BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, CheckCircle } from 'lucide-react';

interface BOQItemSelectorProps {
  flattenedBOQItems: BOQItem[];
  selectedItems: string[];
  onSelectionChange: (selectedItems: string[]) => void;
  isResultSubmission?: boolean;
}

const BOQItemSelector: React.FC<BOQItemSelectorProps> = ({
  flattenedBOQItems,
  selectedItems,
  onSelectionChange,
  isResultSubmission = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search term (code or description)
  const filteredItems = useMemo(() => {
    if (!searchTerm) return flattenedBOQItems;
    
    return flattenedBOQItems.filter(item => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [flattenedBOQItems, searchTerm]);

  const handleItemSelection = (itemId: string) => {
    if (isResultSubmission) return;
    
    // Single selection - replace the current selection
    onSelectionChange([itemId]);
  };

  const selectedItem = selectedItems.length > 0 ? selectedItems[0] : '';
  const selectedBOQItem = flattenedBOQItems.find(item => item.id === selectedItem);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Package className="w-4 h-4" />
          BOQ Item (Leaf with Quantity) *
        </Label>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            disabled={isResultSubmission}
          />
        </div>
        
        {/* BOQ Item Dropdown */}
        <Select
          value={selectedItem}
          onValueChange={handleItemSelection}
          disabled={isResultSubmission}
        >
          <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md">
            <SelectValue placeholder="Select a BOQ item..." />
          </SelectTrigger>
          <SelectContent className="max-h-80 bg-white border border-gray-200 shadow-lg rounded-md z-50">
            {filteredItems.map((item) => (
              <SelectItem key={item.id} value={item.id} className="hover:bg-blue-50 focus:bg-blue-50 p-3">
                <div className="flex flex-col space-y-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-600 text-sm font-medium">{item.code}</span>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{item.description}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Qty: <span className="font-medium">{item.quantity} {item.unit}</span></span>
                    <span>Rate: <span className="font-medium">{item.unitRate?.toLocaleString('en-US')} SAR</span></span>
                  </div>
                </div>
              </SelectItem>
            ))}
            
            {filteredItems.length === 0 && (
              <SelectItem value="" disabled className="p-3">
                <span className="text-gray-500">
                  {searchTerm ? 'No items match your search' : 'No leaf items with quantities available'}
                </span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Selected Item Display */}
      {selectedBOQItem && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800 text-sm">Selected BOQ Item</span>
          </div>
          <div className="space-y-2 ml-6">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600 text-sm min-w-20">Code:</span>
                <span className="font-mono text-blue-600 font-medium text-sm">{selectedBOQItem.code}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 text-sm min-w-20">Description:</span>
                <span className="text-gray-900 text-sm leading-relaxed">{selectedBOQItem.description}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-600 mt-2">
                <span>Quantity: <span className="font-medium text-gray-800">{selectedBOQItem.quantity} {selectedBOQItem.unit}</span></span>
                <span>Unit Rate: <span className="font-medium text-gray-800">{selectedBOQItem.unitRate?.toLocaleString('en-US')} SAR</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOQItemSelector;
