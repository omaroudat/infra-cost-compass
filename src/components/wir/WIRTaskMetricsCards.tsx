import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, XCircle, Calendar, BarChart3 } from 'lucide-react';
import { WIR } from '@/types';

interface WIRTaskMetricsCardsProps {
  completedWIRs: WIR[];
  averageItemsWorkDays: number;
  averageWIRApprovedDays: number;
  filteredWIRs: WIR[];
}

export const WIRTaskMetricsCards: React.FC<WIRTaskMetricsCardsProps> = ({
  completedWIRs,
  averageItemsWorkDays,
  averageWIRApprovedDays,
  filteredWIRs
}) => {
  const approvedCount = filteredWIRs.filter(wir => wir.result === 'A').length;
  const conditionalCount = filteredWIRs.filter(wir => wir.result === 'B').length;
  const rejectedCount = filteredWIRs.filter(wir => wir.result === 'C').length;
  
  const getPerformanceColor = (days: number, threshold1: number, threshold2: number) => {
    if (days <= threshold1) return 'text-success';
    if (days <= threshold2) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceIcon = (days: number, threshold1: number, threshold2: number) => {
    if (days <= threshold1) return <TrendingUp className="h-4 w-4 text-success" />;
    if (days <= threshold2) return <Clock className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {/* Total Completed WIRs */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Completed</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{filteredWIRs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            of {completedWIRs.length} total
          </div>
        </CardContent>
      </Card>

      {/* Average Items Work Days */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-background to-blue-100 dark:from-blue-950/20 dark:via-background dark:to-blue-900/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Work Days</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              {getPerformanceIcon(averageItemsWorkDays, 14, 30)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-2xl font-bold ${getPerformanceColor(averageItemsWorkDays, 14, 30)}`}>
            {averageItemsWorkDays} days
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Start to completion
          </div>
        </CardContent>
      </Card>

      {/* Average WIR Approved Days */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-background to-purple-100 dark:from-purple-950/20 dark:via-background dark:to-purple-900/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Approval Days</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              {getPerformanceIcon(averageWIRApprovedDays, 7, 14)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-2xl font-bold ${getPerformanceColor(averageWIRApprovedDays, 7, 14)}`}>
            {averageWIRApprovedDays} days
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Submit to approval
          </div>
        </CardContent>
      </Card>

      {/* Approved WIRs */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-50 via-background to-green-100 dark:from-green-950/20 dark:via-background dark:to-green-900/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved (A)</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {approvedCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {filteredWIRs.length > 0 ? Math.round((approvedCount / filteredWIRs.length) * 100) : 0}% success rate
          </div>
        </CardContent>
      </Card>

      {/* Conditional WIRs */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-yellow-50 via-background to-yellow-100 dark:from-yellow-950/20 dark:via-background dark:to-yellow-900/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conditional (B)</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {conditionalCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {filteredWIRs.length > 0 ? Math.round((conditionalCount / filteredWIRs.length) * 100) : 0}% conditional
          </div>
        </CardContent>
      </Card>

      {/* Rejected WIRs */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-red-50 via-background to-red-100 dark:from-red-950/20 dark:via-background dark:to-red-900/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected (C)</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {rejectedCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {filteredWIRs.length > 0 ? Math.round((rejectedCount / filteredWIRs.length) * 100) : 0}% rejected
          </div>
        </CardContent>
      </Card>
    </div>
  );
};