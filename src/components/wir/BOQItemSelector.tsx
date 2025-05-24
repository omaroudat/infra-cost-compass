
import React, { useState, useMemo } from 'react';
import { BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Filter to only show leaf nodes (items without children)
  const leafItems = useMemo(() => {
    return flattenedBOQItems.filter(item => !item.children || item.children.length === 0);
  }, [flattenedBOQItems]);

  // Filter items based on search term (code or description)
  const filteredItems = useMemo(() => {
    if (!searchTerm) return leafItems;
    
    return leafItems.filter(item => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leafItems, searchTerm]);

  const handleItemToggle = (itemId: string) => {
    if (isResultSubmission) return;
    
    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">BOQ Items</Label>
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
          
          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {selectedItems.length} item(s)
            </div>
          )}
          
          {/* Items List */}
          <ScrollArea className="h-48 border rounded-md p-3">
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                    disabled={isResultSubmission}
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    <span className="font-mono text-blue-600">{item.code}</span>
                    <span className="ml-2">{item.description}</span>
                  </label>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  {searchTerm ? 'No items match your search' : 'No leaf items available'}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default BOQItemSelector;
