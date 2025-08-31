import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { AuditLogFilters } from '@/hooks/useAuditLogs';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClearFilters: () => void;
}

const ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED', 
  'LOGOUT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVAL'
];

const RESOURCE_TYPES = [
  'AUTH',
  'WIR',
  'BOQ_ITEM',
  'BREAKDOWN_ITEM',
  'CONTRACTOR',
  'ENGINEER',
  'ATTACHMENT',
  'USER'
];

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input
                placeholder="Filter by username"
                value={filters.username || ''}
                onChange={(e) => handleFilterChange('username', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select 
                value={filters.action || 'all'} 
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {ACTIONS.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resource Type</label>
              <Select 
                value={filters.resourceType || 'all'} 
                onValueChange={(value) => handleFilterChange('resourceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {RESOURCE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};