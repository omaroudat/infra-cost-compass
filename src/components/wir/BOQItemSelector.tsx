
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

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Package className="w-4 h-4" />
        BOQ Item *
      </Label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by code or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isResultSubmission}
        />
      </div>
      
      {/* BOQ Item Dropdown */}
      <Select
        value={selectedItem}
        onValueChange={handleItemSelection}
        disabled={isResultSubmission}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a BOQ item..." />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {filteredItems.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <div className="flex flex-col space-y-1">
                <span className="font-mono text-blue-600 text-sm font-medium">{item.code}</span>
                <span className="text-sm text-gray-700">{item.description}</span>
              </div>
            </SelectItem>
          ))}
          
          {filteredItems.length === 0 && (
            <SelectItem value="" disabled>
              <span className="text-gray-500">
                {searchTerm ? 'No items match your search' : 'No items available'}
              </span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BOQItemSelector;
