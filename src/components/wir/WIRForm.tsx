
import React from 'react';
import { WIR, WIRStatus, WIRResult, BOQItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface WIRFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  editingWIR: string | null;
  flattenedBOQItems: BOQItem[];
  onCancel: () => void;
  onSubmit: () => void;
}

const WIRForm: React.FC<WIRFormProps> = ({
  newWIR,
  setNewWIR,
  editingWIR,
  flattenedBOQItems,
  onCancel,
  onSubmit,
}) => {
  const statusOptions: { value: WIRStatus, label: string, labelAr: string }[] = [
    { value: 'submitted', label: 'Submitted', labelAr: 'مُقدم' },
    { value: 'completed', label: 'Completed', labelAr: 'مكتمل' },
  ];

  const resultOptions: { value: WIRResult, label: string, labelAr: string }[] = [
    { value: 'A', label: 'A - Approved', labelAr: 'أ - موافق' },
    { value: 'B', label: 'B - Conditional Approved', labelAr: 'ب - موافق بشروط' },
    { value: 'C', label: 'C - Rejected', labelAr: 'ج - مرفوض' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = ['lengthOfLine', 'diameterOfLine'];
    setNewWIR(prev => ({ 
      ...prev, 
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value 
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const required = [
      'boqItemId', 'description', 'submittalDate', 'status', 
      'contractor', 'engineer', 'lengthOfLine', 'diameterOfLine', 
      'lineNo', 'region'
    ];
    
    const missing = required.filter(field => !newWIR[field as keyof typeof newWIR]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    onSubmit();
  };

  // Check if this is a result submission (editing an existing submitted WIR)
  const isResultSubmission = editingWIR && newWIR.status === 'submitted';

  return (
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="boqItemId" className="text-right">
          BOQ Item
        </Label>
        <div className="col-span-3">
          <Select
            value={newWIR.boqItemId}
            onValueChange={(value) => handleSelectChange('boqItemId', value)}
            disabled={isResultSubmission}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select BOQ Item" />
            </SelectTrigger>
            <SelectContent>
              {flattenedBOQItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.code} - {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractor" className="text-right">
          Contractor / المقاول
        </Label>
        <Input
          id="contractor"
          name="contractor"
          value={newWIR.contractor || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="engineer" className="text-right">
          Engineer / المهندس
        </Label>
        <Input
          id="engineer"
          name="engineer"
          value={newWIR.engineer || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lengthOfLine" className="text-right">
          Length of Line (m) / طول الخط
        </Label>
        <Input
          id="lengthOfLine"
          name="lengthOfLine"
          type="number"
          value={newWIR.lengthOfLine || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="diameterOfLine" className="text-right">
          Diameter (mm) / القطر
        </Label>
        <Input
          id="diameterOfLine"
          name="diameterOfLine"
          type="number"
          value={newWIR.diameterOfLine || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="lineNo" className="text-right">
          Line No / رقم الخط
        </Label>
        <Input
          id="lineNo"
          name="lineNo"
          value={newWIR.lineNo || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="region" className="text-right">
          Region / المنطقة
        </Label>
        <Input
          id="region"
          name="region"
          value={newWIR.region || ''}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description / الوصف
        </Label>
        <Textarea
          id="description"
          name="description"
          value={newWIR.description}
          onChange={handleInputChange}
          className="col-span-3 min-h-[80px]"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="submittalDate" className="text-right">
          Submittal Date / تاريخ التقديم
        </Label>
        <Input
          id="submittalDate"
          name="submittalDate"
          type="date"
          value={newWIR.submittalDate}
          onChange={handleInputChange}
          className="col-span-3"
          disabled={isResultSubmission}
          required
        />
      </div>
      
      {isResultSubmission && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receivedDate" className="text-right">
              Received Date / تاريخ الاستلام
            </Label>
            <Input
              id="receivedDate"
              name="receivedDate"
              type="date"
              value={newWIR.receivedDate || new Date().toISOString().split('T')[0]}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="result" className="text-right">
              Result / النتيجة
            </Label>
            <div className="col-span-3">
              <Select
                value={newWIR.result}
                onValueChange={(value) => handleSelectChange('result', value as WIRResult)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Result" />
                </SelectTrigger>
                <SelectContent>
                  {resultOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} / {option.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(newWIR.result === 'B') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusConditions" className="text-right">
                Conditions / الشروط
              </Label>
              <Textarea
                id="statusConditions"
                name="statusConditions"
                value={newWIR.statusConditions || ''}
                onChange={handleInputChange}
                className="col-span-3 min-h-[60px]"
              />
            </div>
          )}
        </>
      )}
      
      {!isResultSubmission && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status / الحالة
          </Label>
          <div className="col-span-3">
            <Select
              value={newWIR.status}
              onValueChange={(value) => handleSelectChange('status', value as WIRStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} / {option.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {isResultSubmission ? 'Submit Result' : editingWIR ? 'Save Changes' : 'Add WIR'}
        </Button>
      </div>
    </div>
  );
};

export default WIRForm;
