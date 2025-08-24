import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from './skeleton-loader';

interface DataTableLoadingProps {
  columns: number;
  rows?: number;
  showActions?: boolean;
}

export const DataTableLoading: React.FC<DataTableLoadingProps> = ({
  columns,
  rows = 5,
  showActions = true
}) => {
  const totalColumns = showActions ? columns + 1 : columns;

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: totalColumns }).map((_, i) => (
                <TableHead key={i} className="h-12">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: totalColumns }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="h-16">
                    {colIndex === totalColumns - 1 && showActions ? (
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full max-w-[150px]" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Enhanced Table with Loading State
interface EnhancedTableProps {
  isLoading: boolean;
  children: React.ReactNode;
  columns: number;
  rows?: number;
  showActions?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export const EnhancedTable: React.FC<EnhancedTableProps> = ({
  isLoading,
  children,
  columns,
  rows = 5,
  showActions = true,
  emptyMessage = 'No data available',
  isEmpty = false
}) => {
  if (isLoading) {
    return <DataTableLoading columns={columns} rows={rows} showActions={showActions} />;
  }

  if (isEmpty) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns + (showActions ? 1 : 0)} className="h-32">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">No data found</p>
                      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};