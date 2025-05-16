
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Filter Dashboard:</h3>
          <div className="flex items-center space-x-2">
            <Select value={filterCriteria} onValueChange={(value: FilterCriteria) => handleFilterChange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All WIRs</SelectItem>
                <SelectItem value="contractor">By Contractor</SelectItem>
                <SelectItem value="engineer">By Engineer</SelectItem>
              </SelectContent>
            </Select>
            
            {filterCriteria === 'contractor' && (
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor} value={contractor}>
                      {contractor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filterCriteria === 'engineer' && (
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer} value={engineer}>
                      {engineer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Approved WIRs Amount" 
          value={formatter.format(filteredWirs.filter(w => w.status === 'A').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-approved"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
          }
        />
        <StatCard 
          title="Conditional WIRs Amount" 
          value={formatter.format(filteredWirs.filter(w => w.status === 'B').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-conditional"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
          }
        />
        <StatCard 
          title="Total WIRs" 
          value={filteredWirs.length.toString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M9 14h.01"></path><path d="M13 14h.01"></path><path d="M9 18h.01"></path><path d="M13 18h.01"></path></svg>
          }
        />
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="engineers">Engineers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
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
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
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
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contractors">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Contractor Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contractorData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
          </div>
        </TabsContent>
        
        <TabsContent value="engineers">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Engineer Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engineerData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
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
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="bg-white p-6 rounded-lg shadow">
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
              {filteredWirs.slice(0, 5).map((wir) => {
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
      </div>
    </div>
  );
};

export default Dashboard;
