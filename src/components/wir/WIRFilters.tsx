
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/enhanced-dropdowns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, RotateCcw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface WIRFiltersProps {
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
  onFiltersChange,
}) => {
  const { contractors, engineers } = useAppContext();
  const [filters, setFilters] = useState<WIRFilterValues>({});

  // Extract unique contractor and engineer names
  const contractorNames = [...new Set(contractors.map(c => c.name))];
  const engineerNames = [...new Set(engineers.map(e => e.name))];

  const handleFilterChange = (key: keyof WIRFilterValues, value: string) => {
    console.log('Filter change:', key, 'Value:', value);
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    console.log('New filters:', newFilters);
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
            <ComboBox
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'completed', label: 'Completed' }
              ]}
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value || 'all')}
              placeholder="All Status"
              searchable={false}
              className="w-full"
            />
          </div>

          {/* Result Filter */}
          <div className="space-y-2">
            <Label htmlFor="result-filter">Result</Label>
            <ComboBox
              options={[
                { value: 'all', label: 'All Results' },
                { value: 'A', label: 'A - Approved' },
                { value: 'B', label: 'B - Conditional Approved' },
                { value: 'C', label: 'C - Rejected' }
              ]}
              value={filters.result || 'all'}
              onValueChange={(value) => handleFilterChange('result', value || 'all')}
              placeholder="All Results"
              searchable={false}
              className="w-full"
            />
          </div>

          {/* Engineer Filter */}
          <div className="space-y-2">
            <Label htmlFor="engineer-filter">Engineer</Label>
            <ComboBox
              options={[
                { value: 'all', label: 'All Engineers' },
                ...engineerNames.map(engineer => ({ value: engineer, label: engineer }))
              ]}
              value={filters.engineer || 'all'}
              onValueChange={(value) => handleFilterChange('engineer', value || 'all')}
              placeholder="All Engineers"
              searchable={true}
              className="w-full"
            />
          </div>

          {/* Contractor Filter */}
          <div className="space-y-2">
            <Label htmlFor="contractor-filter">Contractor</Label>
            <ComboBox
              options={[
                { value: 'all', label: 'All Contractors' },
                ...contractorNames.map(contractor => ({ value: contractor, label: contractor }))
              ]}
              value={filters.contractor || 'all'}
              onValueChange={(value) => handleFilterChange('contractor', value || 'all')}
              placeholder="All Contractors"
              searchable={true}
              className="w-full"
            />
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
