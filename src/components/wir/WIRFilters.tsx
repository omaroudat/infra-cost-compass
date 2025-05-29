
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw } from 'lucide-react';

interface WIRFiltersProps {
  contractors: string[];
  engineers: string[];
  onFiltersChange: (filters: WIRFilterValues) => void;
}

export interface WIRFilterValues {
  status?: string;
  result?: string;
  engineer?: string;
  contractor?: string;
  fromDate?: string;
  toDate?: string;
}

const WIRFilters: React.FC<WIRFiltersProps> = ({
  contractors,
  engineers,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<WIRFilterValues>({});

  const handleFilterChange = (key: keyof WIRFilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Result Filter */}
          <div className="space-y-2">
            <Label htmlFor="result-filter">Result</Label>
            <Select value={filters.result || ''} onValueChange={(value) => handleFilterChange('result', value)}>
              <SelectTrigger id="result-filter">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A - Approved</SelectItem>
                <SelectItem value="B">B - Conditional Approved</SelectItem>
                <SelectItem value="C">C - Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Engineer Filter */}
          <div className="space-y-2">
            <Label htmlFor="engineer-filter">Engineer</Label>
            <Select value={filters.engineer || ''} onValueChange={(value) => handleFilterChange('engineer', value)}>
              <SelectTrigger id="engineer-filter">
                <SelectValue placeholder="All Engineers" />
              </SelectTrigger>
              <SelectContent>
                {engineers.map((engineer) => (
                  <SelectItem key={engineer} value={engineer}>
                    {engineer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contractor Filter */}
          <div className="space-y-2">
            <Label htmlFor="contractor-filter">Contractor</Label>
            <Select value={filters.contractor || ''} onValueChange={(value) => handleFilterChange('contractor', value)}>
              <SelectTrigger id="contractor-filter">
                <SelectValue placeholder="All Contractors" />
              </SelectTrigger>
              <SelectContent>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor} value={contractor}>
                    {contractor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="from-date-filter">From Date</Label>
            <Input
              id="from-date-filter"
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </div>

          {/* To Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="to-date-filter">To Date</Label>
            <Input
              id="to-date-filter"
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WIRFilters;
