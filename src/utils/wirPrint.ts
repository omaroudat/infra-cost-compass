import { WIR, BOQItem } from '@/types';

export const printWIR = (wir: WIR, flattenedBOQItems: BOQItem[]) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) return;

  const getStatusColor = () => {
    switch (wir.status) {
      case 'submitted': return '#3B82F6';
      case 'completed': return '#10B981';
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

  const getBOQItemDetails = (id: string) => {
    const item = flattenedBOQItems.find(item => item.id === id);
    return item || null;
  };

  const selectedBOQItem = getBOQItemDetails(wir.boqItemId);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>WIR - ${wir.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { border-bottom: 4px solid #2563eb; padding-bottom: 24px; margin-bottom: 32px; }
          .header h1 { font-size: 28px; font-weight: bold; margin: 0 0 8px 0; }
          .header h2 { font-size: 18px; color: #666; margin: 0; }
          .wir-id { font-size: 16px; font-weight: bold; color: #2563eb; }
          .status-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 9999px; 
            color: white; 
            font-size: 12px; 
            font-weight: 500; 
            background-color: ${getStatusColor()};
            margin-top: 8px;
          }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
          .section { background: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
          .section h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .detail-label { font-weight: 500; color: #666; }
          .detail-value { color: #333; }
          .description { background: #f1f5f9; padding: 24px; border-radius: 8px; margin-bottom: 32px; }
          .footer { border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 32px; font-size: 12px; color: #666; }
          .footer-content { display: flex; justify-content: space-between; }
          @media print {
            body { margin: 0; }
            .grid { display: block; }
            .section { margin-bottom: 16px; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h1>Work Inspection Request</h1>
              <h2>تقرير فحص العمل</h2>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">WIR ID</div>
              <div class="wir-id">${wir.id}</div>
              <div class="status-badge">${wir.status.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div class="section">
              <h3>Project Details</h3>
              <div class="detail-row">
                <span class="detail-label">Contractor:</span>
                <span class="detail-value">${wir.contractor}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Engineer:</span>
                <span class="detail-value">${wir.engineer}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Zone:</span>
                <span class="detail-value">${wir.region}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Value:</span>
                <span class="detail-value" style="font-weight: 600;">${formatCurrency(wir.value || 0)}</span>
              </div>
            </div>

            ${selectedBOQItem ? `
            <div class="section">
              <h3>BOQ Item Details</h3>
              <div class="detail-row">
                <span class="detail-label">Code:</span>
                <span class="detail-value" style="color: #2563eb; font-family: monospace;">${selectedBOQItem.code}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <div class="detail-label" style="margin-bottom: 4px;">Description:</div>
                <div class="detail-value" style="font-size: 14px;">${selectedBOQItem.description}</div>
              </div>
              <div class="detail-row">
                <span class="detail-label">Unit Rate:</span>
                <span class="detail-value">${formatCurrency(selectedBOQItem.unitRate || 0)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${selectedBOQItem.quantity} ${selectedBOQItem.unit}</span>
              </div>
            </div>
            ` : ''}
          </div>

          <div>
            <div class="section">
              <h3>Timeline & Status</h3>
              <div class="detail-row">
                <span class="detail-label">Submittal Date:</span>
                <span class="detail-value">${formatDate(wir.submittalDate)}</span>
              </div>
              ${wir.receivedDate ? `
              <div class="detail-row">
                <span class="detail-label">Received Date:</span>
                <span class="detail-value">${formatDate(wir.receivedDate)}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span style="background-color: ${getStatusColor()}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${wir.status.toUpperCase()}
                  </span>
                </span>
              </div>
              ${wir.result ? `
              <div class="detail-row">
                <span class="detail-label">Result:</span>
                <span class="detail-value">
                  <span style="background-color: ${getResultColor()}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    Grade ${wir.result}
                  </span>
                </span>
              </div>
              ` : ''}
            </div>

            ${wir.calculatedAmount ? `
            <div class="section">
              <h3>Calculation Details</h3>
              <div class="detail-row">
                <span class="detail-label">Calculated Amount:</span>
                <span class="detail-value" style="font-weight: 600;">${formatCurrency(wir.calculatedAmount)}</span>
              </div>
              ${wir.calculationEquation ? `
              <div style="margin-top: 12px;">
                <div class="detail-label" style="margin-bottom: 4px;">Equation:</div>
                <div style="font-family: monospace; background: white; padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; font-size: 12px;">
                  ${wir.calculationEquation}
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
        </div>

        <div class="description">
          <h3>Work Description</h3>
          <p style="line-height: 1.6; margin: 0;">${wir.description}</p>
        </div>

        ${wir.statusConditions ? `
        <div style="background: #fef3c7; padding: 24px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 32px;">
          <h3 style="color: #92400e; margin: 0 0 16px 0;">Status Conditions / Comments</h3>
          <p style="color: #b45309; line-height: 1.6; margin: 0;">${wir.statusConditions}</p>
        </div>
        ` : ''}

        <div class="footer">
          <div class="footer-content">
            <div>
              <p>Generated on: ${formatDate(new Date().toISOString().split('T')[0])}</p>
              <p>Document ID: WIR-${wir.id}</p>
            </div>
            <div style="text-align: right;">
              <p>Saad Saeed Al-Saadi & Sons Company</p>
              <p>شركة سعد سعيد الصاعدي وأولاده التضامنية</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
