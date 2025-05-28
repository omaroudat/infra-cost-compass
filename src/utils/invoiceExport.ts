
import { MonthlyInvoiceData } from '@/hooks/useInvoiceCalculations';

export const exportInvoiceToPDF = (
  invoiceData: MonthlyInvoiceData,
  month: string,
  language: 'en' | 'ar'
) => {
  const monthName = new Date(month + '-01').toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long' }
  );

  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${language === 'en' ? 'Invoice' : 'الفاتورة'} - ${monthName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${language === 'ar' ? 'Tahoma, Arial' : 'Arial, sans-serif'};
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 20px;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .invoice-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .logo-section {
          margin-bottom: 20px;
        }
        
        .logo-placeholder {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .invoice-title {
          font-size: 24px;
          font-weight: 300;
          margin-bottom: 5px;
        }
        
        .invoice-period {
          font-size: 18px;
          opacity: 0.9;
        }
        
        .invoice-body {
          padding: 40px;
        }
        
        .invoice-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .info-section h3 {
          color: #667eea;
          font-size: 16px;
          margin-bottom: 15px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 5px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 600;
          color: #555;
        }
        
        .info-value {
          font-weight: bold;
          color: #333;
        }
        
        .amounts-section {
          background: #f8f9ff;
          border-radius: 8px;
          padding: 30px;
          margin: 30px 0;
        }
        
        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 16px;
        }
        
        .amount-row:last-child {
          border-bottom: none;
          border-top: 2px solid #667eea;
          margin-top: 15px;
          padding-top: 20px;
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
        }
        
        .amount-label {
          font-weight: 600;
        }
        
        .amount-value {
          font-weight: bold;
          font-size: 18px;
        }
        
        .progress-section {
          margin-top: 30px;
          text-align: center;
          padding: 20px;
          background: #f0f4ff;
          border-radius: 8px;
        }
        
        .progress-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .progress-percentage {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
        }
        
        .invoice-footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #ddd;
        }
        
        .footer-text {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .invoice-container {
            border: none;
            border-radius: 0;
            box-shadow: none;
          }
        }
        
        ${language === 'ar' ? `
          .amount-row {
            flex-direction: row-reverse;
          }
          
          .info-item {
            flex-direction: row-reverse;
          }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="logo-section">
            <div class="logo-placeholder">LOGO</div>
            <div class="company-name">${language === 'en' ? 'Construction Company' : 'شركة الإنشاءات'}</div>
          </div>
          <div class="invoice-title">${language === 'en' ? 'Monthly Progress Invoice' : 'فاتورة التقدم الشهرية'}</div>
          <div class="invoice-period">${monthName}</div>
        </div>
        
        <div class="invoice-body">
          <div class="invoice-info">
            <div class="info-section">
              <h3>${language === 'en' ? 'Invoice Details' : 'تفاصيل الفاتورة'}</h3>
              <div class="info-item">
                <span class="info-label">${language === 'en' ? 'Invoice Period:' : 'فترة الفاتورة:'}</span>
                <span class="info-value">${monthName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${language === 'en' ? 'Invoice Date:' : 'تاريخ الفاتورة:'}</span>
                <span class="info-value">${new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${language === 'en' ? 'Approved WIRs:' : 'تقارير العمل المعتمدة:'}</span>
                <span class="info-value">${invoiceData.approvedWIRs.length}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>${language === 'en' ? 'Project Information' : 'معلومات المشروع'}</h3>
              <div class="info-item">
                <span class="info-label">${language === 'en' ? 'Total Project Value:' : 'قيمة المشروع الإجمالية:'}</span>
                <span class="info-value">${formatter.format(invoiceData.totalBOQAmount)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${language === 'en' ? 'Currency:' : 'العملة:'}</span>
                <span class="info-value">${language === 'en' ? 'Saudi Riyal (SAR)' : 'الريال السعودي'}</span>
              </div>
            </div>
          </div>
          
          <div class="amounts-section">
            <div class="amount-row">
              <span class="amount-label">${language === 'en' ? 'Previous Amount (Cumulative):' : 'المبلغ السابق (تراكمي):'}</span>
              <span class="amount-value">${formatter.format(invoiceData.previousAmount)}</span>
            </div>
            
            <div class="amount-row">
              <span class="amount-label">${language === 'en' ? 'Current Month Amount:' : 'مبلغ الشهر الحالي:'}</span>
              <span class="amount-value">${formatter.format(invoiceData.currentAmount)}</span>
            </div>
            
            <div class="amount-row">
              <span class="amount-label">${language === 'en' ? 'Total Cumulative Amount:' : 'إجمالي المبلغ التراكمي:'}</span>
              <span class="amount-value">${formatter.format(invoiceData.previousAmount + invoiceData.currentAmount)}</span>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-label">${language === 'en' ? 'Project Completion Progress' : 'نسبة إنجاز المشروع'}</div>
            <div class="progress-percentage">
              ${invoiceData.totalBOQAmount > 0 
                ? (((invoiceData.previousAmount + invoiceData.currentAmount) / invoiceData.totalBOQAmount) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
        </div>
        
        <div class="invoice-footer">
          <div class="footer-text">
            ${language === 'en' 
              ? 'This invoice is generated automatically based on approved Work Inspection Reports (WIRs).<br>For any questions, please contact the project management office.'
              : 'تم إنشاء هذه الفاتورة تلقائياً بناءً على تقارير فحص العمل المعتمدة.<br>لأي استفسارات، يرجى التواصل مع مكتب إدارة المشروع.'}
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
