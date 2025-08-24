import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import { WIR } from '../types';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Activity, Users, FileText, CheckCircle, Clock, XCircle, BarChart3, AlertCircle } from 'lucide-react';

type FilterCriteria = 'all' | 'contractor' | 'engineer';

const Dashboard = () => {
  const { wirs, boqItems } = useAppContext();
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>('all');
  const [selectedValue, setSelectedValue] = useState<string>('');
  
  const financialSummary = generateFinancialSummary(wirs);
  
  // Always use English number formatting for executives
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
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
  
  // Calculate totals
  const totalApprovedAmount = filteredWirs.reduce((sum, w) => sum + getApprovedAmount(w), 0);
  const totalConditionalAmount = filteredWirs.reduce((sum, w) => sum + getConditionalAmount(w), 0);
  const totalProjectValue = totalApprovedAmount + totalConditionalAmount;
  
  const statusData = [
    { name: 'Approved', value: filteredWirs.filter(w => w.result === 'A').length, color: '#10b981', amount: totalApprovedAmount },
    { name: 'Conditional', value: filteredWirs.filter(w => w.result === 'B').length, color: '#f59e0b', amount: totalConditionalAmount },
    { name: 'Rejected', value: filteredWirs.filter(w => w.result === 'C').length, color: '#ef4444', amount: 0 },
  ];
  
  const boqCategoryData = boqItems.map(item => ({
    name: item.description,
    amount: item.children ? item.children.reduce((sum, child) => sum + (child.quantity * child.unitRate), 0) : (item.quantity * item.unitRate)
  }));
  
  const wirStatusData = filteredWirs
    .filter(wir => (wir.calculatedAmount !== null && wir.calculatedAmount > 0) || (wir.value && wir.value > 0))
    .map(wir => ({
      name: wir.description.length > 20 ? wir.description.substring(0, 20) + '...' : wir.description,
      value: wir.calculatedAmount || wir.value || 0
    }));
  
  // Data for contractor/engineer performance
  const contractorData = contractors.map(contractor => {
    const contractorWirs = wirs.filter(w => w.contractor === contractor);
    return {
      name: contractor,
      approved: contractorWirs.filter(w => w.result === 'A').length,
      conditional: contractorWirs.filter(w => w.result === 'B').length,
      rejected: contractorWirs.filter(w => w.result === 'C').length,
      total: contractorWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
    };
  });
  
  const engineerData = engineers.map(engineer => {
    const engineerWirs = wirs.filter(w => w.engineer === engineer);
    return {
      name: engineer,
      approved: engineerWirs.filter(w => w.result === 'A').length,
      conditional: engineerWirs.filter(w => w.result === 'B').length,
      rejected: engineerWirs.filter(w => w.result === 'C').length,
      total: engineerWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
    };
  });
  
  const handleFilterChange = (value: FilterCriteria) => {
    setFilterCriteria(value);
    setSelectedValue('');
  };
  
  // Calculate performance metrics
  const totalBOQValue = boqCategoryData.reduce((sum, item) => sum + item.amount, 0);
  const completionRate = totalBOQValue > 0 ? (totalProjectValue / totalBOQValue) * 100 : 0;
  const approvalRate = filteredWirs.length > 0 ? (filteredWirs.filter(w => w.result === 'A').length / filteredWirs.length) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Dashboard</h1>
              <p className="text-slate-600 text-lg">Real-time project performance monitoring</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Live Data</span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in interactive-hover">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-emerald-700 text-sm font-semibold">Total Approved Value</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900 ltr-numbers mb-1">
                      {formatter.format(totalProjectValue)}
                    </p>
                    <p className="text-xs text-emerald-600">Combined approved & conditional</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-200">
                  <div className="text-center">
                    <p className="text-xs text-emerald-600 mb-1">Approved</p>
                    <p className="text-sm font-bold text-emerald-800 ltr-numbers">
                      {formatter.format(totalApprovedAmount)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-emerald-600 mb-1">Conditional</p>
                    <p className="text-sm font-bold text-emerald-800 ltr-numbers">
                      {formatter.format(totalConditionalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in interactive-hover">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-red-700 text-sm font-semibold">Rejected WIRs</p>
                    </div>
                    <p className="text-2xl font-bold text-red-900 ltr-numbers mb-1">
                      {filteredWirs.filter(w => w.result === 'C').length}
                    </p>
                    <p className="text-xs text-red-600">Require immediate attention</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="pt-3 border-t border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Status</span>
                    <span className="text-xs font-medium text-red-800">Needs Review</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in interactive-hover">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-blue-700 text-sm font-semibold">Project Completion</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 ltr-numbers mb-1">
                      {completionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-blue-600">Based on BOQ value completion</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">BOQ Value</span>
                    <span className="text-xs font-medium text-blue-800">Total Progress</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in interactive-hover">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <p className="text-violet-700 text-sm font-semibold">Total WIRs</p>
                    </div>
                    <p className="text-2xl font-bold text-violet-900 ltr-numbers mb-1">
                      {filteredWirs.length}
                    </p>
                    <p className="text-xs text-violet-600">Work Inspection Requests</p>
                  </div>
                  <div className="p-3 bg-violet-100 rounded-full flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
                <div className="pt-3 border-t border-violet-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-violet-600">Approval Rate</span>
                    <span className="text-xs font-medium text-violet-800 ltr-numbers">{approvalRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filter Section */}
        <Card className="bg-white shadow-elegant border border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Dashboard Filters</h3>
                  <p className="text-sm text-slate-600">Customize your dashboard view</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-0 flex-1 lg:flex-initial lg:justify-end">
                <Select value={filterCriteria} onValueChange={(value: FilterCriteria) => handleFilterChange(value)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11">
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
                    <SelectTrigger className="w-full sm:w-[220px] h-11">
                      <SelectValue placeholder="Select Contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractors.map((contractor) => (
                        <SelectItem key={contractor} value={contractor}>
                          <span className="truncate">{contractor}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {filterCriteria === 'engineer' && (
                  <Select value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger className="w-full sm:w-[220px] h-11">
                      <SelectValue placeholder="Select Engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.map((engineer) => (
                        <SelectItem key={engineer} value={engineer}>
                          <span className="truncate">{engineer}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-slate-100 p-1 rounded-lg gap-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Project</span>
              <span className="sm:hidden">Project</span>
              <span className="ml-1">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contractors" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Contractor</span>
              <span className="sm:hidden">Contract</span>
              <span className="ml-1">Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="engineers" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-4 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Engineer</span>
              <span className="sm:hidden">Engineer</span>
              <span className="ml-1">Performance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900">WIR Value Analysis</CardTitle>
                  <CardDescription>Financial breakdown of work inspection requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wirStatusData.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" />
                        <Tooltip formatter={(value: any) => {
                          const numValue = typeof value === 'number' ? value : Number(value);
                          return [formatter.format(numValue), 'Amount'];
                        }} />
                        <Bar name="WIR Value" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm border border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900">Status Distribution</CardTitle>
                  <CardDescription>Approval status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
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
          
          <TabsContent value="contractors" className="mt-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Contractor Performance Metrics</CardTitle>
                <CardDescription>Comprehensive analysis of contractor efficiency and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contractorData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} stroke="#64748b" />
                      <YAxis yAxisId="left" orientation="left" stroke="#64748b" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip formatter={(value: any, name) => {
                        if (name === 'total') {
                          return [formatter.format(value as number), 'Total Amount'];
                        }
                        const nameStr = name ? name.toString() : '';
                        return [value, nameStr.charAt(0).toUpperCase() + nameStr.slice(1) + ' WIRs'];
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="left" dataKey="conditional" name="Conditional" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="left" dataKey="rejected" name="Rejected" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="right" dataKey="total" name="Total Amount" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engineers" className="mt-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Engineer Performance Metrics</CardTitle>
                <CardDescription>Review efficiency and decision patterns by engineering team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engineerData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} stroke="#64748b" />
                      <YAxis yAxisId="left" orientation="left" stroke="#64748b" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip formatter={(value: any, name) => {
                        if (name === 'total') {
                          return [formatter.format(value as number), 'Total Amount'];
                        }
                        const nameStr = name ? name.toString() : '';
                        return [value, nameStr.charAt(0).toUpperCase() + nameStr.slice(1) + ' WIRs'];
                      }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="approved" name="Approved" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="left" dataKey="conditional" name="Conditional" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="left" dataKey="rejected" name="Rejected" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      <Bar yAxisId="right" dataKey="total" name="Total Amount" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Recent WIRs Table */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Recent Work Inspection Requests</CardTitle>
            <CardDescription>Latest submissions and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">ID</TableHead>
                    <TableHead className="font-semibold text-slate-700">Description</TableHead>
                    <TableHead className="font-semibold text-slate-700">Contractor</TableHead>
                    <TableHead className="font-semibold text-slate-700">Engineer</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWirs.slice(0, 8).map((wir) => {
                    const boqItem = boqItems.flatMap(item => 
                      [item, ...(item.children || [])]
                    ).find(item => item.id === wir.boqItemId);
                    
                    return (
                      <TableRow key={wir.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{wir.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium text-slate-900 truncate">{wir.description}</div>
                            <div className="text-sm text-slate-500 truncate">{boqItem?.description || 'Unknown BOQ Item'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">{wir.contractor}</TableCell>
                        <TableCell className="text-slate-700">{wir.engineer}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                            ${wir.result === 'A' ? 'bg-green-100 text-green-800' : 
                              wir.result === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                              wir.result === 'C' ? 'bg-red-100 text-red-800' :
                              wir.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              wir.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {wir.result === 'A' ? 'Approved' : 
                             wir.result === 'B' ? 'Conditional' : 
                             wir.result === 'C' ? 'Rejected' :
                             wir.status === 'submitted' ? 'Submitted' :
                             wir.status === 'completed' ? 'Completed' : 'Unknown'}
                          </span>
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
      </div>
    </div>
  );
};

export default Dashboard;
