import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateFinancialSummary } from '../utils/calculations';
import { WIR } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, XCircle, FileText, Download, AlertCircle, BarChart3 } from 'lucide-react';

type FilterEntity = 'all' | 'contractor' | 'engineer';

const Reports = () => {
  const { wirs, boqItems } = useAppContext();
  const [reportType, setReportType] = useState('financial');
  const [filterEntity, setFilterEntity] = useState<FilterEntity>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [showPendingWIRs, setShowPendingWIRs] = useState(false);
  
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
  const totalPendingCount = filteredWirs.filter(w => w.status === 'submitted' && !w.result).length;
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
  
  // Contractor and Engineer comparison data with corrected success rate calculation
  const contractorComparisonData = contractors.map(contractor => {
    const contractorWirs = wirs.filter(w => w.contractor === contractor);
    const approvedCount = contractorWirs.filter(w => w.result === 'A').length;
    const conditionalCount = contractorWirs.filter(w => w.result === 'B').length;
    const rejectedCount = contractorWirs.filter(w => w.result === 'C').length;
    const totalCount = contractorWirs.length;
    const successRate = totalCount > 0 ? ((approvedCount + conditionalCount) / totalCount) * 100 : 0;
    
    // Debug logging
    console.log(`Contractor: ${contractor}`);
    console.log(`Total WIRs: ${totalCount}, Approved: ${approvedCount}, Conditional: ${conditionalCount}, Rejected: ${rejectedCount}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    return {
      name: contractor,
      approved: approvedCount,
      conditional: conditionalCount,
      rejected: rejectedCount,
      totalAmount: contractorWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
      successRate,
    };
  });
  
  const engineerComparisonData = engineers.map(engineer => {
    const engineerWirs = wirs.filter(w => w.engineer === engineer);
    const approvedCount = engineerWirs.filter(w => w.result === 'A').length;
    const conditionalCount = engineerWirs.filter(w => w.result === 'B').length;
    const rejectedCount = engineerWirs.filter(w => w.result === 'C').length;
    const totalCount = engineerWirs.length;
    const successRate = totalCount > 0 ? ((approvedCount + conditionalCount) / totalCount) * 100 : 0;
    
    // Debug logging
    console.log(`Engineer: ${engineer}`);
    console.log(`Total WIRs: ${totalCount}, Approved: ${approvedCount}, Conditional: ${conditionalCount}, Rejected: ${rejectedCount}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    return {
      name: engineer,
      approved: approvedCount,
      conditional: conditionalCount,
      rejected: rejectedCount,
      totalAmount: engineerWirs.reduce((sum, w) => sum + (getApprovedAmount(w) + getConditionalAmount(w)), 0),
      successRate,
    };
  });
  
  // Function to export report
  const handleExport = async () => {
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx');
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['Report Type', reportType],
        ['Generated Date', new Date().toLocaleDateString()],
        ['Filter', filterEntity === 'all' ? 'All WIRs' : `${filterEntity}: ${selectedEntity}`],
        [''],
        ['KEY PERFORMANCE INDICATORS'],
        ['Metric', 'Value'],
        ['Total Approved Value', formatter.format(totalProjectValue)],
        ['Approved Amount', formatter.format(totalApprovedAmount)],
        ['Conditional Amount', formatter.format(totalConditionalAmount)],
        ['Rejected WIRs', totalRejectedCount],
        ['Pending WIRs', totalPendingCount],
        ['Project Completion', `${completionRate.toFixed(1)}%`],
        ['Success Rate', `${approvalRate.toFixed(1)}%`],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // WIR Details Sheet
      const wirHeaders = [
        'WIR Number', 'Description', 'Contractor', 'Engineer', 
        'Region', 'Value (SAR)', 'Result', 'Status', 'Submittal Date'
      ];
      
      const wirData = [
        wirHeaders,
        ...filteredWirs.map(wir => [
          wir.wirNumber,
          wir.description,
          wir.contractor || '',
          wir.engineer || '',
          wir.region || '',
          wir.calculatedAmount || wir.value || 0,
          wir.result === 'A' ? 'Approved' : wir.result === 'B' ? 'Conditional' : wir.result === 'C' ? 'Rejected' : 'Pending',
          wir.status,
          wir.submittalDate ? formatDate(wir.submittalDate) : ''
        ])
      ];
      
      const wirSheet = XLSX.utils.aoa_to_sheet(wirData);
      XLSX.utils.book_append_sheet(workbook, wirSheet, 'WIR Details');

      // BOQ Variance Sheet
      const boqHeaders = ['BOQ Item', 'BOQ Amount (SAR)', 'WIR Amount (SAR)', 'Variance (SAR)', 'Variance %'];
      const boqData = [
        boqHeaders,
        ...boqCategoryData.map(item => [
          item.name,
          item.boqAmount,
          item.wirAmount,
          item.variance,
          item.boqAmount > 0 ? ((item.variance / item.boqAmount) * 100).toFixed(1) + '%' : '0%'
        ])
      ];
      
      const boqSheet = XLSX.utils.aoa_to_sheet(boqData);
      XLSX.utils.book_append_sheet(workbook, boqSheet, 'BOQ Variance');

      // Contractor Performance Sheet
      if (contractorComparisonData.length > 0) {
        const contractorHeaders = [
          'Contractor', 'Approved WIRs', 'Conditional WIRs', 'Rejected WIRs', 
          'Total Amount (SAR)', 'Success Rate (%)'
        ];
        
        const contractorData = [
          contractorHeaders,
          ...contractorComparisonData.map(contractor => [
            contractor.name,
            contractor.approved,
            contractor.conditional,
            contractor.rejected,
            contractor.totalAmount,
            contractor.successRate.toFixed(1)
          ])
        ];
        
        const contractorSheet = XLSX.utils.aoa_to_sheet(contractorData);
        XLSX.utils.book_append_sheet(workbook, contractorSheet, 'Contractor Performance');
      }

      // Engineer Performance Sheet
      if (engineerComparisonData.length > 0) {
        const engineerHeaders = [
          'Engineer', 'Approved WIRs', 'Conditional WIRs', 'Rejected WIRs', 
          'Total Amount (SAR)', 'Success Rate (%)'
        ];
        
        const engineerData = [
          engineerHeaders,
          ...engineerComparisonData.map(engineer => [
            engineer.name,
            engineer.approved,
            engineer.conditional,
            engineer.rejected,
            engineer.totalAmount,
            engineer.successRate.toFixed(1)
          ])
        ];
        
        const engineerSheet = XLSX.utils.aoa_to_sheet(engineerData);
        XLSX.utils.book_append_sheet(workbook, engineerSheet, 'Engineer Performance');
      }

      // Pending WIRs Sheet (if any)
      if (pendingWirs.length > 0) {
        const pendingHeaders = [
          'WIR Number', 'Description', 'Contractor', 'Engineer', 
          'Region', 'Value (SAR)', 'Days Pending', 'Submittal Date'
        ];
        
        const pendingData = [
          pendingHeaders,
          ...pendingWirs.map(wir => {
            const submittedDate = new Date(wir.submittalDate || '');
            const daysPending = Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return [
              wir.wirNumber,
              wir.description,
              wir.contractor || '',
              wir.engineer || '',
              wir.region || '',
              wir.calculatedAmount || wir.value || 0,
              daysPending,
              wir.submittalDate ? formatDate(wir.submittalDate) : ''
            ];
          })
        ];
        
        const pendingSheet = XLSX.utils.aoa_to_sheet(pendingData);
        XLSX.utils.book_append_sheet(workbook, pendingSheet, 'Pending WIRs');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Khuzam_Project_Report_${reportType}_${timestamp}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };
  
  const handleFilterChange = (value: FilterEntity) => {
    setFilterEntity(value);
    setSelectedEntity('');
  };
  
  const totalBOQValue = boqCategoryData.reduce((sum, item) => sum + item.boqAmount, 0);
  const completionRate = totalBOQValue > 0 ? (totalProjectValue / totalBOQValue) * 100 : 0;
  const approvalRate = filteredWirs.length > 0 ? ((filteredWirs.filter(w => w.result === 'A').length + filteredWirs.filter(w => w.result === 'B').length) / filteredWirs.length) * 100 : 0;
  
  // Get pending WIRs for display
  const pendingWirs = wirs.filter(w => w.status === 'submitted' && !w.result);
  
  // Handle pending WIRs click
  const handlePendingClick = () => {
    setShowPendingWIRs(!showPendingWIRs);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
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
                    <p className="text-2xl font-bold text-red-900 ltr-numbers mb-1">{totalRejectedCount}</p>
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
          
          <Card 
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in interactive-hover cursor-pointer group" 
            onClick={handlePendingClick}
          >
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-amber-700 text-sm font-semibold">Pending WIRs</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-900 ltr-numbers mb-1">{totalPendingCount}</p>
                    <p className="text-xs text-amber-600">Click to view details</p>
                  </div>
                  <div className="p-3 bg-amber-100 group-hover:bg-amber-200 rounded-full flex-shrink-0 transition-colors duration-200">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="pt-3 border-t border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600">Status</span>
                    <span className="text-xs font-medium text-amber-800">Awaiting Review</span>
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
                    <p className="text-2xl font-bold text-blue-900 ltr-numbers mb-1">{completionRate.toFixed(1)}%</p>
                    <p className="text-xs text-blue-600">Based on BOQ value completion</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
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
                      <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <p className="text-violet-700 text-sm font-semibold">Success Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-violet-900 ltr-numbers mb-1">{approvalRate.toFixed(1)}%</p>
                    <p className="text-xs text-violet-600">Approved + Conditional WIRs</p>
                  </div>
                  <div className="p-3 bg-violet-100 rounded-full flex-shrink-0">
                    <FileText className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
                <div className="pt-3 border-t border-violet-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-violet-600">Quality</span>
                    <span className="text-xs font-medium text-violet-800">Overall Rating</span>
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
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Analysis Filters</h3>
                  <p className="text-sm text-slate-600">Customize your report view</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-0 flex-1 lg:flex-initial lg:justify-end">
                <Select value={filterEntity} onValueChange={(value: FilterEntity) => handleFilterChange(value)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11">
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
                
                {filterEntity === 'engineer' && (
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
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
        
        {/* Pending WIRs Table */}
        {showPendingWIRs && (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Pending WIRs ({pendingWirs.length})
              </CardTitle>
              <CardDescription>Work Inspection Requests awaiting review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WIR Number</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Submittal Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingWirs.length > 0 ? (
                      pendingWirs.map((wir) => (
                        <TableRow key={wir.id}>
                          <TableCell className="font-medium">{wir.wirNumber || wir.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{wir.description}</TableCell>
                          <TableCell>{wir.contractor}</TableCell>
                          <TableCell>{wir.engineer}</TableCell>
                          <TableCell>{wir.region}</TableCell>
                          <TableCell>{formatCurrency(wir.value)}</TableCell>
                          <TableCell>{formatDate(wir.submittalDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {wir.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No pending WIRs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tabbed Content */}
        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-slate-100 p-1 rounded-lg gap-1">
            <TabsTrigger 
              value="executive" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Executive</span>
              <span className="sm:hidden">Exec</span>
              <span className="hidden lg:inline ml-1">Summary</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
              <span className="hidden lg:inline ml-1">Charts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="detailed" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Detailed</span>
              <span className="sm:hidden">Detail</span>
              <span className="hidden lg:inline ml-1">Analysis</span>
            </TabsTrigger>
            <TabsTrigger 
              value="budget" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Budget</span>
              <span className="sm:hidden">Budg</span>
              <span className="hidden lg:inline ml-1">Variance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 py-2.5 h-auto whitespace-nowrap"
            >
              <span className="hidden sm:inline">Team</span>
              <span className="sm:hidden">Team</span>
              <span className="hidden lg:inline ml-1">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="mt-6">
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
          
          <TabsContent value="performance" className="mt-6">
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
          
          <TabsContent value="detailed" className="mt-6">
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
          
          <TabsContent value="budget" className="mt-6">
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
          
          <TabsContent value="team" className="mt-6">
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
                          <TableHead className="font-semibold text-slate-700 text-center">Approved (A)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Conditional (B)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Rejected (C)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Total Value</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractorComparisonData.map((item, index) => {
                          const successRateFormatted = item.successRate.toFixed(1) + '%';
                          
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
                                <span className={`${item.successRate >= 70 ? 'text-green-600' : item.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {successRateFormatted}
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
                          <TableHead className="font-semibold text-slate-700 text-center">Approved (A)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Conditional (B)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-center">Rejected (C)</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Total Value</TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engineerComparisonData.map((item, index) => {
                          const successRateFormatted = item.successRate.toFixed(1) + '%';
                          
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
                                <span className={`${item.successRate >= 70 ? 'text-green-600' : item.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {successRateFormatted}
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
