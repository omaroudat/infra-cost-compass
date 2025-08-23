import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, Shield, Eye, Users, Plus } from 'lucide-react';

interface RoleManagerProps {
  userId: string;
  currentRoles: string[];
  onRolesUpdated: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ userId, currentRoles, onRolesUpdated }) => {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const availableRoles = [
    { value: 'admin', label: 'Administrator', icon: Crown, color: 'bg-red-500' },
    { value: 'editor', label: 'Editor', icon: Shield, color: 'bg-blue-500' },
    { value: 'viewer', label: 'Viewer', icon: Eye, color: 'bg-gray-500' },
    { value: 'data_entry', label: 'Data Entry', icon: Users, color: 'bg-green-500' }
  ];

  const handleAddRole = async () => {
    if (!selectedRole || currentRoles.includes(selectedRole)) {
      toast.error('Role already assigned or invalid selection');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: selectedRole }]);

      if (error) throw error;

      toast.success(`${selectedRole} role added successfully`);
      setIsAddingRole(false);
      setSelectedRole('');
      onRolesUpdated();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    }
  };

  const handleRemoveRole = async (role: string) => {
    if (currentRoles.length === 1) {
      toast.error('Cannot remove the last role');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`${role} role removed successfully`);
      onRolesUpdated();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {currentRoles.map((role) => {
            const roleConfig = availableRoles.find(r => r.value === role);
            const Icon = roleConfig?.icon || Users;
            
            return (
              <Badge 
                key={role} 
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1"
              >
                <Icon className="h-3 w-3" />
                {roleConfig?.label || role}
                {currentRoles.length > 1 && (
                  <button
                    onClick={() => handleRemoveRole(role)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </Badge>
            );
          })}
        </div>

        <Dialog open={isAddingRole} onOpenChange={setIsAddingRole}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>
                Select a role to assign to this user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles
                    .filter(role => !currentRoles.includes(role.value))
                    .map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <role.icon className="h-4 w-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingRole(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole} disabled={!selectedRole}>
                  Add Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleManager;