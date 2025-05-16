
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

interface BOQCategoryData {
  name: string;
  amount: number;
}

interface BOQCategoriesChartProps {
  boqCategoryData: BOQCategoryData[];
  formatter: Intl.NumberFormat;
}

const BOQCategoriesChart: React.FC<BOQCategoriesChartProps> = ({ boqCategoryData, formatter }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">BOQ Categories</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={boqCategoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value) => {
              // Ensure value is a number before formatting
              const numValue = typeof value === 'number' ? value : Number(value);
              return [formatter.format(numValue), 'Amount'];
            }} />
            <Bar dataKey="amount" fill="#0a192f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BOQCategoriesChart;
