
import React from 'react';
import { BOQItem, WIR } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';

interface WIRTableProps {
  wirs: WIR[];
  flattenedBOQItems: BOQItem[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (wir: WIR) => void;
  onDelete: (id: string) => void;
}

const WIRTable: React.FC<WIRTableProps> = ({
  wirs,
  flattenedBOQItems,
  canEdit,
  canDelete,
  onEdit,
  onDelete
}) => {
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const getBOQItemByIdWithLabel = (id: string): string => {
    const item = flattenedBOQItems.find(item => item.id === id);
    return item ? `${item.code} - ${item.description}` : 'Unknown';
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              BOQ Item
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contractor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Engineer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submittal Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            {(canEdit || canDelete) && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {wirs.map((wir) => (
            <tr key={wir.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {wir.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getBOQItemByIdWithLabel(wir.boqItemId)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {wir.contractor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {wir.engineer}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div>{wir.description}</div>
                {wir.adjustmentApplied && (
                  <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    +{(wir.adjustmentApplied.percentage * 100).toFixed(0)}% ({wir.adjustmentApplied.keyword})
                  </div>
                )}
                {wir.status === 'B' && wir.statusConditions && (
                  <div className="mt-1 text-xs text-amber-600">
                    Conditions: {wir.statusConditions}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(wir.submittalDate).toLocaleDateString()}
                {wir.receivedDate && (
                  <div className="text-xs text-gray-400">
                    Received: {new Date(wir.receivedDate).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={wir.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {wir.calculatedAmount ? formatter.format(wir.calculatedAmount) : '-'}
              </td>
              {(canEdit || canDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEdit(wir)}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDelete(wir.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WIRTable;
