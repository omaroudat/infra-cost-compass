
import React, { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, CheckCircle, RotateCcw, Printer, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/StatusBadge';
import WIRPrintView from './WIRPrintView';

interface WIRTableProps {
  wirs: WIR[];
  flattenedBOQItems: BOQItem[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (wir: WIR) => void;
  onDelete: (id: string) => void;
  onSubmitResult?: (wir: WIR) => void;
  onRevisionRequest?: (wir: WIR) => void;
}

const WIRTable: React.FC<WIRTableProps> = ({
  wirs,
  flattenedBOQItems,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onSubmitResult,
  onRevisionRequest,
}) => {
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedWIR, setSelectedWIR] = useState<WIR | null>(null);

  const getBOQItemName = (boqItemId: string) => {
    const item = flattenedBOQItems.find(item => item.id === boqItemId);
    return item ? `${item.code} - ${item.description}` : 'Unknown BOQ Item';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getApprovedAmount = (wir: WIR): number => {
    if (wir.result === 'A' || wir.result === 'B') {
      return wir.calculatedAmount || wir.value || 0;
    }
    return 0;
  };

  const handlePrint = (wir: WIR) => {
    setSelectedWIR(wir);
    setPrintDialogOpen(true);
  };

  const handlePrintNow = () => {
    window.print();
  };

  // Check if a WIR can have a revision requested
  const canRequestRevision = (wir: WIR) => {
    // Can only request revision for completed WIRs with result 'C' (rejected)
    if (wir.status !== 'completed' || wir.result !== 'C') {
      return false;
    }
    
    // Check if this WIR already has revisions
    const hasRevisions = wirs.some(w => w.parentWIRId === wir.id);
    return !hasRevisions;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WIR ID</TableHead>
              <TableHead>BOQ Item</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Approved Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wirs.map((wir) => {
              const approvedAmount = getApprovedAmount(wir);
              
              return (
                <TableRow key={wir.id}>
                  <TableCell className="font-medium">{wir.id}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {getBOQItemName(wir.boqItemId)}
                  </TableCell>
                  <TableCell>{wir.contractor}</TableCell>
                  <TableCell>{wir.engineer}</TableCell>
                  <TableCell>{wir.region}</TableCell>
                  <TableCell>{formatCurrency(wir.value || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={wir.status === 'completed' ? 'default' : 'secondary'}>
                      {wir.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {wir.result ? <StatusBadge status={wir.result} /> : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">
                      {approvedAmount > 0 ? formatCurrency(approvedAmount) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Print button for submitted WIRs */}
                      {wir.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(wir)}
                          className="h-8 w-8 p-0"
                          title="Print WIR"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(wir)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canEdit && wir.status === 'submitted' && onSubmitResult && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSubmitResult(wir)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                          title="Submit Result"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canEdit && canRequestRevision(wir) && onRevisionRequest && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRevisionRequest(wir)}
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                          title="Request Revision"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(wir.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-none print:overflow-visible print:max-h-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center justify-between">
              <span>Print WIR - {selectedWIR?.id}</span>
              <Button onClick={handlePrintNow} className="ml-4">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedWIR && (
            <WIRPrintView wir={selectedWIR} flattenedBOQItems={flattenedBOQItems} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WIRTable;
