import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type FilterEntity = 'all' | 'contractor' | 'engineer';

const Reports = () => {
  const { wirs, boqItems } = useAppContext();
  const [reportType, setReportType] = useState('financial');
  const [filterEntity, setFilterEntity] = useState<FilterEntity>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  
  const financialSummary = generateFinancialSummary(wirs);
  
  // Get unique contractors and engineers
  const contractors = Array.from(new Set(wirs.map(wir => wir.contractor))).filter(Boolean);
  const engineers = Array.from(new Set(wirs.map(wir => wir.engineer))).filter(Boolean);
  
  // Filter WIRs based on selected criteria
  const filteredWirs = wirs.filter(wir => {
    if (filterEntity === 'all') return true;
    if (filterEntity === 'contractor' && selectedEntity) return wir.contractor === selectedEntity;
    if (filterEntity === 'engineer' && selectedEntity) return wir.engineer === selectedEntity;
    return true;
  });
  
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Prepare data for charts
  const statusChartData = [
    { name: 'Approved', value: filteredWirs.filter(w => w.status === 'A').length, color: '#10b981' },
    { name: 'Conditional', value: filteredWirs.filter(w => w.status === 'B').length, color: '#f59e0b' },
    { name: 'Rejected', value: filteredWirs.filter(w => w.status === 'C').length, color: '#ef4444' },
  ];
  
  const amountChartData = [
    { name: 'Approved', amount: filteredWirs.filter(w => w.status === 'A').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0) },
    { name: 'Conditional', amount: filteredWirs.filter(w => w.status === 'B').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0) },
  ];
  
  // Create BOQ category data
  const boqCategoryData = boqItems.map(item => {
    const boqAmount = item.children 
      ? item.children.reduce((sum, child) => sum + (child.quantity * child.unitRate), 0)
      : (item.quantity * item.unitRate);
    
    // Calculate WIR amounts for this BOQ item in filtered WIRs
    const wirAmounts = filteredWirs
      .filter(wir => {
        // Check if this WIR is for this BOQ item or any of its children
        if (wir.boqItemId === item.id) return true;
        if (item.children) {
          return item.children.some(child => child.id === wir.boqItemId);
        }
        return false;
      })
      .reduce((sum, wir) => sum + (wir.calculatedAmount || 0), 0);
    
    return {
      name: item.description,
      boqAmount,
      wirAmount: wirAmounts,
      variance: wirAmounts - boqAmount
    };
  });
  
  // Contractor and Engineer comparison data
  const contractorComparisonData = contractors.map(contractor => {
    const contractorWirs = wirs.filter(w => w.contractor === contractor);
    return {
      name: contractor,
      approved: contractorWirs.filter(w => w.status === 'A').length,
      conditional: contractorWirs.filter(w => w.status === 'B').length,
      rejected: contractorWirs.filter(w => w.status === 'C').length,
      totalAmount: contractorWirs.reduce((sum, w) => sum + (w.calculatedAmount || 0), 0),
    };
  });
  
  const engineerComparisonData = engineers.map(engineer => {
    const engineerWirs = wirs.filter(w => w.engineer === engineer);
    return {
      name: engineer,
      approved: engineerWirs.filter(w => w.status === 'A').length,
      conditional: engineerWirs.filter(w => w.status === 'B').length,
      rejected: engineerWirs.filter(w => w.status === 'C').length,
      totalAmount: engineerWirs.reduce((sum, w) => sum + (w.calculatedAmount || 0), 0),
    };
  });
  
  // Function to export report
  const handleExport = () => {
    // In a real application, this would generate a PDF or Excel file
    alert('Export functionality would be implemented here in a real application.');
  };
  
  const handleFilterChange = (value: FilterEntity) => {
    setFilterEntity(value);
    setSelectedEntity('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Financial Reports</h2>
        <div className="flex space-x-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financial Summary</SelectItem>
              <SelectItem value="status">Status Analysis</SelectItem>
              <SelectItem value="boq">BOQ Variance</SelectItem>
              <SelectItem value="contractor">Contractor Analysis</SelectItem>
              <SelectItem value="engineer">Engineer Analysis</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>Export Report</Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium">Filter Reports:</h3>
          <div className="flex items-center space-x-2">
            <Select value={filterEntity} onValueChange={(value: FilterEntity) => handleFilterChange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All WIRs</SelectItem>
                <SelectItem value="contractor">By Contractor</SelectItem>
                <SelectItem value="engineer">By Engineer</SelectItem>
              </SelectContent>
            </Select>
            
            {filterEntity === 'contractor' && (
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
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
            
            {filterEntity === 'engineer' && (
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
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
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="personnel">Personnel Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Approved WIRs</CardTitle>
                <CardDescription>Total value of approved work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatter.format(filteredWirs.filter(w => w.status === 'A').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Count: {filteredWirs.filter(w => w.status === 'A').length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Conditional WIRs</CardTitle>
                <CardDescription>Total value with conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatter.format(filteredWirs.filter(w => w.status === 'B').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Count: {filteredWirs.filter(w => w.status === 'B').length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Cost Variance</CardTitle>
                <CardDescription>Variance against BOQ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${financialSummary.costVarianceAgainstBOQ >= 0 ? 'text-status-approved' : 'text-status-rejected'}`}>
                  {formatter.format(financialSummary.costVarianceAgainstBOQ)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {financialSummary.costVarianceAgainstBOQ >= 0 ? 'Over budget' : 'Under budget'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Project Financial Health</CardTitle>
              <CardDescription>Overall financial metrics for the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total BOQ Value</span>
                  <span className="font-semibold">{formatter.format(boqCategoryData.reduce((sum, item) => sum + item.boqAmount, 0))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Approved + Conditional WIRs</span>
                  <span className="font-semibold">
                    {formatter.format(
                      filteredWirs
                        .filter(w => w.status === 'A' || w.status === 'B')
                        .reduce((sum, w) => sum + (w.calculatedAmount || 0), 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rejected WIRs Count</span>
                  <span className="font-semibold">{filteredWirs.filter(w => w.status === 'C').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Adjustment Rate</span>
                  <span className="font-semibold">
                    {filteredWirs.filter(w => w.adjustmentApplied).length > 0 
                      ? `+${(filteredWirs.filter(w => w.adjustmentApplied).reduce((sum, w) => sum + (w.adjustmentApplied?.percentage || 0), 0) / filteredWirs.filter(w => w.adjustmentApplied).length * 100).toFixed(1)}%` 
                      : 'N/A'}
                  </span>
                </div>
                {filterEntity !== 'all' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-sm font-medium mb-2">
                      {filterEntity === 'contractor' ? 'Contractor' : 'Engineer'} Performance
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total WIRs</span>
                      <span className="font-semibold">{filteredWirs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Approval Rate</span>
                      <span className="font-semibold">
                        {filteredWirs.length > 0 
                          ? `${((filteredWirs.filter(w => w.status === 'A').length / filteredWirs.length) * 100).toFixed(1)}%` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>WIR Status Distribution</CardTitle>
                <CardDescription>Breakdown by approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`Count: ${value}`, 'WIRs']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>WIR Amounts by Status</CardTitle>
                <CardDescription>Financial value by approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={amountChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => {
                        const numValue = typeof value === 'number' ? value : Number(value);
                        return [formatter.format(numValue), 'Amount'];
                      }} />
                      <Bar dataKey="amount" fill="#0a192f" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed WIR Status Report</CardTitle>
              <CardDescription>Breakdown of all work inspection requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        WIR ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BOQ Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contractor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engineer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submittal
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWirs.map((wir) => {
                      const boqItem = boqItems.flatMap(item => 
                        [item, ...(item.children || [])]
                      ).find(item => item.id === wir.boqItemId);
                      
                      const statusClass = 
                        wir.status === 'A' ? 'bg-green-100 text-green-800' : 
                        wir.status === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800';
                      
                      return (
                        <tr key={wir.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {wir.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {boqItem ? `${boqItem.code} - ${boqItem.description}` : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {wir.contractor}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {wir.engineer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                              {wir.status === 'A' ? 'Approved' : 
                               wir.status === 'B' ? 'Conditional' : 'Rejected'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(wir.submittalDate).toLocaleDateString()}
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="variance">
          <Card>
            <CardHeader>
              <CardTitle>BOQ Variance Analysis</CardTitle>
              <CardDescription>Comparison of BOQ values versus actual WIR amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={boqCategoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => {
                      const numValue = typeof value === 'number' ? value : Number(value);
                      return [formatter.format(numValue), 'Amount'];
                    }} />
                    <Legend />
                    <Bar dataKey="boqAmount" name="BOQ Amount" fill="#8884d8" />
                    <Bar dataKey="wirAmount" name="WIR Amount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BOQ Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BOQ Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WIR Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boqCategoryData.map((item, index) => {
                    const percentVariance = item.boqAmount > 0 ? 
                      ((item.variance / item.boqAmount) * 100).toFixed(1) : 
                      'N/A';
                    
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatter.format(item.boqAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatter.format(item.wirAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={item.variance >= 0 ? 'text-status-approved' : 'text-status-rejected'}>
                            {formatter.format(item.variance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={item.variance >= 0 ? 'text-status-approved' : 'text-status-rejected'}>
                            {percentVariance !== 'N/A' ? `${percentVariance}%` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="personnel">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Performance Analysis</CardTitle>
                <CardDescription>Comparison of WIRs and amounts by contractor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contractorComparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value: any, name) => {
                        if (name === 'totalAmount') {
                          return [formatter.format(value), 'Total Amount'];
                        }
                        const nameStr = name ? name.toString() : '';
                        return [value, nameStr.charAt(0).toUpperCase() + nameStr.slice(1) + ' WIRs'];
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10b981" />
                      <Bar yAxisId="left" dataKey="conditional" name="Conditional" fill="#f59e0b" />
                      <Bar yAxisId="left" dataKey="rejected" name="Rejected" fill="#ef4444" />
                      <Bar yAxisId="right" dataKey="totalAmount" name="Total Amount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contractor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conditional
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approval Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contractorComparisonData.map((item, index) => {
                      const totalWirs = item.approved + item.conditional + item.rejected;
                      const approvalRate = totalWirs > 0 ? 
                        ((item.approved / totalWirs) * 100).toFixed(1) + '%' :
                        'N/A';
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.approved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.conditional}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.rejected}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatter.format(item.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {approvalRate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Engineer Performance Analysis</CardTitle>
                <CardDescription>Comparison of WIRs and amounts by engineer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={engineerComparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value: any, name) => {
                        if (name === 'totalAmount') {
                          return [formatter.format(value), 'Total Amount'];
                        }
                        const nameStr = name ? name.toString() : '';
                        return [value, nameStr.charAt(0).toUpperCase() + nameStr.slice(1) + ' WIRs'];
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10b981" />
                      <Bar yAxisId="left" dataKey="conditional" name="Conditional" fill="#f59e0b" />
                      <Bar yAxisId="left" dataKey="rejected" name="Rejected" fill="#ef4444" />
                      <Bar yAxisId="right" dataKey="totalAmount" name="Total Amount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engineer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conditional
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approval Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {engineerComparisonData.map((item, index) => {
                      const totalWirs = item.approved + item.conditional + item.rejected;
                      const approvalRate = totalWirs > 0 ? 
                        ((item.approved / totalWirs) * 100).toFixed(1) + '%' :
                        'N/A';
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.approved}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.conditional}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.rejected}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatter.format(item.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {approvalRate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
