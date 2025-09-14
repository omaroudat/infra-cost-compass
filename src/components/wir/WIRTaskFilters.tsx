import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, User, FileText } from 'lucide-react';
import { WIR } from '@/types';

interface WIRTaskFiltersProps {
  filters: {
    search: string;
    contractor: string;
    engineer: string;
    result: string;
    dateFrom: string;
    dateTo: string;
    workDaysMin: string;
    workDaysMax: string;
    approvalDaysMin: string;
    approvalDaysMax: string;
  };
  onFiltersChange: (filters: any) => void;
  contractors: string[];
  engineers: string[];
  wirs: WIR[];
}

export const WIRTaskFilters: React.FC<WIRTaskFiltersProps> = ({
  filters,
  onFiltersChange,
  contractors,
  engineers,
  wirs
}) => {
  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for filtering logic
    const filterValue = value === 'all' ? '' : value;
    onFiltersChange({ ...filters, [key]: filterValue });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      contractor: '',
      engineer: '',
      result: '',
      dateFrom: '',
      dateTo: '',
      workDaysMin: '',
      workDaysMax: '',
      approvalDaysMin: '',
      approvalDaysMax: ''
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search WIRs
          </Label>
          <Input
            id="search"
            placeholder="Search by WIR number, description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Contractor Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contractor
            </Label>
            <Select value={filters.contractor || 'all'} onValueChange={(value) => handleFilterChange('contractor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Contractors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contractors</SelectItem>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor} value={contractor}>
                    {contractor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Engineer Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Engineer
            </Label>
            <Select value={filters.engineer || 'all'} onValueChange={(value) => handleFilterChange('engineer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Engineers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engineers</SelectItem>
                {engineers.map((engineer) => (
                  <SelectItem key={engineer} value={engineer}>
                    {engineer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Result Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Result
            </Label>
            <Select value={filters.result || 'all'} onValueChange={(value) => handleFilterChange('result', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="A">A - Approved</SelectItem>
                <SelectItem value="B">B - Conditional</SelectItem>
                <SelectItem value="C">C - Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-1">
              <Input
                type="date"
                placeholder="From"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="text-xs"
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Performance Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-sm text-muted-foreground px-3">Performance Filters</span>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Work Days Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Items Work Days</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min days"
                  value={filters.workDaysMin}
                  onChange={(e) => handleFilterChange('workDaysMin', e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max days"
                  value={filters.workDaysMax}
                  onChange={(e) => handleFilterChange('workDaysMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Approval Days Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Approval Days</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min days"
                  value={filters.approvalDaysMin}
                  onChange={(e) => handleFilterChange('approvalDaysMin', e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max days"
                  value={filters.approvalDaysMax}
                  onChange={(e) => handleFilterChange('approvalDaysMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};