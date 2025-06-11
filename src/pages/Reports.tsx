import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import { WIR } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, XCircle, FileText, Download } from 'lucide-react';

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
  
  // Always use English number formatting for executives
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  // Calculate approved amount properly - use calculatedAmount if available, otherwise use value
  const getApprovedAmount = (wir: WIR) => {
    if (wir.result === 'A') {
      return wir.calculatedAmount || wir.value || 0;
    }
    return 0;
  };
  
  const getConditionalAmount = (wir: WIR) => {
    if (wir.result === 'B') {
      return wir.calculatedAmount || wir.value || 0;
    }
    return 0;
  };
  
  // Calculate totals with proper amount handling
  const totalApprovedAmount = filteredWirs.reduce((sum, w) => sum + getApprovedAmount(w), 0);
  const totalConditionalAmount = filteredWirs.reduce((sum, w) => sum + getConditionalAmount(w), 0);
  const totalRejectedCount = filteredWirs.filter(w => w.result === 'C').length;
  const totalProjectValue = totalApprovedAmount + totalConditionalAmount;
  
  // Prepare data for charts
  const statusChartData = [
    { name: 'Approved', value: filteredWirs.filter(w => w.result === 'A').length, color: '#10b981', amount: totalApprovedAmount },
    { name: 'Conditional', value: filteredWirs.filter(w => w.result === 'B').length, color: '#f59e0b', amount: totalConditionalAmount },
    { name: 'Rejected', value: totalRejectedCount, color: '#ef4444', amount: 0 },
  ];
  
  const amountChartData = [
    { name: 'Approved', amount: totalApprovedAmount },
    { name: 'Conditional', amount: totalConditionalAmount },
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
      .reduce((sum, wir) => sum + (getApprovedAmount(wir) + getConditionalAmount(wir)), 0);
    
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
      approved: contractorWirs.filter(w => w.result === 'A').length,
      conditional: contractorWirs.filter(w => w.result === 'B').length,
      rejected: contractorWirs.filter(w => w.result === 'C').length,
      totalAmount: contractorWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
    };
  });
  
  const engineerComparisonData = engineers.map(engineer => {
    const engineerWirs = wirs.filter(w => w.engineer === engineer);
    return {
      name: engineer,
      approved: engineerWirs.filter(w => w.result === 'A').length,
      conditional: engineerWirs.filter(w => w.result === 'B').length,
      rejected: engineerWirs.filter(w => w.result === 'C').length,
      totalAmount: engineerWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
    };
  });
  
  // Function to export report
  const handleExport = () => {
    alert('Export functionality would be implemented here in a real application.');
  };
  
  const handleFilterChange = (value: FilterEntity) => {
    setFilterEntity(value);
    setSelectedEntity('');
  };
  
  const totalBOQValue = boqCategoryData.reduce((sum, item) => sum + item.boqAmount, 0);
  const completionRate = totalBOQValue > 0 ? (totalProjectValue / totalBOQValue) * 100 : 0;
  const approvalRate = filteredWirs.length > 0 ? (filteredWirs.filter(w => w.result === 'A').length / filteredWirs.length) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Financial Report</h1>
              <p className="text-slate-600 text-lg">Comprehensive project performance analysis</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px] h-11">
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
              <Button onClick={handleExport} className="h-11 px-6 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium mb-1">Total Approved Value</p>
                  <p className="text-2xl font-bold text-green-900">{formatter.format(totalProjectValue)}</p>
                  <div className="text-green-600 text-sm mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved:
                      </span>
                      <span className="font-medium">{formatter.format(totalApprovedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Conditional:
                      </span>
                      <span className="font-medium">{formatter.format(totalConditionalAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium mb-1">Rejected WIRs</p>
                  <p className="text-2xl font-bold text-red-900">{totalRejectedCount}</p>
                  <p className="text-red-600 text-sm mt-1">needs review</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium mb-1">Project Completion</p>
                  <p className="text-2xl font-bold text-blue-900">{completionRate.toFixed(1)}%</p>
                  <p className="text-blue-600 text-sm mt-1">of total BOQ value</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{approvalRate.toFixed(1)}%</p>
                  <p className="text-purple-600 text-sm mt-1">success rate</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Filter Analysis:</h3>
              <div className="flex flex-col sm:flex-row gap-3">
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
          </CardContent>
        </Card>
        
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Executive Summary</TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Performance Charts</TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="variance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Budget Variance</TabsTrigger>
            <TabsTrigger value="personnel" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Team Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900">Financial Overview</CardTitle>
                  <CardDescription>Key financial metrics and project health indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Total BOQ Value</span>
                    <span className="font-bold text-slate-900">{formatter.format(totalBOQValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Approved + Conditional</span>
                    <span className="font-bold text-green-600">{formatter.format(totalProjectValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Budget Variance</span>
                    <span className={`font-bold ${financialSummary.costVarianceAgainstBOQ >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatter.format(financialSummary.costVarianceAgainstBOQ)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600 font-medium">Rejected WIRs</span>
                    <span className="font-bold text-red-600">{totalRejectedCount}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 text-sm text-slate-500">
                  Last updated: {new Date().toLocaleDateString()}
                </CardFooter>
              </Card>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900">Project Status Distribution</CardTitle>
                  <CardDescription>Breakdown of WIR approval status</CardDescription>
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
                        <Tooltip formatter={(value: any, name) => [`${value} WIRs`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Financial Value by Status</CardTitle>
                  <CardDescription>Monetary value breakdown by approval status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={amountChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip formatter={(value: any) => {
                          const numValue = typeof value === 'number' ? value : Number(value);
                          return [formatter.format(numValue), 'Amount'];
                        }} />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">BOQ vs WIR Comparison</CardTitle>
                  <CardDescription>Budget versus actual completion values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={boqCategoryData.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip formatter={(value: any) => {
                          const numValue = typeof value === 'number' ? value : Number(value);
                          return [formatter.format(numValue), 'Amount'];
                        }} />
                        <Legend />
                        <Bar dataKey="boqAmount" name="BOQ Budget" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="wirAmount" name="WIR Actual" fill="#10b981" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Detailed WIR Analysis</CardTitle>
                <CardDescription>Comprehensive breakdown of all work inspection requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">WIR ID</TableHead>
                        <TableHead className="font-semibold text-slate-700">BOQ Item</TableHead>
                        <TableHead className="font-semibold text-slate-700">Contractor</TableHead>
                        <TableHead className="font-semibold text-slate-700">Engineer</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Submittal Date</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWirs.slice(0, 10).map((wir) => {
                        const boqItem = boqItems.flatMap(item => 
                          [item, ...(item.children || [])]
                        ).find(item => item.id === wir.boqItemId);
                        
                        const statusClass = 
                          wir.result === 'A' ? 'bg-green-100 text-green-800' : 
                          wir.result === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                          wir.result === 'C' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800';
                        
                        return (
                          <TableRow key={wir.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{wir.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium text-slate-900 truncate">
                                  {boqItem ? boqItem.code : 'Unknown'}
                                </div>
                                <div className="text-sm text-slate-500 truncate">
                                  {boqItem ? boqItem.description : 'Unknown BOQ Item'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700">{wir.contractor}</TableCell>
                            <TableCell className="text-slate-700">{wir.engineer}</TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                                {wir.result === 'A' ? 'Approved' : 
                                 wir.result === 'B' ? 'Conditional' : 
                                 wir.result === 'C' ? 'Rejected' : 'Pending'}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {new Date(wir.submittalDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {(wir.calculatedAmount || wir.value) ? formatter.format(wir.calculatedAmount || wir.value || 0) : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="variance" className="mt-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Budget Variance Analysis</CardTitle>
                <CardDescription>Detailed comparison of BOQ budget versus actual WIR values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">BOQ Category</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Budget Amount</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actual Amount</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Variance</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">% Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boqCategoryData.map((item, index) => {
                        const percentVariance = item.boqAmount > 0 ? 
                          ((item.variance / item.boqAmount) * 100).toFixed(1) : 
                          'N/A';
                        
                        return (
                          <TableRow key={index} className="hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-900 max-w-[200px] truncate">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatter.format(item.boqAmount)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatter.format(item.wirAmount)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={item.variance >= 0 ? 'text-red-600' : 'text-green-600'}>
                                {formatter.format(Math.abs(item.variance))}
                                {item.variance >= 0 ? ' over' : ' under'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={item.variance >= 0 ? 'text-red-600' : 'text-green-600'}>
                                {percentVariance !== 'N/A' ? `${percentVariance}%` : 'N/A'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personnel" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Contractor Performance Analysis</CardTitle>
                  <CardDescription>Performance metrics and financial impact by contractor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Contractor</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Approved</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Conditional</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Rejected</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Total Value</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractorComparisonData.map((item, index) => {
                          const totalWirs = item.approved + item.conditional + item.rejected;
                          const approvalRate = totalWirs > 0 ? 
                            ((item.approved / totalWirs) * 100).toFixed(1) + '%' :
                            'N/A';
                          
                          return (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {item.approved}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {item.conditional}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.rejected}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatter.format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                <span className={`${parseFloat(approvalRate) >= 70 ? 'text-green-600' : parseFloat(approvalRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {approvalRate}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Engineer Performance Analysis</CardTitle>
                  <CardDescription>Review efficiency and decision patterns by engineer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold text-slate-700">Engineer</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Approved</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Conditional</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Rejected</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Total Value</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Approval Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engineerComparisonData.map((item, index) => {
                          const totalWirs = item.approved + item.conditional + item.rejected;
                          const approvalRate = totalWirs > 0 ? 
                            ((item.approved / totalWirs) * 100).toFixed(1) + '%' :
                            'N/A';
                          
                          return (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {item.approved}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {item.conditional}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.rejected}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatter.format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                <span className={`${parseFloat(approvalRate) >= 70 ? 'text-green-600' : parseFloat(approvalRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {approvalRate}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
