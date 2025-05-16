
import React from 'react';
import { PercentageAdjustment } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface AdjustmentsTableProps {
  adjustments: PercentageAdjustment[];
  onEdit: (adjustment: PercentageAdjustment) => void;
  onDelete: (id: string) => void;
}

const AdjustmentsTable = ({ adjustments, onEdit, onDelete }: AdjustmentsTableProps) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Value (SAR)</TableHead>
            <TableHead>Percentage Adjustment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adjustment) => (
            <TableRow key={adjustment.id}>
              <TableCell className="font-medium">
                {adjustment.keyword}
              </TableCell>
              <TableCell>
                {adjustment.description}
              </TableCell>
              <TableCell>
                {adjustment.value ? adjustment.value.toLocaleString('ar-SA') : '-'}
              </TableCell>
              <TableCell>
                {(adjustment.percentage * 100).toFixed(0)}%
              </TableCell>
              <TableCell className="text-right">
                <div className="flex space-x-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(adjustment)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete(adjustment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdjustmentsTable;
