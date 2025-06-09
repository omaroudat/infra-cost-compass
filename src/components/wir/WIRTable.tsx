
import React, { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, CheckCircle, RotateCcw, Printer, Eye, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/StatusBadge';
import WIRPrintView from './WIRPrintView';
import { useAppContext } from '@/context/AppContext';
import { calculateWIRAmount } from '@/utils/calculations';

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
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [calculationDetails, setCalculationDetails] = useState<{wir: WIR, amount: number | null, equation: string} | null>(null);
  
  const { breakdownItems, boqItems } = useAppContext();

  const getBOQItemName = (boqItemId: string) => {
    const item = flattenedBOQItems.find(boq => boq.id === boqItemId);
    return item ? `${item.code} - ${item.description}` : boqItemId;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getApprovedAmount = (wir: WIR) => {
    if (wir.result === 'A' || wir.result === 'B') {
      const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems);
      return {
        amount: calculation.amount || 0,
        equation: calculation.equation || ''
      };
    }
    return { amount: 0, equation: '' };
  };

  const handlePrint = (wir: WIR) => {
    setSelectedWIR(wir);
    setPrintDialogOpen(true);
  };

  const handleShowCalculation = (wir: WIR) => {
    const calculation = calculateWIRAmount(wir, breakdownItems || [], boqItems);
    setCalculationDetails({
      wir,
      amount: calculation.amount,
      equation: calculation.equation
    });
    setCalculationDialogOpen(true);
  };

  const handlePrintNow = () => {
    window.print();
  };

  const canRequestRevision = (wir: WIR) => {
    return wir.status === 'completed' && wir.result === 'C';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WIR Number</TableHead>
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
              const approvedAmountData = getApprovedAmount(wir);
              
              return (
                <TableRow key={wir.id}>
                  <TableCell className="font-medium">{wir.wirNumber}</TableCell>
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
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        {approvedAmountData.amount > 0 ? formatCurrency(approvedAmountData.amount) : '-'}
                      </div>
                      {approvedAmountData.equation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowCalculation(wir)}
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                          title="Show calculation details"
                        >
                          <Calculator className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      )}
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
              <span>Print WIR - {selectedWIR?.wirNumber}</span>
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

      {/* Calculation Details Dialog */}
      <Dialog open={calculationDialogOpen} onOpenChange={setCalculationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculation Details - WIR {calculationDetails?.wir.wirNumber}
            </DialogTitle>
          </DialogHeader>
          {calculationDetails && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Approved Amount Calculation</h4>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Formula:</span> WIR Value × BOQ Unit Rate × Breakdown Percentage
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">WIR Value:</span> {formatCurrency(calculationDetails.wir.value || 0)}
                  </div>
                  {calculationDetails.equation && (
                    <div className="bg-white p-3 border rounded text-sm font-mono">
                      {calculationDetails.equation}
                    </div>
                  )}
                  <div className="text-lg font-semibold text-slate-900 pt-2 border-t">
                    <span className="text-slate-600">Final Approved Amount:</span> {' '}
                    {calculationDetails.amount ? formatCurrency(calculationDetails.amount) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WIRTable;
