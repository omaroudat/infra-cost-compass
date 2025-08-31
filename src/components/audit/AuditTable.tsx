import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { AuditLog } from '@/hooks/useAuditLogs';
import { Card, CardContent } from '@/components/ui/card';

interface AuditTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  onViewDetails: (log: AuditLog) => void;
}

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'LOGIN_SUCCESS':
      return 'default';
    case 'LOGIN_FAILED':
      return 'destructive';
    case 'LOGOUT':
      return 'secondary';
    case 'CREATE':
      return 'default';
    case 'UPDATE':
      return 'default';
    case 'DELETE':
      return 'destructive';
    case 'APPROVAL':
      return 'default';
    default:
      return 'outline';
  }
};

const getResourceTypeColor = (resourceType: string) => {
  const colors: Record<string, string> = {
    'AUTH': 'text-blue-600',
    'WIR': 'text-green-600', 
    'BOQ_ITEM': 'text-purple-600',
    'BREAKDOWN_ITEM': 'text-orange-600',
    'CONTRACTOR': 'text-cyan-600',
    'ENGINEER': 'text-pink-600',
    'ATTACHMENT': 'text-yellow-600',
    'USER': 'text-red-600'
  };
  return colors[resourceType] || 'text-gray-600';
};

export const AuditTable: React.FC<AuditTableProps> = ({
  logs,
  isLoading,
  onViewDetails
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading audit logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No audit logs found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Resource ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      {log.username || 'Unknown'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className={`font-medium ${getResourceTypeColor(log.resource_type)}`}>
                      {log.resource_type.replace('_', ' ')}
                    </span>
                  </TableCell>
                  
                  <TableCell className="font-mono text-sm">
                    {log.resource_id ? (
                      <span className="truncate max-w-[100px] block">
                        {log.resource_id}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <Badge variant="outline">
                        {Object.keys(log.details).length} field(s)
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};