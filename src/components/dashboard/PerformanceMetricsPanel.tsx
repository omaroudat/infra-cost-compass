
import React from 'react';

interface PerformanceData {
  name: string;
  approved: number;
  conditional: number;
  rejected: number;
  total: number;
}

interface PerformanceMetricsPanelProps {
  data: PerformanceData[];
  type: 'contractor' | 'engineer';
  formatter: Intl.NumberFormat;
}

const PerformanceMetricsPanel: React.FC<PerformanceMetricsPanelProps> = ({ data, type, formatter }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium mb-2">
          {type === 'contractor' ? 'Top Contractors by Value' : 'Top Engineers by Inspections'}
        </h4>
        <ul className="space-y-2">
          {type === 'contractor' ? (
            data
              .sort((a, b) => b.total - a.total)
              .slice(0, 3)
              .map((item) => (
                <li key={item.name} className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span>{formatter.format(item.total)}</span>
                </li>
              ))
          ) : (
            data
              .sort((a, b) => (b.approved + b.conditional + b.rejected) - (a.approved + a.conditional + a.rejected))
              .slice(0, 3)
              .map((engineer) => (
                <li key={engineer.name} className="flex justify-between">
                  <span className="font-medium">{engineer.name}</span>
                  <span>{engineer.approved + engineer.conditional + engineer.rejected} WIRs</span>
                </li>
              ))
          )}
        </ul>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium mb-2">
          {type === 'contractor' ? 'Approval Rate' : 'Rejection Rate'}
        </h4>
        <ul className="space-y-2">
          {data
            .map((item) => {
              const total = item.approved + item.conditional + item.rejected;
              const rate = total > 0 
                ? type === 'contractor'
                  ? ((item.approved / total) * 100).toFixed(1)
                  : ((item.rejected / total) * 100).toFixed(1)
                : '0';
              return {
                name: item.name,
                rate: rate
              };
            })
            .sort((a, b) => type === 'contractor' 
              ? parseFloat(b.rate) - parseFloat(a.rate) 
              : parseFloat(a.rate) - parseFloat(b.rate)
            )
            .slice(0, 3)
            .map((item) => (
              <li key={item.name} className="flex justify-between">
                <span className="font-medium">{item.name}</span>
                <span>{item.rate}%</span>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMetricsPanel;
