
import React from 'react';
import { WIR, WIRStatus, WIRResult } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WIRResultFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission: boolean;
}

const WIRResultForm: React.FC<WIRResultFormProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission,
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
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewWIR(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
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
    </>
  );
};

export default WIRResultForm;
