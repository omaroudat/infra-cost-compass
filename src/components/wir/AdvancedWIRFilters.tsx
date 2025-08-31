
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ComboBox } from '@/components/ui/enhanced-dropdowns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Search, X, Filter, SlidersHorizontal } from 'lucide-react';

export interface AdvancedWIRFilterValues {
  searchTerm?: string;
  status?: string;
  result?: string;
  engineer?: string;
  contractor?: string;
  fromDate?: string;
  toDate?: string;
  region?: string;
  lineNo?: string;
  minValue?: number;
  maxValue?: number;
  boqItemCode?: string;
}

interface AdvancedWIRFiltersProps {
  onFiltersChange: (filters: AdvancedWIRFilterValues) => void;
  engineers: string[];
  contractors: string[];
  regions: string[];
  initialFilters?: AdvancedWIRFilterValues;
}

const AdvancedWIRFilters: React.FC<AdvancedWIRFiltersProps> = ({
  onFiltersChange,
  engineers,
  contractors,
  regions,
  initialFilters = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedWIRFilterValues>(initialFilters);

  // Update filters when initialFilters prop changes
  useEffect(() => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  }, [initialFilters, onFiltersChange]);

  const updateFilter = (key: keyof AdvancedWIRFilterValues, value: any) => {
    // Convert 'all' back to undefined for filtering logic
    const filterValue = value === 'all' ? undefined : value;
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AdvancedWIRFilterValues];
    return value !== undefined && value !== '' && value !== null;
  });

  const getActiveFilters = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof AdvancedWIRFilterValues];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const removeFilter = (key: keyof AdvancedWIRFilterValues) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className="shadow-sm border border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors duration-200 pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">Advanced Filters</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    Search and filter WIRs by multiple criteria
                  </span>
                </div>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilters().length} active
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground mr-2">Active filters:</span>
                {getActiveFilters().map((key) => (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeFilter(key as keyof AdvancedWIRFilterValues)}
                  >
                    {key}: {String(filters[key as keyof AdvancedWIRFilterValues])}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
            {/* Search Term */}
            <div className="space-y-2">
              <Label htmlFor="searchTerm" className="text-sm font-medium">Global Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="searchTerm"
                  placeholder="Search in descriptions, WIR numbers, line numbers..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                </Label>
                <ComboBox
                  options={[
                    { value: 'all', label: 'All statuses' },
                    { value: 'submitted', label: 'Submitted' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  value={filters.status || 'all'}
                  onValueChange={(value) => updateFilter('status', value || 'all')}
                  placeholder="All statuses"
                  searchable={false}
                  className="h-10"
                />
              </div>

              {/* Result Filter */}
              <div className="space-y-2">
                <Label htmlFor="result" className="text-sm font-medium">Result</Label>
                <ComboBox
                  options={[
                    { value: 'all', label: 'All results' },
                    { value: 'A', label: 'A - Approved' },
                    { value: 'B', label: 'B - Conditional' },
                    { value: 'C', label: 'C - Rejected' }
                  ]}
                  value={filters.result || 'all'}
                  onValueChange={(value) => updateFilter('result', value || 'all')}
                  placeholder="All results"
                  searchable={false}
                  className="h-10"
                />
              </div>

              {/* Engineer Filter */}
              <div className="space-y-2">
                <Label htmlFor="engineer" className="text-sm font-medium">Engineer</Label>
                <ComboBox
                  options={[
                    { value: 'all', label: 'All engineers' },
                    ...engineers.map(engineer => ({ value: engineer, label: engineer }))
                  ]}
                  value={filters.engineer || 'all'}
                  onValueChange={(value) => updateFilter('engineer', value || 'all')}
                  placeholder="All engineers"
                  searchable={true}
                  className="h-10"
                />
              </div>

              {/* Contractor Filter */}
              <div className="space-y-2">
                <Label htmlFor="contractor" className="text-sm font-medium">Contractor</Label>
                <ComboBox
                  options={[
                    { value: 'all', label: 'All contractors' },
                    ...contractors.map(contractor => ({ value: contractor, label: contractor }))
                  ]}
                  value={filters.contractor || 'all'}
                  onValueChange={(value) => updateFilter('contractor', value || 'all')}
                  placeholder="All contractors"
                  searchable={true}
                  className="h-10"
                />
              </div>

              {/* Region Filter */}
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-medium">Region</Label>
                <ComboBox
                  options={[
                    { value: 'all', label: 'All regions' },
                    ...regions.map(region => ({ value: region, label: region }))
                  ]}
                  value={filters.region || 'all'}
                  onValueChange={(value) => updateFilter('region', value || 'all')}
                  placeholder="All regions"
                  searchable={true}
                  className="h-10"
                />
              </div>

              {/* Line Number */}
              <div className="space-y-2">
                <Label htmlFor="lineNo" className="text-sm font-medium">Line Number</Label>
                <Input
                  id="lineNo"
                  placeholder="Filter by line number"
                  value={filters.lineNo || ''}
                  onChange={(e) => updateFilter('lineNo', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDate" className="text-xs text-muted-foreground">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    lang="en-GB"
                    value={filters.fromDate || ''}
                    onChange={(e) => updateFilter('fromDate', e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate" className="text-xs text-muted-foreground">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    lang="en-GB"
                    value={filters.toDate || ''}
                    onChange={(e) => updateFilter('toDate', e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Value Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Value Range (SAR)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue" className="text-xs text-muted-foreground">Minimum Value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    placeholder="0.00"
                    value={filters.minValue || ''}
                    onChange={(e) => updateFilter('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue" className="text-xs text-muted-foreground">Maximum Value</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    placeholder="999,999.00"
                    value={filters.maxValue || ''}
                    onChange={(e) => updateFilter('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* BOQ Item Code */}
            <div className="space-y-2">
              <Label htmlFor="boqItemCode" className="text-sm font-medium">BOQ Item Code</Label>
              <Input
                id="boqItemCode"
                placeholder="Filter by BOQ item code"
                value={filters.boqItemCode || ''}
                onChange={(e) => updateFilter('boqItemCode', e.target.value)}
                className="h-10"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdvancedWIRFilters;
