import React, { useState } from 'react';
import { WIR, BOQItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit, 
  Trash2, 
  FileText, 
  Send, 
  Printer, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          variant: 'warning' as const,
          icon: <Clock className="h-3 w-3" />,
          label: 'SUBMITTED'
        };
      case 'completed':
        return {
          variant: 'success' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'COMPLETED'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          label: status.toUpperCase()
        };
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'A':
        return {
          variant: 'success' as const,
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'APPROVED'
        };
      case 'B':
        return {
          variant: 'warning' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'CONDITIONAL'
        };
      case 'C':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-3 w-3" />,
          label: 'REJECTED'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <Eye className="h-3 w-3" />,
          label: 'PENDING'
        };
    }
  };

  const handlePrint = (wir: WIR) => {
    setPrintingWIR(wir);
    setTimeout(() => {
      window.print();
      // Reset after printing to clean up
      setTimeout(() => setPrintingWIR(null), 1000);
    }, 100);
  };

  const WIRCard = ({ wir }: { wir: WIR }) => {
    const statusBadge = getStatusBadge(wir.status);
    const resultBadge = getResultBadge(wir.result || '');
    
    return (
      <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {wir.wirNumber || wir.id}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getBOQItemDescription(wir.boqItemId)}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusBadge.variant} className="gap-1">
                {statusBadge.icon}
                {statusBadge.label}
              </Badge>
              <Badge variant={resultBadge.variant} className="gap-1">
                {resultBadge.icon}
                {resultBadge.label}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="line-clamp-2 text-foreground">{wir.description}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Contractor:</span>
                <p className="font-medium">{wir.contractor}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Engineer:</span>
                <p className="font-medium">{wir.engineer}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Region:</span>
                <p className="font-medium">{wir.region}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Line No:</span>
                <p className="font-medium">{wir.lineNo}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div>
                <span className="text-muted-foreground">Value:</span>
                <p className="font-bold text-lg">{formatCurrency(wir.value)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{formatDate(wir.submittalDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <TooltipProvider>
              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(wir)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit WIR</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(wir)}
                    className="h-8 w-8 p-0"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print WIR</p>
                </TooltipContent>
              </Tooltip>
              
              {(canEdit && onSubmitResult && wir.status === 'submitted') ||
               (canEdit && onRevisionRequest && wir.status === 'completed') ||
               canDelete ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && onSubmitResult && wir.status === 'submitted' && (
                      <DropdownMenuItem onClick={() => onSubmitResult(wir)}>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Result
                      </DropdownMenuItem>
                    )}
                    {canEdit && onRevisionRequest && wir.status === 'completed' && (
                      <DropdownMenuItem onClick={() => onRevisionRequest(wir)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Request Revision
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className={printingWIR ? "print:hidden" : ""}>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground h-12">WIR Number</TableHead>
                  <TableHead className="font-semibold text-foreground h-12 min-w-[200px]">BOQ Item</TableHead>
                  <TableHead className="font-semibold text-foreground h-12 min-w-[180px]">Description</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Contractor</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Engineer</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Region</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Line No</TableHead>
                  <TableHead className="font-semibold text-foreground h-12 text-right">Value</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Date</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Status</TableHead>
                  <TableHead className="font-semibold text-foreground h-12">Result</TableHead>
                  <TableHead className="font-semibold text-foreground h-12 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wirs.map((wir, index) => {
                  const statusBadge = getStatusBadge(wir.status);
                  const resultBadge = getResultBadge(wir.result || '');
                  
                  return (
                    <TableRow 
                      key={wir.id} 
                      className={`
                        border-b border-border transition-colors duration-150
                        hover:bg-muted/30 
                        ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                      `}
                    >
                      <TableCell className="font-medium py-4">
                        {wir.wirNumber || wir.id}
                      </TableCell>
                      <TableCell className="py-4 max-w-[200px]">
                        <div className="truncate" title={getBOQItemDescription(wir.boqItemId)}>
                          {getBOQItemDescription(wir.boqItemId)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 max-w-[180px]">
                        <div className="truncate" title={wir.description}>
                          {wir.description}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{wir.contractor}</TableCell>
                      <TableCell className="py-4">{wir.engineer}</TableCell>
                      <TableCell className="py-4">{wir.region}</TableCell>
                      <TableCell className="py-4 font-medium">{wir.lineNo}</TableCell>
                      <TableCell className="py-4 text-right font-semibold">
                        {formatCurrency(wir.value)}
                      </TableCell>
                      <TableCell className="py-4">{formatDate(wir.submittalDate)}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant={statusBadge.variant} className="gap-1 text-xs">
                          {statusBadge.icon}
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant={resultBadge.variant} className="gap-1 text-xs">
                          {resultBadge.icon}
                          {resultBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            {canEdit && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(wir)}
                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit WIR</TooltipContent>
                              </Tooltip>
                            )}
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrint(wir)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Print WIR</TooltipContent>
                            </Tooltip>
                            
                            {(canEdit && onSubmitResult && wir.status === 'submitted') ||
                             (canEdit && onRevisionRequest && wir.status === 'completed') ||
                             canDelete ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {canEdit && onSubmitResult && wir.status === 'submitted' && (
                                    <DropdownMenuItem onClick={() => onSubmitResult(wir)}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Submit Result
                                    </DropdownMenuItem>
                                  )}
                                  {canEdit && onRevisionRequest && wir.status === 'completed' && (
                                    <DropdownMenuItem onClick={() => onRevisionRequest(wir)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Request Revision
                                    </DropdownMenuItem>
                                  )}
                                  {canDelete && (
                                    <>
                                      {(canEdit && (onSubmitResult || onRevisionRequest)) && <DropdownMenuSeparator />}
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete WIR
                                          </DropdownMenuItem>
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
                                            <AlertDialogAction 
                                              onClick={() => onDelete(wir.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : null}
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {wirs.map((wir) => (
            <WIRCard key={wir.id} wir={wir} />
          ))}
        </div>
      </div>

      {/* Print View - Only visible during printing */}
      {printingWIR && (
        <div className="print:block hidden print:bg-white print:p-0 print:m-0 print:shadow-none">
          <WIRPrintView wir={printingWIR} flattenedBOQItems={flattenedBOQItems} />
        </div>
      )}
    </div>
  );
};

export default WIRTable;
