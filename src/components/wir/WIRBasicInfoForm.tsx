
import React from 'react';
import { WIR, BOQItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import BOQItemSelector from './BOQItemSelector';
import { User, Users, Calendar, DollarSign, FileText } from 'lucide-react';

interface WIRBasicInfoFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  flattenedBOQItems: BOQItem[];
  isResultSubmission: boolean;
  showOnlyBOQ?: boolean;
}

const WIRBasicInfoForm: React.FC<WIRBasicInfoFormProps> = ({
  newWIR,
  setNewWIR,
  flattenedBOQItems,
  isResultSubmission,
  showOnlyBOQ = false,
}) => {
  const { contractors, engineers } = useAppContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWIR(prev => ({ 
      ...prev, 
      [name]: name === 'value' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  const handleBOQItemsChange = (selectedItems: string[]) => {
    setNewWIR(prev => ({ 
      ...prev, 
      linkedBOQItems: selectedItems,
      // Set the first selected item as the main boqItemId for backward compatibility
      boqItemId: selectedItems.length > 0 ? selectedItems[0] : ''
    }));
  };

  if (showOnlyBOQ) {
    return (
      <BOQItemSelector
        flattenedBOQItems={flattenedBOQItems}
        selectedItems={newWIR.linkedBOQItems || []}
        onSelectionChange={handleBOQItemsChange}
        isResultSubmission={isResultSubmission}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Personnel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contractor" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contractor / المقاول *
          </Label>
          <Select
            value={newWIR.contractor || ''}
            onValueChange={(value) => handleSelectChange('contractor', value)}
            disabled={isResultSubmission}
          >
            <SelectTrigger className="w-full h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md">
              <SelectValue placeholder="Select a contractor" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
              {contractors.map((contractor) => (
                <SelectItem key={contractor.id} value={contractor.name} className="hover:bg-purple-50 focus:bg-purple-50 p-3">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-sm">{contractor.name}</span>
                    {contractor.company && (
                      <span className="text-xs text-gray-500">{contractor.company}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="engineer" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Engineer / المهندس *
          </Label>
          <Select
            value={newWIR.engineer || ''}
            onValueChange={(value) => handleSelectChange('engineer', value)}
            disabled={isResultSubmission}
          >
            <SelectTrigger className="w-full h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md">
              <SelectValue placeholder="Select an engineer" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
              {engineers.map((engineer) => (
                <SelectItem key={engineer.id} value={engineer.name} className="hover:bg-purple-50 focus:bg-purple-50 p-3">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-sm">{engineer.name}</span>
                    {engineer.department && (
                      <span className="text-xs text-gray-500">{engineer.department}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial and Date Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="value" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Value / القيمة (SAR) *
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={newWIR.value || 0}
            onChange={handleInputChange}
            className="w-full h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
            disabled={isResultSubmission}
            required
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="submittalDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Submittal Date / تاريخ التقديم *
          </Label>
          <Input
            id="submittalDate"
            name="submittalDate"
            type="date"
            value={newWIR.submittalDate}
            onChange={handleInputChange}
            className="w-full h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
            disabled={isResultSubmission}
            required
          />
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description / الوصف *
        </Label>
        <Textarea
          id="description"
          name="description"
          value={newWIR.description}
          onChange={handleInputChange}
          className="w-full min-h-[100px] resize-vertical border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-md"
          disabled={isResultSubmission}
          required
          placeholder="Provide detailed description of the work inspection..."
        />
      </div>
    </div>
  );
};

export default WIRBasicInfoForm;
