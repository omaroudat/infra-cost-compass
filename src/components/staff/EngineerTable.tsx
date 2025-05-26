
import React from 'react';
import { Engineer } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface EngineerTableProps {
  engineers: Engineer[];
  onEdit: (engineer: Engineer) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const EngineerTable: React.FC<EngineerTableProps> = ({
  engineers,
  onEdit,
  onDelete,
  canEdit,
  canDelete
}) => {
  if (engineers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No engineers found. Add your first engineer to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Created</TableHead>
            {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {engineers.map((engineer) => (
            <TableRow key={engineer.id}>
              <TableCell className="font-medium">{engineer.name}</TableCell>
              <TableCell>{engineer.department || '-'}</TableCell>
              <TableCell>{engineer.specialization || '-'}</TableCell>
              <TableCell>{engineer.email || '-'}</TableCell>
              <TableCell>{engineer.phone || '-'}</TableCell>
              <TableCell>{new Date(engineer.createdAt).toLocaleDateString()}</TableCell>
              {(canEdit || canDelete) && (
                <TableCell>
                  <div className="flex space-x-2">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(engineer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(engineer.id)}
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

export default EngineerTable;
