
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FileText, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { exportInvoiceToPDF } from '../utils/invoiceExport';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Invoices = () => {
  const { wirs, boqItems } = useAppContext();
  const { t, language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<'monthly' | 'daily'>('monthly');
  
  const { 
    getMonthlyInvoiceData, 
    getDailyInvoiceData, 
    getAvailableMonths, 
    getAvailableDates 
  } = useInvoiceCalculations(wirs, boqItems);
  
  const availableMonths = getAvailableMonths();
  const availableDates = getAvailableDates();
  const monthlyInvoiceData = getMonthlyInvoiceData(selectedMonth);
  const dailyInvoiceData = selectedDate ? getDailyInvoiceData(format(selectedDate, 'yyyy-MM-dd')) : null;
  
  const currentInvoiceData = activeTab === 'monthly' ? monthlyInvoiceData : dailyInvoiceData;
  
  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const handleExportPDF = () => {
    if (!currentInvoiceData) return;
    
    // Use the new logo for invoice exports
    const logoUrl = '/lovable-uploads/454de6d4-afed-4b33-b065-ade01eb9065a.png';
    const period = activeTab === 'monthly' ? selectedMonth : (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
    exportInvoiceToPDF(currentInvoiceData, period, language, logoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'en' ? 'Invoices' : 'الفواتير'}
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'monthly' | 'daily')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">
            {language === 'en' ? 'Monthly View' : 'عرض شهري'}
          </TabsTrigger>
          <TabsTrigger value="daily">
            {language === 'en' ? 'Daily View' : 'عرض يومي'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {new Date(month + '-01').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleExportPDF} disabled={!monthlyInvoiceData}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Export PDF' : 'تصدير PDF'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>{language === 'en' ? 'Pick a date' : 'اختر تاريخ'}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => 
                    !availableDates.includes(format(date, 'yyyy-MM-dd'))
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleExportPDF} disabled={!dailyInvoiceData}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Export PDF' : 'تصدير PDF'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {currentInvoiceData ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <CardTitle>
                {language === 'en' ? 'Invoice' : 'الفاتورة'} - {
                  activeTab === 'monthly' 
                    ? new Date(selectedMonth + '-01').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long'
                      })
                    : selectedDate?.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                }
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en' 
                ? `${activeTab === 'monthly' ? 'Monthly' : 'Daily'} progress invoice based on approved WIRs`
                : `فاتورة التقدم ${activeTab === 'monthly' ? 'الشهرية' : 'اليومية'} بناءً على تقارير العمل المعتمدة`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">
                  {language === 'en' ? 'Previous Amount' : 'المبلغ السابق'}
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {formatter.format(currentInvoiceData.previousAmount)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {language === 'en' 
                    ? `Cumulative up to previous ${activeTab === 'monthly' ? 'month' : 'day'}`
                    : `المجموع التراكمي حتى ${activeTab === 'monthly' ? 'الشهر السابق' : 'اليوم السابق'}`}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">
                  {language === 'en' 
                    ? `Current ${activeTab === 'monthly' ? 'Month' : 'Day'} Amount`
                    : `مبلغ ${activeTab === 'monthly' ? 'الشهر الحالي' : 'اليوم الحالي'}`}
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  {formatter.format(currentInvoiceData.currentAmount)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {language === 'en' 
                    ? `Approved amount this ${activeTab === 'monthly' ? 'month' : 'day'}`
                    : `المبلغ المعتمد ${activeTab === 'monthly' ? 'هذا الشهر' : 'هذا اليوم'}`}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">
                  {language === 'en' ? 'Cumulative Total' : 'المجموع التراكمي'}
                </h3>
                <p className="text-2xl font-bold text-amber-900">
                  {formatter.format(currentInvoiceData.previousAmount + currentInvoiceData.currentAmount)}
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  {language === 'en' ? 'Total amount to date' : 'إجمالي المبلغ حتى التاريخ'}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">
                  {language === 'en' ? 'Total BOQ Amount' : 'إجمالي مبلغ جدول الكميات'}
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {formatter.format(currentInvoiceData.totalBOQAmount)}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  {language === 'en' ? 'Total project value' : 'إجمالي قيمة المشروع'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {language === 'en' ? 'Invoice Summary' : 'ملخص الفاتورة'}
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Previous Amount:' : 'المبلغ السابق:'}</span>
                  <span className="font-medium">{formatter.format(currentInvoiceData.previousAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' 
                    ? `Current ${activeTab === 'monthly' ? 'Month:' : 'Day:'}`
                    : `${activeTab === 'monthly' ? 'الشهر الحالي:' : 'اليوم الحالي:'}`}</span>
                  <span className="font-medium">{formatter.format(currentInvoiceData.currentAmount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>{language === 'en' ? 'Cumulative Total:' : 'المجموع التراكمي:'}</span>
                  <span>{formatter.format(currentInvoiceData.previousAmount + currentInvoiceData.currentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{language === 'en' ? 'Progress:' : 'نسبة الإنجاز:'}</span>
                  <span>
                    {currentInvoiceData.totalBOQAmount > 0 
                      ? (((currentInvoiceData.previousAmount + currentInvoiceData.currentAmount) / currentInvoiceData.totalBOQAmount) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {language === 'en' 
                ? `No approved WIRs found for the selected ${activeTab === 'monthly' ? 'month' : 'date'}`
                : `لم يتم العثور على تقارير عمل معتمدة ${activeTab === 'monthly' ? 'للشهر المحدد' : 'للتاريخ المحدد'}`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
