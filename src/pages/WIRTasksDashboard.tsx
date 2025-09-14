import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { WIR } from '@/types';

const WIRTasksDashboard = () => {
  const { wirs, loading } = useAppContext();

  const completedWIRs = useMemo(() => {
    return wirs.filter(wir => wir.result && wir.result !== null);
  }, [wirs]);

  const averageItemsWorkDays = useMemo(() => {
    const validWIRs = completedWIRs.filter(wir => wir.startTaskOnSite);
    if (validWIRs.length === 0) return 0;
    
    const totalDays = validWIRs.reduce((sum, wir) => {
      const days = calculateItemsWorkDays(wir);
      return sum + (days || 0);
    }, 0);
    
    return Math.round(totalDays / validWIRs.length);
  }, [completedWIRs]);

  const averageWIRApprovedDays = useMemo(() => {
    const validWIRs = completedWIRs.filter(wir => wir.submittalDate);
    if (validWIRs.length === 0) return 0;
    
    const totalDays = validWIRs.reduce((sum, wir) => {
      const days = calculateWIRApprovedDays(wir);
      return sum + (days || 0);
    }, 0);
    
    return Math.round(totalDays / validWIRs.length);
  }, [completedWIRs]);

  const calculateItemsWorkDays = (wir: WIR) => {
    if (!wir.startTaskOnSite || !wir.result) {
      return null;
    }
    
    const startDate = new Date(wir.startTaskOnSite);
    const resultDate = new Date(); // Assuming result completion is now - you might want to add a result_date field
    
    return differenceInDays(resultDate, startDate);
  };

  const calculateWIRApprovedDays = (wir: WIR) => {
    if (!wir.submittalDate || !wir.result) {
      return null;
    }
    
    const submittalDate = new Date(wir.submittalDate);
    const resultDate = new Date(); // Assuming result completion is now - you might want to add a result_date field
    
    return differenceInDays(resultDate, submittalDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'C':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WIR Tasks Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track work completion times and approval durations for completed WIRs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Completed WIRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWIRs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Items Work Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageItemsWorkDays} days
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg WIR Approved Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageWIRApprovedDays} days
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved WIRs (A)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedWIRs.filter(wir => wir.result === 'A').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WIR Tasks Performance</CardTitle>
          <CardDescription>
            Detailed view of work completion times and approval durations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WIR Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Start Task Date</TableHead>
                  <TableHead>Submittal Date</TableHead>
                  <TableHead>Items Work Days</TableHead>
                  <TableHead>WIR Approved Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedWIRs.map((wir) => {
                  const itemsWorkDays = calculateItemsWorkDays(wir);
                  const wirApprovedDays = calculateWIRApprovedDays(wir);
                  
                  return (
                    <TableRow key={wir.id}>
                      <TableCell className="font-medium">{wir.wirNumber}</TableCell>
                      <TableCell className="max-w-xs truncate" title={wir.description}>
                        {wir.description}
                      </TableCell>
                      <TableCell>{wir.contractor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(wir.status)}>
                          {wir.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getResultColor(wir.result || '')}>
                          {getResultLabel(wir.result || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wir.startTaskOnSite 
                          ? new Date(wir.startTaskOnSite).toLocaleDateString()
                          : 'Not set'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(wir.submittalDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {itemsWorkDays !== null ? (
                            <span className={`font-semibold ${itemsWorkDays > 30 ? 'text-red-600' : itemsWorkDays > 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {itemsWorkDays} days
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {wirApprovedDays !== null ? (
                            <span className={`font-semibold ${wirApprovedDays > 14 ? 'text-red-600' : wirApprovedDays > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {wirApprovedDays} days
                            </span>
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
          {completedWIRs.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No completed WIRs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WIRTasksDashboard;