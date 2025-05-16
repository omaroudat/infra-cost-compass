
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FilterCriteria = 'all' | 'contractor' | 'engineer';

interface DashboardFilterProps {
  filterCriteria: FilterCriteria;
  selectedValue: string;
  contractors: string[];
  engineers: string[];
  onFilterChange: (value: FilterCriteria) => void;
  onSelectedValueChange: (value: string) => void;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({
  filterCriteria,
  selectedValue,
  contractors,
  engineers,
  onFilterChange,
  onSelectedValueChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex items-center space-x-4">
        <h3 className="text-lg font-medium">Filter Dashboard:</h3>
        <div className="flex items-center space-x-2">
          <Select value={filterCriteria} onValueChange={(value: FilterCriteria) => onFilterChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All WIRs</SelectItem>
              <SelectItem value="contractor">By Contractor</SelectItem>
              <SelectItem value="engineer">By Engineer</SelectItem>
            </SelectContent>
          </Select>
          
          {filterCriteria === 'contractor' && (
            <Select value={selectedValue} onValueChange={onSelectedValueChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Contractor" />
              </SelectTrigger>
              <SelectContent>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor} value={contractor}>
                    {contractor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {filterCriteria === 'engineer' && (
            <Select value={selectedValue} onValueChange={onSelectedValueChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Engineer" />
              </SelectTrigger>
              <SelectContent>
                {engineers.map((engineer) => (
                  <SelectItem key={engineer} value={engineer}>
                    {engineer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFilter;
