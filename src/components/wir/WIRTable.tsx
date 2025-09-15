import React, { useState, useMemo } from 'react';
import { WIR, BOQItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit, 
  FileText, 
  Send, 
  Printer, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import WIRPrintView from './WIRPrintView';

interface WIRTableProps {
  wirs: WIR[];
  flattenedBOQItems: BOQItem[];
  canEdit: boolean;
  onEdit: (wir: WIR) => void;
  onSubmitResult?: (wir: WIR) => void;
  onRevisionRequest?: (wir: WIR) => void;
}

const WIRTable: React.FC<WIRTableProps> = ({
  wirs,
  flattenedBOQItems,
  canEdit,
  onEdit,
  onSubmitResult,
  onRevisionRequest
}) => {
  const [printingWIR, setPrintingWIR] = useState<WIR | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WIR | 'lengthOfLine' | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Sorting functionality
  const sortedWIRs = useMemo(() => {
    if (!sortConfig.key) return wirs;

    return [...wirs].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (sortConfig.key === 'submittalDate') {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return sortConfig.direction === 'asc' 
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      if (sortConfig.key === 'value') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (sortConfig.key === 'lengthOfLine') {
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [wirs, sortConfig]);

  const handleSort = (key: keyof WIR | 'lengthOfLine') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof WIR | 'lengthOfLine') => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const SortableHeader = ({ 
    children, 
    sortKey, 
    className = "", 
    align = "left" 
  }: { 
    children: React.ReactNode; 
    sortKey: keyof WIR | 'lengthOfLine'; 
    className?: string;
    align?: "left" | "right" | "center";
  }) => (
    <TableHead 
      className={`font-semibold text-foreground h-14 cursor-pointer select-none transition-colors hover:bg-muted/80 ${className} ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''
      }`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${
        align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''
      }`}>
        {children}
        {getSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  const getBOQItemDescription = (boqItemId: string) => {
    // First try direct ID match
    let item = flattenedBOQItems.find(item => item.id === boqItemId);
    
    // If not found by ID, try to find by code or description (fallback for import issues)
    if (!item) {
      item = flattenedBOQItems.find(item => 
        item.code === boqItemId || 
        item.description?.includes(boqItemId) ||
        item.descriptionAr?.includes(boqItemId)
      );
    }
    
    return item ? `${item.code} - ${item.description || item.descriptionAr}` : 'Unknown BOQ Item';
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
          label: 'APPROVED (A)'
        };
      case 'B':
        return {
          variant: 'warning' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'CONDITIONAL (B)'
        };
      case 'C':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-3 w-3" />,
          label: 'REJECTED (C)'
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
    // Wait longer to allow attachment URLs to load
    setTimeout(() => {
      window.print();
      // Reset after printing to clean up
      setTimeout(() => setPrintingWIR(null), 1000);
    }, 2000); // Increased delay to 2 seconds
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              <div>
                <span className="text-muted-foreground">Length:</span>
                <p className="font-medium">{wir.lengthOfLine ? `${Number(wir.lengthOfLine).toFixed(1)} m` : '-'}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <div>
                <span className="text-muted-foreground">Value:</span>
                <p className="font-bold text-lg">{formatCurrency(wir.calculatedAmount || wir.value)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="font-medium">{formatDate(wir.submittalDate)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <TooltipProvider>
              {canEdit && !wir.result && (
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

              {canEdit && onSubmitResult && wir.status === 'submitted' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubmitResult(wir)}
                      className="h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Submit Result</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {canEdit && onRevisionRequest && wir.result === 'C' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRevisionRequest(wir)}
                      className="h-8 w-8 p-0"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Request Revision</p>
                  </TooltipContent>
                </Tooltip>
              )}
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
              <TableHeader className="bg-muted/30 sticky top-0 z-10 border-b-2 border-primary/20">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <SortableHeader sortKey="wirNumber" className="min-w-[120px]">WIR Number</SortableHeader>
                  <TableHead className="font-semibold text-foreground h-14 min-w-[240px]">BOQ Item</TableHead>
                  <TableHead className="font-semibold text-foreground h-14 min-w-[200px]">Description</TableHead>
                  <SortableHeader sortKey="contractor" className="min-w-[140px]">Contractor</SortableHeader>
                  <SortableHeader sortKey="engineer" className="min-w-[130px]">Engineer</SortableHeader>
                  <SortableHeader sortKey="region" className="min-w-[120px]">Region</SortableHeader>
                  <SortableHeader sortKey="lineNo" className="min-w-[90px]">Line No</SortableHeader>
                  <SortableHeader sortKey="lengthOfLine" className="min-w-[110px]" align="right">Length (m)</SortableHeader>
                  <SortableHeader sortKey="value" className="min-w-[130px]" align="right">Value</SortableHeader>
                  <SortableHeader sortKey="submittalDate" className="min-w-[110px]">Date</SortableHeader>
                  <SortableHeader sortKey="status" className="min-w-[110px]">Status</SortableHeader>
                  <SortableHeader sortKey="result" className="min-w-[110px]">Result</SortableHeader>
                  <TableHead className="font-semibold text-foreground h-14 text-center min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWIRs.map((wir, index) => {
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
                       <TableCell className="font-semibold py-5 px-4 align-middle">
                         {wir.wirNumber || wir.id}
                       </TableCell>
                       <TableCell className="py-5 px-4 align-middle">
                         <div className="max-w-[240px] overflow-hidden">
                           <span className="text-sm font-medium text-foreground block" title={getBOQItemDescription(wir.boqItemId)}>
                             {getBOQItemDescription(wir.boqItemId)}
                           </span>
                         </div>
                       </TableCell>
                       <TableCell className="py-5 px-4 align-middle">
                         <div className="max-w-[200px] overflow-hidden">
                           <span className="text-sm text-foreground block" title={wir.description}>
                             {wir.description}
                           </span>
                         </div>
                       </TableCell>
                       <TableCell className="py-5 px-4 align-middle font-medium text-sm">{wir.contractor}</TableCell>
                       <TableCell className="py-5 px-4 align-middle font-medium text-sm">{wir.engineer}</TableCell>
                       <TableCell className="py-5 px-4 align-middle font-medium text-sm">{wir.region}</TableCell>
                        <TableCell className="py-5 px-4 align-middle font-semibold text-sm">{wir.lineNo}</TableCell>
                        <TableCell className="py-5 px-4 text-right align-middle font-medium text-sm">
                          {wir.lengthOfLine ? `${Number(wir.lengthOfLine).toFixed(1)} m` : '-'}
                        </TableCell>
                         <TableCell className="py-5 px-4 text-right align-middle font-bold text-base text-primary">
                          {formatCurrency(wir.calculatedAmount || wir.value)}
                        </TableCell>
                       <TableCell className="py-5 px-4 align-middle font-medium text-sm">{formatDate(wir.submittalDate)}</TableCell>
                       <TableCell className="py-5 px-4 align-middle">
                         <Badge variant={statusBadge.variant} className="gap-1.5 text-xs font-medium px-2.5 py-1">
                           {statusBadge.icon}
                           {statusBadge.label}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-5 px-4 align-middle">
                         <Badge variant={resultBadge.variant} className="gap-1.5 text-xs font-medium px-2.5 py-1">
                           {resultBadge.icon}
                           {resultBadge.label}
                         </Badge>
                       </TableCell>
                       <TableCell className="py-5 px-4 align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                           <TooltipProvider>
                             {canEdit && !wir.result && (
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

                             {canEdit && onSubmitResult && wir.status === 'submitted' && (
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => onSubmitResult(wir)}
                                     className="h-8 w-8 p-0 hover:bg-primary/10"
                                   >
                                     <Send className="h-4 w-4" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>Submit Result</TooltipContent>
                               </Tooltip>
                             )}

                             {canEdit && onRevisionRequest && wir.result === 'C' && (
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => onRevisionRequest(wir)}
                                     className="h-8 w-8 p-0 hover:bg-primary/10"
                                   >
                                     <FileText className="h-4 w-4" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>Request Revision</TooltipContent>
                               </Tooltip>
                             )}
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
          {sortedWIRs.map((wir) => (
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
