
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import WIRStatusChart from './WIRStatusChart';
import BOQCategoriesChart from './BOQCategoriesChart';

interface WIRStatusData {
  name: string;
  value: number;
}

interface BOQCategoryData {
  name: string;
  amount: number;
}

interface DashboardOverviewProps {
  wirStatusData: WIRStatusData[];
  boqCategoryData: BOQCategoryData[];
  formatter: Intl.NumberFormat;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  wirStatusData,
  boqCategoryData,
  formatter
}) => {
  return (
    <TabsContent value="overview">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WIRStatusChart wirStatusData={wirStatusData} formatter={formatter} />
        <BOQCategoriesChart boqCategoryData={boqCategoryData} formatter={formatter} />
      </div>
    </TabsContent>
  );
};

export default DashboardOverview;
