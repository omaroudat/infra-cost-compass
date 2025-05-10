
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const { wirs, boqItems } = useAppContext();
  
  const financialSummary = generateFinancialSummary(wirs);
  
  const statusData = [
    { name: 'Approved', value: financialSummary.totalApprovedWIRs, color: '#10b981' },
    { name: 'Conditional', value: financialSummary.totalConditionalWIRs, color: '#f59e0b' },
    { name: 'Rejected', value: financialSummary.totalRejectedWIRs, color: '#ef4444' },
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
  
  const wirStatusData = wirs.map(wir => ({
    name: wir.description,
    value: wir.calculatedAmount || 0
  }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Approved WIRs Amount" 
          value={formatter.format(financialSummary.totalApprovedAmount)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-approved"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
          }
        />
        <StatCard 
          title="Conditional WIRs Amount" 
          value={formatter.format(financialSummary.totalConditionalAmount)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-conditional"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
          }
        />
        <StatCard 
          title="Cost Variance vs BOQ" 
          value={formatter.format(financialSummary.costVarianceAgainstBOQ)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={financialSummary.costVarianceAgainstBOQ >= 0 ? "text-status-approved" : "text-status-rejected"}><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          }
          trend={{
            direction: financialSummary.costVarianceAgainstBOQ >= 0 ? 'up' : 'down',
            value: `${Math.abs(financialSummary.costVarianceAgainstBOQ / 1000).toFixed(1)}K`
          }}
        />
      </div>
      
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
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Work Inspection Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submittal Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wirs.slice(0, 5).map((wir) => {
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wir.submittalDate).toLocaleDateString()}</td>
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
