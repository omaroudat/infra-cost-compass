
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusChartProps {
  statusData: StatusData[];
}

const StatusChart: React.FC<StatusChartProps> = ({ statusData }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">WIR Status Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} WIRs`, 'Count']}
              labelFormatter={(label) => label}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StatusChart;
