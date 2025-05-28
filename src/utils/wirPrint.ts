
import { WIR, BOQItem } from '@/types';

export const printWIR = (wir: WIR, flattenedBOQItems: BOQItem[]) => {
  // Get BOQ item details
  const selectedBOQItem = flattenedBOQItems.find(item => item.id === wir.boqItemId);
  
  const getStatusColor = () => {
    switch (wir.status) {
      case 'submitted': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getResultColor = () => {
    switch (wir.result) {
      case 'A': return '#10B981';
      case 'B': return '#F59E0B';
      case 'C': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Inspection Request - ${wir.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
          border-bottom: 4px solid #3B82F6;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        
        .header h1 {
          font-size: 28px;
          color: #1F2937;
          margin-bottom: 5px;
        }
        
        .header h2 {
          font-size: 18px;
          color: #6B7280;
        }
        
        .wir-id {
          text-align: right;
        }
        
        .wir-id .label {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 5px;
        }
        
        .wir-id .id {
          font-size: 20px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 10px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
        }
        
        .info-section.project { border-left-color: #3B82F6; }
        .info-section.boq { border-left-color: #10B981; }
        .info-section.timeline { border-left-color: #8B5CF6; }
        .info-section.calculation { border-left-color: #F59E0B; }
        
        .info-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1F2937;
          display: flex;
          align-items: center;
        }
        
        .info-section h3::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .project h3::before { background: #3B82F6; }
        .boq h3::before { background: #10B981; }
        .timeline h3::before { background: #8B5CF6; }
        .calculation h3::before { background: #F59E0B; }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .info-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .info-label {
          font-weight: 600;
          color: #4B5563;
        }
        
        .info-value {
          color: #1F2937;
          font-weight: 500;
          text-align: right;
        }
        
        .description-section {
          background: #F3F4F6;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .description-section h3 {
          font-size: 16px;
          color: #1F2937;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        
        .description-section h3::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #6B7280;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .description-text {
          color: #374151;
          line-height: 1.7;
        }
        
        .footer {
          border-top: 2px solid #E5E7EB;
          padding-top: 20px;
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6B7280;
        }
        
        .company-info {
          text-align: right;
        }
        
        @media print {
          body { padding: 0; }
          .container { 
            box-shadow: none; 
            padding: 20px; 
            max-width: none; 
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>Work Inspection Request</h1>
            <h2>تقرير فحص العمل</h2>
          </div>
          <div class="wir-id">
            <div class="label">WIR ID</div>
            <div class="id">${wir.id}</div>
            <div class="status-badge" style="background-color: ${getStatusColor()}">
              ${wir.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-section project">
            <h3>Project Details</h3>
            <div class="info-row">
              <span class="info-label">Contractor:</span>
              <span class="info-value">${wir.contractor}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Engineer:</span>
              <span class="info-value">${wir.engineer}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Zone:</span>
              <span class="info-value">${wir.region}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Value:</span>
              <span class="info-value">${formatCurrency(wir.value || 0)}</span>
            </div>
          </div>
          
          <div class="info-section timeline">
            <h3>Timeline & Status</h3>
            <div class="info-row">
              <span class="info-label">Submittal Date:</span>
              <span class="info-value">${formatDate(wir.submittalDate)}</span>
            </div>
            ${wir.receivedDate ? `
            <div class="info-row">
              <span class="info-label">Received Date:</span>
              <span class="info-value">${formatDate(wir.receivedDate)}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge" style="background-color: ${getStatusColor()}">
                  ${wir.status.toUpperCase()}
                </span>
              </span>
            </div>
            ${wir.result ? `
            <div class="info-row">
              <span class="info-label">Result:</span>
              <span class="info-value">
                <span class="status-badge" style="background-color: ${getResultColor()}">
                  Grade ${wir.result}
                </span>
              </span>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${selectedBOQItem ? `
        <div class="info-grid">
          <div class="info-section boq">
            <h3>BOQ Item Details</h3>
            <div class="info-row">
              <span class="info-label">Code:</span>
              <span class="info-value" style="color: #3B82F6; font-family: monospace;">${selectedBOQItem.code}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Unit Rate:</span>
              <span class="info-value">${formatCurrency(selectedBOQItem.unitRate || 0)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Quantity:</span>
              <span class="info-value">${selectedBOQItem.quantity} ${selectedBOQItem.unit}</span>
            </div>
          </div>
          
          ${wir.calculatedAmount ? `
          <div class="info-section calculation">
            <h3>Calculation Details</h3>
            <div class="info-row">
              <span class="info-label">Calculated Amount:</span>
              <span class="info-value">${formatCurrency(wir.calculatedAmount)}</span>
            </div>
            ${wir.calculationEquation ? `
            <div style="margin-top: 10px;">
              <div class="info-label" style="margin-bottom: 5px;">Equation:</div>
              <div style="background: white; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 11px; color: #374151;">
                ${wir.calculationEquation}
              </div>
            </div>
            ` : ''}
          </div>
          ` : '<div></div>'}
        </div>
        ` : ''}
        
        <div class="description-section">
          <h3>Work Description</h3>
          <div class="description-text">${wir.description}</div>
        </div>
        
        ${wir.statusConditions ? `
        <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 30px;">
          <h3 style="color: #92400E; margin-bottom: 10px;">Status Conditions / Comments</h3>
          <div style="color: #78350F;">${wir.statusConditions}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          <div>
            <p>Generated on: ${formatDate(new Date().toISOString().split('T')[0])}</p>
            <p>Document ID: WIR-${wir.id}</p>
          </div>
          <div class="company-info">
            <p>Saad Saeed Al-Saadi & Sons Company</p>
            <p>شركة سعد سعيد الصاعدي وأولاده التضامنية</p>
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
