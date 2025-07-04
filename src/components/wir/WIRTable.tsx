import React, { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, FileText, Send, Printer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  onRevisionRequest
}) => {
  const [printingWIR, setPrintingWIR] = useState<WIR | null>(null);

  const getBOQItemDescription = (boqItemId: string) => {
    const item = flattenedBOQItems.find(item => item.id === boqItemId);
    return item ? `${item.code} - ${item.description}` : 'Unknown BOQ Item';
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'secondary';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getResultBadgeVariant = (result: string) => {
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

  const handlePrint = (wir: WIR) => {
    setPrintingWIR(wir);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WIR Number</TableHead>
            <TableHead>BOQ Item</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Contractor</TableHead>
            <TableHead>Engineer</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Line No</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Submittal Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wirs.map((wir) => (
            <TableRow key={wir.id}>
              <TableCell className="font-medium">{wir.wirNumber || wir.id}</TableCell>
              <TableCell className="max-w-xs truncate">{getBOQItemDescription(wir.boqItemId)}</TableCell>
              <TableCell className="max-w-xs truncate">{wir.description}</TableCell>
              <TableCell>{wir.contractor}</TableCell>
              <TableCell>{wir.engineer}</TableCell>
              <TableCell>{wir.region}</TableCell>
              <TableCell>{wir.lineNo}</TableCell>
              <TableCell>{formatCurrency(wir.value)}</TableCell>
              <TableCell>{formatDate(wir.submittalDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(wir.status)}>
                  {wir.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                {wir.result ? (
                  <Badge variant={getResultBadgeVariant(wir.result)}>
                    {wir.result}
                  </Badge>
                ) : (
                  <span className="text-gray-400">Pending</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(wir)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canEdit && onSubmitResult && wir.status === 'submitted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubmitResult(wir)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}

                  {canEdit && onRevisionRequest && wir.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRevisionRequest(wir)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(wir)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>

                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the WIR.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(wir.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Print View */}
      {printingWIR && (
        <div className="print:block hidden">
          <WIRPrintView wir={printingWIR} flattenedBOQItems={flattenedBOQItems} />
        </div>
      )}
    </div>
  );
};

export default WIRTable;
