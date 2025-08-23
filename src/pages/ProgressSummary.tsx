import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import SearchFilter from '@/components/ui/search-filter';
import { ProgressSummaryTable } from '@/components/progress/ProgressSummaryTable';
import { useProgressSummaryData } from '@/hooks/useProgressSummaryData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, TrendingUp, Calculator, Check, ChevronsUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProgressSummary = () => {
  const { boqItems, breakdownItems } = useAppContext();
  const { t, isRTL } = useLanguage();
  const [selectedBOQItem, setSelectedBOQItem] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [manholeFromFilter, setManholeFromFilter] = useState('');
  const [manholeToFilter, setManholeToFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [roadFilter, setRoadFilter] = useState('');

  // Show all BOQ items in hierarchical structure like in BOQ Module
  const hierarchicalBOQItems = useMemo(() => {
    // Flatten hierarchy for display in select dropdown
    const flattenForSelect = (items: typeof boqItems, level: number = 0): Array<{ item: typeof boqItems[0], level: number }> => {
      const result: Array<{ item: typeof boqItems[0], level: number }> = [];
      
      items.forEach(item => {
        result.push({ item, level });
        if (item.children && item.children.length > 0) {
          result.push(...flattenForSelect(item.children, level + 1));
        }
      });
      
      return result;
    };

    return flattenForSelect(boqItems);
  }, [boqItems]);

  const summaryData = useProgressSummaryData(selectedBOQItem, true); // Always show approved only
  
  // Get selected BOQ item details from flattened hierarchy
  const selectedBOQ = useMemo(() => {
    if (!selectedBOQItem) return null;
    return hierarchicalBOQItems.find(({ item }) => item.id === selectedBOQItem)?.item || null;
  }, [selectedBOQItem, hierarchicalBOQItems]);

  // Filter segments based on all search filters
  const filteredSummaryData = useMemo(() => {
    if (!summaryData) return summaryData;
    
    const hasAnyFilter = searchTerm.trim() || manholeFromFilter.trim() || manholeToFilter.trim() || zoneFilter.trim() || roadFilter.trim();
    
    if (!hasAnyFilter) return summaryData;
    
    const filteredSegments = summaryData.segments.filter(segment => {
      // General search term (searches across all fields)
      const matchesSearchTerm = !searchTerm.trim() || (
        segment.manholeFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.manholeTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.road?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.line?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Specific field filters
      const matchesManholeFrom = !manholeFromFilter.trim() || segment.manholeFrom?.toLowerCase().includes(manholeFromFilter.toLowerCase());
      const matchesManholeTo = !manholeToFilter.trim() || segment.manholeTo?.toLowerCase().includes(manholeToFilter.toLowerCase());
      const matchesZone = !zoneFilter.trim() || segment.zone?.toLowerCase().includes(zoneFilter.toLowerCase());
      const matchesRoad = !roadFilter.trim() || segment.road?.toLowerCase().includes(roadFilter.toLowerCase());
      
      return matchesSearchTerm && matchesManholeFrom && matchesManholeTo && matchesZone && matchesRoad;
    });
    
    return {
      ...summaryData,
      segments: filteredSegments
    };
  }, [summaryData, searchTerm, manholeFromFilter, manholeToFilter, zoneFilter, roadFilter]);

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between",
                  !selectedBOQItem && "text-muted-foreground"
                )}
              >
                {selectedBOQItem ? (
                  <div className={`flex items-center gap-2 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                    <Badge variant="outline" className="text-xs font-medium">
                      {hierarchicalBOQItems.find(({ item }) => item.id === selectedBOQItem)?.item.code}
                    </Badge>
                    <span className="font-medium truncate">
                      {(() => {
                        const selectedItem = hierarchicalBOQItems.find(({ item }) => item.id === selectedBOQItem)?.item;
                        return selectedItem ? (isRTL && selectedItem.descriptionAr ? selectedItem.descriptionAr : selectedItem.description) : '';
                      })()}
                    </span>
                  </div>
                ) : (
                  t('progressSummary.selectPlaceholder', 'Select a BOQ item to view progress')
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-w-none p-0" align="start">
              <Command className="w-full">
                <CommandInput 
                  placeholder={t('progressSummary.searchPlaceholder', 'Search BOQ items by code or description...')}
                  className="h-9" 
                />
                <CommandEmpty>
                  {t('progressSummary.noResults', 'No BOQ items found.')}
                </CommandEmpty>
                <CommandList className="max-h-[300px]">
                  <CommandGroup>
                    {hierarchicalBOQItems.map(({ item, level }) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.code} ${item.description} ${item.descriptionAr || ''}`}
                        onSelect={() => {
                          setSelectedBOQItem(item.id);
                        }}
                        className="cursor-pointer"
                      >
                        <div 
                          className={`flex items-center gap-2 w-full ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`} 
                          style={{ paddingLeft: `${level * 16}px` }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBOQItem === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <Badge variant="outline" className="text-xs font-medium flex-shrink-0">
                            {item.code}
                          </Badge>
                          <span className="font-medium truncate">
                            {isRTL && item.descriptionAr ? item.descriptionAr : item.description}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedBOQItem && (
            <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-semibold text-foreground flex items-center gap-2 ${isRTL ? 'text-right flex-row-reverse' : 'text-left'}`}>
                  <Filter className="w-4 h-4 text-primary" />
                  {t('progressSummary.filters', 'Filter Segments')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* General Search */}
                <div className="space-y-2">
                  <Label htmlFor="general-search" className="text-xs font-medium">
                    {t('progressSummary.generalSearch', 'General Search')}
                  </Label>
                  <Input
                    id="general-search"
                    placeholder={t('progressSummary.generalSearchPlaceholder', 'Search across all fields...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Specific Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manhole-from" className="text-xs font-medium">
                      {t('progressSummary.manholeFrom', 'Manhole From')}
                    </Label>
                    <Input
                      id="manhole-from"
                      placeholder={t('progressSummary.manholeFromPlaceholder', 'Filter by manhole from...')}
                      value={manholeFromFilter}
                      onChange={(e) => setManholeFromFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manhole-to" className="text-xs font-medium">
                      {t('progressSummary.manholeTo', 'Manhole To')}
                    </Label>
                    <Input
                      id="manhole-to"
                      placeholder={t('progressSummary.manholeToPlaceholder', 'Filter by manhole to...')}
                      value={manholeToFilter}
                      onChange={(e) => setManholeToFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone" className="text-xs font-medium">
                      {t('progressSummary.zone', 'Zone')}
                    </Label>
                    <Input
                      id="zone"
                      placeholder={t('progressSummary.zonePlaceholder', 'Filter by zone...')}
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="road" className="text-xs font-medium">
                      {t('progressSummary.road', 'Road')}
                    </Label>
                    <Input
                      id="road"
                      placeholder={t('progressSummary.roadPlaceholder', 'Filter by road...')}
                      value={roadFilter}
                      onChange={(e) => setRoadFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchTerm || manholeFromFilter || manholeToFilter || zoneFilter || roadFilter) && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setManholeFromFilter('');
                        setManholeToFilter('');
                        setZoneFilter('');
                        setRoadFilter('');
                      }}
                      className="text-xs"
                    >
                      {t('progressSummary.clearFilters', 'Clear All Filters')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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