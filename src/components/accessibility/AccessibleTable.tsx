import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibleTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    sortable?: boolean;
    render?: (value: any, row: any, index: number) => React.ReactNode;
  }[];
  caption?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  ariaLabel?: string;
  emptyMessage?: string;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  data,
  columns,
  caption,
  sortBy,
  sortDirection,
  onSort,
  ariaLabel,
  emptyMessage = 'No data available'
}) => {
  const { announceMessage } = useAccessibility();

  const handleSort = (columnKey: string) => {
    if (!onSort) return;

    const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
    
    const column = columns.find(col => col.key === columnKey);
    announceMessage(
      `Table sorted by ${column?.header} in ${newDirection}ending order. ${data.length} rows.`
    );
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const getSortButtonLabel = (columnKey: string, header: string) => {
    if (sortBy === columnKey) {
      return `Sort by ${header}, currently sorted ${sortDirection}ending. Click to sort ${sortDirection === 'asc' ? 'desc' : 'asc'}ending.`;
    }
    return `Sort by ${header}`;
  };

  return (
    <div className="w-full">
      <Table 
        aria-label={ariaLabel || 'Data table'}
        role="table"
      >
        {caption && (
          <caption className="sr-only">
            {caption}. Table has {data.length} rows and {columns.length} columns.
          </caption>
        )}
        
        <TableHeader>
          <TableRow role="row">
            {columns.map((column, index) => (
              <TableHead
                key={column.key}
                role="columnheader"
                scope="col"
                aria-sort={
                  sortBy === column.key 
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : column.sortable ? 'none' : undefined
                }
                className={column.sortable ? 'cursor-pointer' : ''}
              >
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className="h-8 p-0 hover:bg-transparent"
                    aria-label={getSortButtonLabel(column.key, column.header)}
                  >
                    <span>{column.header}</span>
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-24 text-center"
                role="cell"
              >
                <div role="status" aria-live="polite">
                  {emptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow 
                key={row.id || rowIndex} 
                role="row"
                aria-rowindex={rowIndex + 2} // +2 because header is row 1
              >
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={`${rowIndex}-${column.key}`}
                    role="cell"
                    aria-describedby={colIndex === 0 ? `row-${rowIndex}-description` : undefined}
                  >
                    {column.render 
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Screen reader summary */}
      <div className="sr-only" role="status" aria-live="polite">
        {data.length > 0 && `Table contains ${data.length} rows.`}
        {sortBy && ` Sorted by ${columns.find(c => c.key === sortBy)?.header} in ${sortDirection}ending order.`}
      </div>
    </div>
  );
};

// Accessible Pagination Component
interface AccessiblePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export const AccessiblePagination: React.FC<AccessiblePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  const { announceMessage } = useAccessibility();

  const handlePageChange = (page: number) => {
    onPageChange(page);
    announceMessage(`Navigated to page ${page} of ${totalPages}`);
  };

  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems || 0) : null;

  return (
    <nav role="navigation" aria-label="Table pagination">
      <div className="flex items-center justify-between">
        {/* Page info */}
        <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {startItem && endItem && totalItems && (
            <>Showing {startItem} to {endItem} of {totalItems} entries</>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
          >
            Next
          </Button>
        </div>
      </div>
    </nav>
  );
};