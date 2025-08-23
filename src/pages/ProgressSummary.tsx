import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchFilter from '@/components/ui/search-filter';
import { ProgressSummaryTable } from '@/components/progress/ProgressSummaryTable';
import { useProgressSummaryData } from '@/hooks/useProgressSummaryData';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Calculator } from 'lucide-react';

const ProgressSummary = () => {
  const { boqItems } = useAppContext();
  const { t, isRTL } = useLanguage();
  const [selectedBOQItem, setSelectedBOQItem] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get only leaf nodes (items without children)
  const leafBOQItems = boqItems.filter(item => {
    const hasChildren = boqItems.some(child => child.parentId === item.id);
    return !hasChildren;
  });

  const summaryData = useProgressSummaryData(selectedBOQItem, true); // Always show approved only
  
  // Get selected BOQ item details
  const selectedBOQ = boqItems.find(item => item.id === selectedBOQItem);

  // Filter segments based on search term
  const filteredSummaryData = useMemo(() => {
    if (!summaryData || !searchTerm.trim()) return summaryData;
    
    const filteredSegments = summaryData.segments.filter(segment => 
      segment.manholeFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.manholeTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.road?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.line?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
      ...summaryData,
      segments: filteredSegments
    };
  }, [summaryData, searchTerm]);

  return (
    <div className="space-y-6 p-6">
      <div className={`flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('progressSummary.title', 'Progress Summary')}
            </h1>
            <p className="text-muted-foreground">
              {t('progressSummary.description', 'Track manhole segments and WIR progress across BOQ items')}
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-elegant border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg font-semibold text-foreground flex items-center gap-2 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
            <Package className="w-5 h-5 text-primary" />
            {t('progressSummary.selectBOQ', 'Select BOQ Item')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedBOQItem} onValueChange={setSelectedBOQItem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('progressSummary.selectPlaceholder', 'Select a BOQ item to view progress')} />
            </SelectTrigger>
            <SelectContent>
              {leafBOQItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                    <Badge variant="outline" className="text-xs font-medium">
                      {item.code}
                    </Badge>
                    <span className="font-medium">
                      {isRTL && item.descriptionAr ? item.descriptionAr : item.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBOQItem && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search segments by manhole, zone, road, or line..."
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBOQ && filteredSummaryData && (
        <>
          {/* BOQ Item Header Card */}
          <Card className="shadow-elegant border bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground font-semibold">
                      {selectedBOQ.code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">BOQ Item</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    {isRTL && selectedBOQ.descriptionAr ? selectedBOQ.descriptionAr : selectedBOQ.description}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Quantity: {selectedBOQ.quantity.toLocaleString()}</span>
                    <span>Unit: {isRTL && selectedBOQ.unitAr ? selectedBOQ.unitAr : selectedBOQ.unit}</span>
                    <span>Rate: {selectedBOQ.unitRate.toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Table */}
          <Card className="shadow-elegant border bg-card">
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg font-semibold text-foreground flex items-center gap-2 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {t('progressSummary.tableTitle', 'Manhole Segments & WIR Progress')}
                <Badge variant="secondary" className="text-xs font-medium">
                  Approved Only (A/B)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ProgressSummaryTable data={filteredSummaryData} isRTL={isRTL} />
            </CardContent>
          </Card>
        </>
      )}

      {selectedBOQItem && (!filteredSummaryData || filteredSummaryData.segments.length === 0) && (
        <Card className="shadow-elegant border bg-card">
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-muted/50 border border-border/50">
                  <Package className="w-12 h-12 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-foreground">
                  {searchTerm ? 'No matching segments found' : t('progressSummary.noData', 'No progress data available')}
                </h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {searchTerm 
                     ? 'Try adjusting your search filters or check if there are approved WIRs for this BOQ item.'
                     : 'No approved WIRs (A/B results) found for this BOQ item yet. Create WIRs and set their results to A or B to see progress here.'
                   }
                 </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressSummary;