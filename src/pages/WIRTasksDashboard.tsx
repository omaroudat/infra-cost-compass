import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { differenceInDays } from 'date-fns';
import { ArrowUpDown, Calendar, TrendingUp, BarChart3, Download, RefreshCw } from 'lucide-react';
import { WIR } from '@/types';
import { WIRTaskFilters } from '@/components/wir/WIRTaskFilters';
import { WIRTaskMetricsCards } from '@/components/wir/WIRTaskMetricsCards';

const WIRTasksDashboard = () => {
  const { wirs, loading } = useAppContext();
  
  const [filters, setFilters] = useState({
    search: '',
    contractor: '',
    engineer: '',
    result: '',
    dateFrom: '',
    dateTo: '',
    workDaysMin: '',
    workDaysMax: '',
    approvalDaysMin: '',
    approvalDaysMax: ''
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const completedWIRs = useMemo(() => {
    return wirs.filter(wir => wir.result && wir.result !== null);
  }, [wirs]);

  // Get unique values for filters
  const uniqueContractors = useMemo(() => {
    return Array.from(new Set(completedWIRs.map(wir => wir.contractor))).filter(Boolean).sort();
  }, [completedWIRs]);

  const uniqueEngineers = useMemo(() => {
    return Array.from(new Set(completedWIRs.map(wir => wir.engineer))).filter(Boolean).sort();
  }, [completedWIRs]);

  // Filter WIRs based on current filters
  const filteredWIRs = useMemo(() => {
    return completedWIRs.filter(wir => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          wir.wirNumber.toLowerCase().includes(searchLower) ||
          wir.description.toLowerCase().includes(searchLower) ||
          wir.contractor.toLowerCase().includes(searchLower) ||
          wir.engineer.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Contractor filter
      if (filters.contractor && wir.contractor !== filters.contractor) return false;

      // Engineer filter
      if (filters.engineer && wir.engineer !== filters.engineer) return false;

      // Result filter
      if (filters.result && wir.result !== filters.result) return false;

      // Date range filter
      if (filters.dateFrom) {
        const submittalDate = new Date(wir.submittalDate);
        const fromDate = new Date(filters.dateFrom);
        if (submittalDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const submittalDate = new Date(wir.submittalDate);
        const toDate = new Date(filters.dateTo);
        if (submittalDate > toDate) return false;
      }

      // Work days filter
      const itemsWorkDays = calculateItemsWorkDays(wir);
      if (filters.workDaysMin && itemsWorkDays !== null && itemsWorkDays < parseInt(filters.workDaysMin)) return false;
      if (filters.workDaysMax && itemsWorkDays !== null && itemsWorkDays > parseInt(filters.workDaysMax)) return false;

      // Approval days filter
      const wirApprovedDays = calculateWIRApprovedDays(wir);
      if (filters.approvalDaysMin && wirApprovedDays !== null && wirApprovedDays < parseInt(filters.approvalDaysMin)) return false;
      if (filters.approvalDaysMax && wirApprovedDays !== null && wirApprovedDays > parseInt(filters.approvalDaysMax)) return false;

      return true;
    });
  }, [completedWIRs, filters]);

  const averageItemsWorkDays = useMemo(() => {
    const validWIRs = filteredWIRs.filter(wir => wir.startTaskOnSite);
    if (validWIRs.length === 0) return 0;
    
    const totalDays = validWIRs.reduce((sum, wir) => {
      const days = calculateItemsWorkDays(wir);
      return sum + (days || 0);
    }, 0);
    
    return Math.round(totalDays / validWIRs.length);
  }, [filteredWIRs]);

  const averageWIRApprovedDays = useMemo(() => {
    const validWIRs = filteredWIRs.filter(wir => wir.submittalDate);
    if (validWIRs.length === 0) return 0;
    
    const totalDays = validWIRs.reduce((sum, wir) => {
      const days = calculateWIRApprovedDays(wir);
      return sum + (days || 0);
    }, 0);
    
    return Math.round(totalDays / validWIRs.length);
  }, [filteredWIRs]);

  // Sorting logic
  const sortedWIRs = useMemo(() => {
    if (!sortConfig) return filteredWIRs;

    return [...filteredWIRs].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortConfig.key) {
        case 'wirNumber':
          aValue = a.wirNumber;
          bValue = b.wirNumber;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'contractor':
          aValue = a.contractor;
          bValue = b.contractor;
          break;
        case 'submittalDate':
          aValue = new Date(a.submittalDate);
          bValue = new Date(b.submittalDate);
          break;
        case 'itemsWorkDays':
          aValue = calculateItemsWorkDays(a) || 0;
          bValue = calculateItemsWorkDays(b) || 0;
          break;
        case 'wirApprovedDays':
          aValue = calculateWIRApprovedDays(a) || 0;
          bValue = calculateWIRApprovedDays(b) || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredWIRs, sortConfig]);

  function calculateItemsWorkDays(wir: WIR) {
    if (!wir.startTaskOnSite || !wir.result) {
      return null;
    }
    
    const startDate = new Date(wir.startTaskOnSite);
    const resultDate = new Date(); // Assuming result completion is now - you might want to add a result_date field
    
    return differenceInDays(resultDate, startDate);
  }

  function calculateWIRApprovedDays(wir: WIR) {
    if (!wir.submittalDate || !wir.result) {
      return null;
    }
    
    const submittalDate = new Date(wir.submittalDate);
    const resultDate = new Date(); // Assuming result completion is now - you might want to add a result_date field
    
    return differenceInDays(resultDate, submittalDate);
  }

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Clear sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return (
        <ArrowUpDown 
          className={`h-4 w-4 ml-1 ${
            sortConfig.direction === 'asc' ? 'rotate-180' : ''
          } transition-transform`} 
        />
      );
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'submitted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getResultVariant = (result: string) => {
    switch (result) {
      case 'A':
        return 'default';
      case 'B':
        return 'secondary';
      case 'C':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'A':
        return 'Approved';
      case 'B':
        return 'Conditional';
      case 'C':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted/50 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted/30 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                WIR Tasks Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track work completion times and approval durations for completed WIRs
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <WIRTaskFilters
        filters={filters}
        onFiltersChange={setFilters}
        contractors={uniqueContractors}
        engineers={uniqueEngineers}
        wirs={completedWIRs}
      />

      {/* Metrics Cards */}
      <WIRTaskMetricsCards
        completedWIRs={completedWIRs}
        averageItemsWorkDays={averageItemsWorkDays}
        averageWIRApprovedDays={averageWIRApprovedDays}
        filteredWIRs={filteredWIRs}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {sortedWIRs.length} of {completedWIRs.length} completed WIRs
        </div>
        {sortConfig && (
          <div className="flex items-center gap-2">
            <span>Sorted by {sortConfig.key}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortConfig(null)}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/5">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                WIR Tasks Performance
              </CardTitle>
              <CardDescription>
                Detailed view of work completion times and approval durations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('wirNumber')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      WIR Number
                      {getSortIcon('wirNumber')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('description')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      Description
                      {getSortIcon('description')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('contractor')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      Contractor
                      {getSortIcon('contractor')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Start Task Date</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('submittalDate')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Submittal Date
                      {getSortIcon('submittalDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('itemsWorkDays')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      Items Work Days
                      {getSortIcon('itemsWorkDays')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('wirApprovedDays')}
                      className="group h-auto p-0 font-semibold justify-start"
                    >
                      WIR Approved Days
                      {getSortIcon('wirApprovedDays')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWIRs.map((wir, index) => {
                  const itemsWorkDays = calculateItemsWorkDays(wir);
                  const wirApprovedDays = calculateWIRApprovedDays(wir);
                  
                  return (
                    <TableRow 
                      key={wir.id} 
                      className={`hover:bg-muted/30 transition-colors ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      <TableCell className="font-medium">{wir.wirNumber}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={wir.description}>
                          {wir.description}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{wir.contractor}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(wir.status)}>
                          {wir.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getResultVariant(wir.result || '')}>
                          {getResultLabel(wir.result || '')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {wir.startTaskOnSite 
                          ? new Date(wir.startTaskOnSite).toLocaleDateString()
                          : 'Not set'
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(wir.submittalDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {itemsWorkDays !== null ? (
                            <Badge 
                              variant={itemsWorkDays > 30 ? 'destructive' : itemsWorkDays > 14 ? 'secondary' : 'default'}
                              className="font-semibold"
                            >
                              {itemsWorkDays} days
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {wirApprovedDays !== null ? (
                            <Badge 
                              variant={wirApprovedDays > 14 ? 'destructive' : wirApprovedDays > 7 ? 'secondary' : 'default'}
                              className="font-semibold"
                            >
                              {wirApprovedDays} days
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {sortedWIRs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground space-y-2">
                <BarChart3 className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-lg font-medium">No WIRs found</p>
                <p className="text-sm">Try adjusting your filters to see more results</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WIRTasksDashboard;