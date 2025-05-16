
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

interface WIRStatusData {
  name: string;
  value: number;
}

interface WIRStatusChartProps {
  wirStatusData: WIRStatusData[];
  formatter: Intl.NumberFormat;
}

const WIRStatusChart: React.FC<WIRStatusChartProps> = ({ wirStatusData, formatter }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">WIR Status Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wirStatusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: any) => {
              // Ensure value is a number before formatting
              const numValue = typeof value === 'number' ? value : Number(value);
              return [formatter.format(numValue), 'Amount'];
            }} />
            <Legend />
            <Bar name="Amount" dataKey="value" fill="#0a192f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WIRStatusChart;
