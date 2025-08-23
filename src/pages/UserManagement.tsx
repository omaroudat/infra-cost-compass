
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/ManualAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, UserCheck, Trash2, Edit, Settings, RefreshCw } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { profileService, ProfileWithRoles } from '@/hooks/auth/profileService';
import { UserDialog } from '@/components/UserDialog';
import RoleManager from '@/components/RoleManager';

const UserManagement = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [roleManageUser, setRoleManageUser] = useState<any>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await profileService.getAllProfiles();
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
  };

  const handleUserDialogSuccess = () => {
    fetchUsers();
  };

  const handleManageRoles = (user: any) => {
    setRoleManageUser(user);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const { data, error } = await profileService.deleteProfile(userId);
      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } else {
        toast.success(`User ${username} deleted successfully`);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSwitchRole = async (userId: string, newRole: string, username: string) => {
    try {
      const { error } = await profileService.switchUserRole(userId, newRole as 'admin' | 'editor' | 'viewer' | 'data_entry');
      if (error) {
        console.error('Error switching role:', error);
        toast.error('Failed to switch role');
      } else {
        toast.success(`${username}'s active role switched to ${newRole}`);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error switching role:', error);
      toast.error('Failed to switch role');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'editor': return 'Editor';
      case 'data_entry': return 'Data Entry';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'default';
      case 'data_entry': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to manage users.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage system users and their roles ({users.length} users)
            </CardDescription>
          </div>
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    {(() => {
                      const userRoles = user.user_roles?.map(r => r?.role).filter(Boolean) || [];
                      const hasMultipleRoles = userRoles.length > 1;
                      
                      if (hasMultipleRoles) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {userRoles.map((role) => (
                              <Badge 
                                key={role} 
                                variant={role === user.active_role ? getRoleColor(role) : 'outline'}
                                className="text-xs"
                              >
                                {getRoleLabel(role)}
                                {role === user.active_role && ' (Active)'}
                              </Badge>
                            ))}
                          </div>
                        );
                      } else {
                        // Single role or fallback to legacy role
                        const displayRole = userRoles[0] || user.role;
                        return (
                          <Badge variant={getRoleColor(displayRole)} className="text-xs">
                            {getRoleLabel(displayRole)}
                          </Badge>
                        );
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageRoles(user)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={user.username === 'admin'} // Prevent deleting the main admin
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Dialog */}
      <UserDialog 
        isOpen={isUserDialogOpen}
        onClose={handleUserDialogClose}
        onSuccess={handleUserDialogSuccess}
        user={editingUser}
      />

      {/* Role Manager Dialog */}
      {roleManageUser && (
        <RoleManager 
          userId={roleManageUser.id}
          currentRoles={roleManageUser.user_roles?.map(r => r.role) || [roleManageUser.role]} 
          onRolesUpdated={() => {
            fetchUsers();
            setRoleManageUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
