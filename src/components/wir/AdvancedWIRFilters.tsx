
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, X } from 'lucide-react';

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
}

const AdvancedWIRFilters: React.FC<AdvancedWIRFiltersProps> = ({
  onFiltersChange,
  engineers,
  contractors,
  regions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedWIRFilterValues>({});

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

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Advanced Search & Filters
                {hasActiveFilters && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {Object.keys(filters).filter(key => {
                      const value = filters[key as keyof AdvancedWIRFilterValues];
                      return value !== undefined && value !== '' && value !== null;
                    }).length} active
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Search Term */}
            <div className="space-y-2">
              <Label htmlFor="searchTerm">Search Term</Label>
              <Input
                id="searchTerm"
                placeholder="Search in descriptions, WIR numbers, line numbers..."
                value={filters.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Result Filter */}
              <div className="space-y-2">
                <Label htmlFor="result">Result</Label>
                <Select value={filters.result || 'all'} onValueChange={(value) => updateFilter('result', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All results</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Engineer Filter */}
              <div className="space-y-2">
                <Label htmlFor="engineer">Engineer</Label>
                <Select value={filters.engineer || 'all'} onValueChange={(value) => updateFilter('engineer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All engineers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All engineers</SelectItem>
                    {engineers.map(engineer => (
                      <SelectItem key={engineer} value={engineer}>{engineer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contractor Filter */}
              <div className="space-y-2">
                <Label htmlFor="contractor">Contractor</Label>
                <Select value={filters.contractor || 'all'} onValueChange={(value) => updateFilter('contractor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All contractors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All contractors</SelectItem>
                    {contractors.map(contractor => (
                      <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={filters.region || 'all'} onValueChange={(value) => updateFilter('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Line Number */}
              <div className="space-y-2">
                <Label htmlFor="lineNo">Line Number</Label>
                <Input
                  id="lineNo"
                  placeholder="Filter by line number"
                  value={filters.lineNo || ''}
                  onChange={(e) => updateFilter('lineNo', e.target.value)}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  lang="en-GB"
                  value={filters.fromDate || ''}
                  onChange={(e) => updateFilter('fromDate', e.target.value)}
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  lang="en-GB"
                  value={filters.toDate || ''}
                  onChange={(e) => updateFilter('toDate', e.target.value)}
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* Value Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Min Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="Minimum value"
                  value={filters.minValue || ''}
                  onChange={(e) => updateFilter('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Max Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="Maximum value"
                  value={filters.maxValue || ''}
                  onChange={(e) => updateFilter('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* BOQ Item Code */}
            <div className="space-y-2">
              <Label htmlFor="boqItemCode">BOQ Item Code</Label>
              <Input
                id="boqItemCode"
                placeholder="Filter by BOQ item code"
                value={filters.boqItemCode || ''}
                onChange={(e) => updateFilter('boqItemCode', e.target.value)}
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-2"
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
