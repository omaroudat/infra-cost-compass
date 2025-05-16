
import React from 'react';
import { Card } from '@/components/ui/card';
import { BOQItem, WIR } from '@/types';

interface RecentWIRsTableProps {
  wirs: WIR[];
  boqItems: BOQItem[];
  formatter: Intl.NumberFormat;
}

const RecentWIRsTable: React.FC<RecentWIRsTableProps> = ({ wirs, boqItems, formatter }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Work Inspection Requests</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engineer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wirs.slice(0, 5).map((wir) => {
              const boqItem = boqItems.flatMap(item => 
                [item, ...(item.children || [])]
              ).find(item => item.id === wir.boqItemId);
              
              return (
                <tr key={wir.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wir.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{wir.description}</div>
                    <div className="text-xs text-gray-400">{boqItem?.description || 'Unknown BOQ Item'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wir.contractor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wir.engineer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${wir.status === 'A' ? 'bg-green-100 text-green-800' : 
                        wir.status === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {wir.status === 'A' ? 'Approved' : 
                       wir.status === 'B' ? 'Conditional' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {wir.calculatedAmount ? formatter.format(wir.calculatedAmount) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentWIRsTable;
