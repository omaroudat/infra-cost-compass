
import React, { useState, useMemo } from 'react';
import { BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package } from 'lucide-react';

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
    <div className="space-y-3">
      <div className="space-y-2">
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
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isResultSubmission}
          />
        </div>
        
        {/* BOQ Item Dropdown */}
        <Select
          value={selectedItem}
          onValueChange={handleItemSelection}
          disabled={isResultSubmission}
        >
          <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select a BOQ item..." />
          </SelectTrigger>
          <SelectContent className="max-h-64 bg-white border border-gray-200 shadow-lg">
            {filteredItems.map((item) => (
              <SelectItem key={item.id} value={item.id} className="hover:bg-blue-50">
                <div className="flex flex-col py-1">
                  <span className="font-mono text-blue-600 text-sm font-medium">{item.code}</span>
                  <span className="text-sm text-gray-700 leading-tight">{item.description}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Qty: {item.quantity} {item.unit} | Rate: {item.unitRate?.toLocaleString('en-US')} SAR
                  </span>
                </div>
              </SelectItem>
            ))}
            
            {filteredItems.length === 0 && (
              <SelectItem value="" disabled>
                {searchTerm ? 'No items match your search' : 'No leaf items with quantities available'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Selected Item Display */}
      {selectedBOQItem && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Selected BOQ Item:</span>
            </div>
            <div className="ml-6 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Code:</span>
                <span className="font-mono text-blue-600 font-medium">{selectedBOQItem.code}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-gray-600 min-w-fit">Description:</span>
                <span className="text-gray-900">{selectedBOQItem.description}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Quantity: <span className="font-medium">{selectedBOQItem.quantity} {selectedBOQItem.unit}</span></span>
                <span>Unit Rate: <span className="font-medium">{selectedBOQItem.unitRate?.toLocaleString('en-US')} SAR</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOQItemSelector;
