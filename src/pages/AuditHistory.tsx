import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditDetailsDialog } from '@/components/audit/AuditDetailsDialog';
import { useAuditLogs, AuditLogFilters, AuditLog } from '@/hooks/useAuditLogs';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const AuditHistory: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { logs, isLoading, total, fetchLogs, exportLogs } = useAuditLogs();
  
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Check admin permission
  if (!hasPermission('admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    fetchLogs(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = await exportLogs(filters);
      if (!data) return;

      // Transform data for Excel
      const excelData = data.map(log => ({
        'Timestamp': new Date(log.created_at).toLocaleString(),
        'User ID': log.user_id || '-',
        'Username': log.username || 'Unknown',
        'Action': log.action,
        'Resource Type': log.resource_type,
        'Resource ID': log.resource_id || '-',
        'Details': log.details ? JSON.stringify(log.details) : '-',
        'IP Address': log.ip_address || '-',
        'User Agent': log.user_agent || '-'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Timestamp
        { wch: 15 }, // User ID
        { wch: 15 }, // Username
        { wch: 15 }, // Action
        { wch: 15 }, // Resource Type
        { wch: 25 }, // Resource ID
        { wch: 30 }, // Details
        { wch: 15 }, // IP Address
        { wch: 50 }, // User Agent
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');

      // Save file
      const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export audit logs');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Audit History</h1>
          <p className="text-muted-foreground mt-2">
            Track and monitor all system activities for security and compliance
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting || logs.length === 0}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Showing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(filters).filter(Boolean).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {filters.dateFrom || filters.dateTo 
                ? `${filters.dateFrom || 'All'} - ${filters.dateTo || 'Now'}`
                : 'All Time'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Logs Table */}
      <AuditTable
        logs={logs}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      {/* Details Dialog */}
      <AuditDetailsDialog
        log={selectedLog}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default AuditHistory;