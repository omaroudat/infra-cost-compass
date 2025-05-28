
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { exportInvoiceToPDF } from '../utils/invoiceExport';

const Invoices = () => {
  const { wirs, boqItems } = useAppContext();
  const { t, language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  
  const { getMonthlyInvoiceData, getAvailableMonths } = useInvoiceCalculations(wirs, boqItems);
  const availableMonths = getAvailableMonths();
  const invoiceData = getMonthlyInvoiceData(selectedMonth);
  
  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const handleExportPDF = () => {
    exportInvoiceToPDF(invoiceData, selectedMonth, language);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'en' ? 'Monthly Invoices' : 'الفواتير الشهرية'}
        </h2>
      </div>

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
        
        <Button onClick={handleExportPDF} disabled={!invoiceData}>
          <Download className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Export PDF' : 'تصدير PDF'}
        </Button>
      </div>

      {invoiceData ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <CardTitle>
                {language === 'en' ? 'Invoice' : 'الفاتورة'} - {new Date(selectedMonth + '-01').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en' 
                ? 'Monthly progress invoice based on approved WIRs'
                : 'فاتورة التقدم الشهرية بناءً على تقارير العمل المعتمدة'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  {language === 'en' ? 'Previous Amount' : 'المبلغ السابق'}
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {formatter.format(invoiceData.previousAmount)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {language === 'en' ? 'Cumulative up to previous month' : 'المجموع التراكمي حتى الشهر السابق'}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  {language === 'en' ? 'Current Month Amount' : 'مبلغ الشهر الحالي'}
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  {formatter.format(invoiceData.currentAmount)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {language === 'en' ? 'Approved amount this month' : 'المبلغ المعتمد هذا الشهر'}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">
                  {language === 'en' ? 'Total BOQ Amount' : 'إجمالي مبلغ جدول الكميات'}
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  {formatter.format(invoiceData.totalBOQAmount)}
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
                  <span className="font-medium">{formatter.format(invoiceData.previousAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Current Month:' : 'الشهر الحالي:'}</span>
                  <span className="font-medium">{formatter.format(invoiceData.currentAmount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>{language === 'en' ? 'Cumulative Total:' : 'المجموع التراكمي:'}</span>
                  <span>{formatter.format(invoiceData.previousAmount + invoiceData.currentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{language === 'en' ? 'Progress:' : 'نسبة الإنجاز:'}</span>
                  <span>
                    {invoiceData.totalBOQAmount > 0 
                      ? (((invoiceData.previousAmount + invoiceData.currentAmount) / invoiceData.totalBOQAmount) * 100).toFixed(1)
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
                ? 'No approved WIRs found for the selected month'
                : 'لم يتم العثور على تقارير عمل معتمدة للشهر المحدد'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;
