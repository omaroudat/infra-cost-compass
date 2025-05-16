import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the new components
import DashboardFilter from '@/components/dashboard/DashboardFilter';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import PerformancePanel from '@/components/dashboard/PerformancePanel';
import RecentWIRsTable from '@/components/dashboard/RecentWIRsTable';

type FilterCriteria = 'all' | 'contractor' | 'engineer';

const Dashboard = () => {
  const { wirs, boqItems } = useAppContext();
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>('all');
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  const financialSummary = generateFinancialSummary(wirs);
  
  // Get unique contractors and engineers
  const contractors = Array.from(new Set(wirs.map(wir => wir.contractor))).filter(Boolean);
  const engineers = Array.from(new Set(wirs.map(wir => wir.engineer))).filter(Boolean);
  
  // Filter WIRs based on selected criteria
  const filteredWirs = wirs.filter(wir => {
    if (filterCriteria === 'all') return true;
    if (filterCriteria === 'contractor' && selectedValue) return wir.contractor === selectedValue;
    if (filterCriteria === 'engineer' && selectedValue) return wir.engineer === selectedValue;
    return true;
  });
  
  const statusData = [
    { name: 'Approved', value: filteredWirs.filter(w => w.status === 'A').length, color: '#10b981' },
    { name: 'Conditional', value: filteredWirs.filter(w => w.status === 'B').length, color: '#f59e0b' },
    { name: 'Rejected', value: filteredWirs.filter(w => w.status === 'C').length, color: '#ef4444' },
  ];
  
  const boqCategoryData = boqItems.map(item => ({
    name: item.description,
    amount: item.children ? item.children.reduce((sum, child) => sum + (child.quantity * child.unitRate), 0) : (item.quantity * item.unitRate)
  }));
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const wirStatusData = filteredWirs
    .filter(wir => wir.calculatedAmount !== null)
    .map(wir => ({
      name: wir.description.length > 20 ? wir.description.substring(0, 20) + '...' : wir.description,
      value: wir.calculatedAmount || 0
    }));
  
  // Data for contractor/engineer performance
  const contractorData = contractors.map(contractor => {
    const contractorWirs = wirs.filter(w => w.contractor === contractor);
    return {
      name: contractor,
      approved: contractorWirs.filter(w => w.status === 'A').length,
      conditional: contractorWirs.filter(w => w.status === 'B').length,
      rejected: contractorWirs.filter(w => w.status === 'C').length,
      total: contractorWirs.reduce((sum, w) => sum + (w.calculatedAmount || 0), 0),
    };
  });
  
  const engineerData = engineers.map(engineer => {
    const engineerWirs = wirs.filter(w => w.engineer === engineer);
    return {
      name: engineer,
      approved: engineerWirs.filter(w => w.status === 'A').length,
      conditional: engineerWirs.filter(w => w.status === 'B').length,
      rejected: engineerWirs.filter(w => w.status === 'C').length,
      total: engineerWirs.reduce((sum, w) => sum + (w.calculatedAmount || 0), 0),
    };
  });
  
  const handleFilterChange = (value: FilterCriteria) => {
    setFilterCriteria(value);
    setSelectedValue('');
  };
  
  return (
    <div className="space-y-6">
      <DashboardFilter 
        filterCriteria={filterCriteria}
        selectedValue={selectedValue}
        contractors={contractors}
        engineers={engineers}
        onFilterChange={handleFilterChange}
        onSelectedValueChange={setSelectedValue}
      />
      
      <DashboardStatCards filteredWirs={filteredWirs} formatter={formatter} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="engineers">Engineers</TabsTrigger>
        </TabsList>
        
        <DashboardOverview 
          wirStatusData={wirStatusData}
          boqCategoryData={boqCategoryData}
          formatter={formatter}
        />
        
        <TabsTrigger value="contractors">
          <PerformancePanel data={contractorData} type="contractor" formatter={formatter} />
        </TabsTrigger>
        
        <TabsTrigger value="engineers">
          <PerformancePanel data={engineerData} type="engineer" formatter={formatter} />
        </TabsTrigger>
      </Tabs>
      
      <RecentWIRsTable wirs={filteredWirs} boqItems={boqItems} formatter={formatter} />
    </div>
  );
};

export default Dashboard;
