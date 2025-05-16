
import React from 'react';
import { Card } from '@/components/ui/card';
import PerformanceMetricsPanel from './PerformanceMetricsPanel';
import PerformanceChart from './PerformanceChart';

interface PerformanceData {
  name: string;
  approved: number;
  conditional: number;
  rejected: number;
  total: number;
}

interface PerformancePanelProps {
  data: PerformanceData[];
  type: 'contractor' | 'engineer';
  formatter: Intl.NumberFormat;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({ data, type, formatter }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {type === 'contractor' ? 'Contractor Performance' : 'Engineer Performance'}
      </h3>
      <PerformanceMetricsPanel data={data} type={type} formatter={formatter} />
      <PerformanceChart data={data} formatter={formatter} />
    </Card>
  );
};

export default PerformancePanel;
