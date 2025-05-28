
import React, { useState, useMemo } from 'react';
import { BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

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

  // Filter to only show Level 5 items (items with 4 dots in code = level 5)
  const level5Items = useMemo(() => {
    return flattenedBOQItems.filter(item => {
      const codeLevel = (item.code.match(/\./g) || []).length + 1;
      return codeLevel === 5;
    });
  }, [flattenedBOQItems]);

  // Filter items based on search term (code or description)
  const filteredItems = useMemo(() => {
    if (!searchTerm) return level5Items;
    
    return level5Items.filter(item => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [level5Items, searchTerm]);

  const handleItemSelection = (itemId: string) => {
    if (isResultSubmission) return;
    
    // Single selection - replace the current selection
    onSelectionChange([itemId]);
  };

  const selectedItem = selectedItems.length > 0 ? selectedItems[0] : '';
  const selectedBOQItem = level5Items.find(item => item.id === selectedItem);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">BOQ Item (Level 5)</Label>
        <div className="col-span-3 space-y-3">
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
            <SelectTrigger>
              <SelectValue placeholder="Select a BOQ item..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {filteredItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex flex-col">
                    <span className="font-mono text-blue-600 text-sm">{item.code}</span>
                    <span className="text-sm text-gray-700">{item.description}</span>
                  </div>
                </SelectItem>
              ))}
              
              {filteredItems.length === 0 && (
                <SelectItem value="" disabled>
                  {searchTerm ? 'No Level 5 items match your search' : 'No Level 5 items available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* Selected Item Display */}
          {selectedBOQItem && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="text-sm">
                <span className="font-medium">Selected: </span>
                <span className="font-mono text-blue-600">{selectedBOQItem.code}</span>
                <span className="ml-2">{selectedBOQItem.description}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BOQItemSelector;
