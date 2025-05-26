
import React from 'react';
import { Contractor } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface ContractorTableProps {
  contractors: Contractor[];
  onEdit: (contractor: Contractor) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const ContractorTable: React.FC<ContractorTableProps> = ({
  contractors,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}) => {
  if (contractors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No contractors found. Add your first contractor to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
            {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {contractors.map((contractor) => (
            <TableRow key={contractor.id}>
              <TableCell className="font-medium">{contractor.name}</TableCell>
              <TableCell>{contractor.company || '-'}</TableCell>
              <TableCell>{contractor.email || '-'}</TableCell>
              <TableCell>{contractor.phone || '-'}</TableCell>
              <TableCell>{new Date(contractor.createdAt).toLocaleDateString()}</TableCell>
              {(canEdit || canDelete) && (
                <TableCell>
                  <div className="flex space-x-2">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(contractor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(contractor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractorTable;
