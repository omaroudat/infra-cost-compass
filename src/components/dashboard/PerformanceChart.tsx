
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PerformanceData {
  name: string;
  approved: number;
  conditional: number;
  rejected: number;
  total: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  formatter: Intl.NumberFormat;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, formatter }) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip formatter={(value, name) => {
            if (name === 'total') {
              return [formatter.format(value as number), 'Total Amount'];
            }
            const nameStr = name ? name.toString() : '';
            return [value, nameStr.charAt(0).toUpperCase() + nameStr.slice(1) + ' WIRs'];
          }} />
          <Legend />
          <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10b981" />
          <Bar yAxisId="left" dataKey="conditional" name="Conditional" stackId="a" fill="#f59e0b" />
          <Bar yAxisId="left" dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" />
          <Bar yAxisId="right" dataKey="total" name="Total Amount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
