import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AuditLog } from '@/hooks/useAuditLogs';

interface AuditDetailsDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuditDetailsDialog: React.FC<AuditDetailsDialogProps> = ({
  log,
  open,
  onOpenChange
}) => {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
              <p className="font-mono text-sm">
                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">User</label>
              <p className="font-medium">{log.username || 'Unknown'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Action</label>
              <Badge className="mt-1">
                {log.action.replace('_', ' ')}
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Resource Type</label>
              <p className="font-medium">{log.resource_type.replace('_', ' ')}</p>
            </div>
          </div>

          {log.resource_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Resource ID</label>
              <p className="font-mono text-sm break-all">{log.resource_id}</p>
            </div>
          )}

          <Separator />

          {/* Technical Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Technical Information</h4>
            
            {log.user_agent && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                <p className="text-sm break-all">{log.user_agent}</p>
              </div>
            )}

            {log.ip_address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                <p className="font-mono text-sm">{log.ip_address}</p>
              </div>
            )}
          </div>

          {/* Details */}
          {log.details && Object.keys(log.details).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Additional Details</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};