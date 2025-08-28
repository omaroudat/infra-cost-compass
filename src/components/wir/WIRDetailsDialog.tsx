import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/StatusBadge';
import { WIR } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Hash, 
  Calendar, 
  User, 
  MapPin, 
  Ruler, 
  Target, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface WIRDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wirNumber: string;
}

export const WIRDetailsDialog: React.FC<WIRDetailsDialogProps> = ({
  isOpen,
  onClose,
  wirNumber
}) => {
  const [wir, setWir] = useState<WIR | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && wirNumber) {
      fetchWIRDetails();
    }
  }, [isOpen, wirNumber]);

  const fetchWIRDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wirs')
        .select('*')
        .eq('wir_number', wirNumber)
        .single();

      if (error) {
        toast.error('Failed to fetch WIR details');
        console.error('Error fetching WIR:', error);
        return;
      }

      if (data) {
        // Convert database fields to WIR type
        const wirData: WIR = {
          id: data.id,
          wirNumber: data.wir_number,
          boqItemId: data.boq_item_id,
          description: data.description,
          descriptionAr: data.description_ar,
          submittalDate: data.submittal_date,
          receivedDate: data.received_date,
          status: data.status,
          result: data.result,
          statusConditions: data.status_conditions,
          calculatedAmount: data.calculated_amount,
          calculationEquation: data.calculation_equation,
          breakdownApplied: null, // This field doesn't exist in database
          contractor: data.contractor,
          engineer: data.engineer,
          lengthOfLine: data.length_of_line,
          diameterOfLine: data.diameter_of_line,
          lineNo: data.line_no,
          region: data.region,
          manholeFrom: data.manhole_from,
          manholeTo: data.manhole_to,
          zone: data.zone,
          road: data.road,
          line: data.line,
          value: data.value,
          parentWIRId: data.parent_wir_id,
          revisionNumber: data.revision_number,
          linkedBOQItems: data.linked_boq_items || [],
          originalWIRId: data.original_wir_id,
          selectedBreakdownItems: data.selected_breakdown_items || []
        };
        setWir(wirData);
      }
    } catch (error) {
      toast.error('Failed to fetch WIR details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getResultBadgeVariant = (result?: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] w-[95vw] overflow-hidden">
        <DialogHeader className="border-b border-border pb-4 mb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            WIR Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : wir ? (
            <>
              {/* Header Card */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {wir.wirNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Work Inspection Request
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(wir.status)}
                        {getStatusBadge(wir.status)}
                      </div>
                      {wir.result && (
                        <StatusBadge status={wir.result} />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">{formatDate(wir.submittalDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Received:</span>
                      <span className="font-medium">{formatDate(wir.receivedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium">{wir.value?.toLocaleString()} SAR</span>
                    </div>
                    {wir.calculatedAmount && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Calculated:</span>
                        <span className="font-medium">{wir.calculatedAmount.toLocaleString()} SAR</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">{wir.description}</p>
                    {wir.descriptionAr && (
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {wir.descriptionAr}
                      </p>
                    )}
                  </div>
                  {wir.statusConditions && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">Status Conditions</p>
                      <p className="text-sm text-muted-foreground">{wir.statusConditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personnel & Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Contractor
                      </label>
                      <p className="text-sm font-medium text-foreground">{wir.contractor}</p>
                    </div>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Engineer
                      </label>
                      <p className="text-sm font-medium text-foreground">{wir.engineer}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Region
                        </label>
                        <p className="text-sm font-medium text-foreground">{wir.region}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Zone
                        </label>
                        <p className="text-sm font-medium text-foreground">{wir.zone}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Road
                        </label>
                        <p className="text-sm font-medium text-foreground">{wir.road}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Line
                        </label>
                        <p className="text-sm font-medium text-foreground">{wir.line}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technical Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Line Number
                      </label>
                      <p className="text-sm font-medium text-foreground">{wir.lineNo}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Length (m)
                      </label>
                      <p className="text-sm font-medium text-foreground">{wir.lengthOfLine}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Diameter (mm)
                      </label>
                      <p className="text-sm font-medium text-foreground">{wir.diameterOfLine}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Manholes
                      </label>
                      <p className="text-sm font-medium text-foreground">
                        {wir.manholeFrom} → {wir.manholeTo}
                      </p>
                    </div>
                  </div>
                  {wir.calculationEquation && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                        Calculation Equation
                      </label>
                      <p className="text-sm font-mono text-foreground">{wir.calculationEquation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revision Information */}
              {(wir.revisionNumber || wir.parentWIRId) && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-4 h-4" />
                      Revision Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {wir.revisionNumber && (
                        <div>
                          <label className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                            Revision Number
                          </label>
                          <p className="text-sm font-medium text-orange-800">#{wir.revisionNumber}</p>
                        </div>
                      )}
                      {wir.originalWIRId && (
                        <div>
                          <label className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                            Original WIR ID
                          </label>
                          <p className="text-sm font-medium text-orange-800">{wir.originalWIRId}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">WIR not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};