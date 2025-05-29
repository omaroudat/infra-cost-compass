import React from 'react';
import { WIR, BOQItem } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface WIRPrintViewProps {
  wir: WIR;
  flattenedBOQItems: BOQItem[];
}

const WIRPrintView: React.FC<WIRPrintViewProps> = ({ wir, flattenedBOQItems }) => {
  const { breakdownItems } = useAppContext();

  const getBOQItemDetails = (id: string) => {
    const item = flattenedBOQItems.find(item => item.id === id);
    return item || null;
  };

  const getSelectedBreakdownItems = () => {
    if (!wir.selectedBreakdownItems || !breakdownItems) return [];
    return breakdownItems.filter(item => wir.selectedBreakdownItems?.includes(item.id));
  };

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

  const selectedBOQItem = getBOQItemDetails(wir.boqItemId);
  const selectedBreakdownItems = getSelectedBreakdownItems();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-4 print:max-w-none">
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Inspection Request</h1>
            <h2 className="text-xl text-gray-600">تقرير فحص العمل</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">WIR ID</div>
            <div className="text-lg font-bold text-blue-600">{wir.id}</div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mt-2"
              style={{ backgroundColor: getStatusColor() }}
            >
              {wir.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Details */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              Project Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Contractor:</span>
                <span className="text-gray-900">{wir.contractor}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Engineer:</span>
                <span className="text-gray-900">{wir.engineer}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Zone:</span>
                <span className="text-gray-900">{wir.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Value:</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(wir.value || 0)}</span>
              </div>
            </div>
          </div>

          {/* BOQ Item Details */}
          {selectedBOQItem && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                BOQ Item Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Code:</span>
                  <span className="text-blue-600 font-mono">{selectedBOQItem.code}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-600 mb-1">Description:</div>
                  <div className="text-gray-900 text-sm">{selectedBOQItem.description}</div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Unit Rate:</span>
                  <span className="text-gray-900">{formatCurrency(selectedBOQItem.unitRate || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Quantity:</span>
                  <span className="text-gray-900">{selectedBOQItem.quantity} {selectedBOQItem.unit}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dates and Status */}
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
              Timeline & Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Submittal Date:</span>
                <span className="text-gray-900">{formatDate(wir.submittalDate)}</span>
              </div>
              {wir.receivedDate && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Received Date:</span>
                  <span className="text-gray-900">{formatDate(wir.receivedDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Status:</span>
                <span 
                  className="px-2 py-1 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getStatusColor() }}
                >
                  {wir.status.toUpperCase()}
                </span>
              </div>
              {wir.result && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Result:</span>
                  <span 
                    className="px-2 py-1 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: getResultColor() }}
                  >
                    Grade {wir.result}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Calculation Details */}
          {wir.calculatedAmount && (
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                Calculation Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Calculated Amount:</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(wir.calculatedAmount)}</span>
                </div>
                {wir.calculationEquation && (
                  <div>
                    <div className="font-medium text-gray-600 mb-1">Equation:</div>
                    <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">
                      {wir.calculationEquation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
            Work Description
          </h3>
          <p className="text-gray-700 leading-relaxed">{wir.description}</p>
        </div>
      </div>

      {/* Breakdown Items */}
      {selectedBreakdownItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
              Selected Breakdown Sub-Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-indigo-200">
                    <th className="text-left py-2 font-medium text-indigo-800">Description</th>
                    <th className="text-right py-2 font-medium text-indigo-800">Percentage</th>
                    <th className="text-right py-2 font-medium text-indigo-800">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBreakdownItems.map((item) => (
                    <tr key={item.id} className="border-b border-indigo-100">
                      <td className="py-2 text-gray-700">{item.description}</td>
                      <td className="py-2 text-right text-gray-700">{item.percentage}%</td>
                      <td className="py-2 text-right text-gray-700">{formatCurrency(item.value || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Conditions */}
      {wir.statusConditions && (
        <div className="mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
              Status Conditions / Comments
            </h3>
            <p className="text-yellow-700 leading-relaxed">{wir.statusConditions}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="flex justify-between text-sm text-gray-500">
          <div>
            <p>Generated on: {formatDate(new Date().toISOString().split('T')[0])}</p>
            <p>Document ID: WIR-{wir.id}</p>
          </div>
          <div className="text-right">
            <p>Saad Saeed Al-Saadi & Sons Company</p>
            <p>شركة سعد سعيد الصاعدي وأولاده التضامنية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WIRPrintView;
