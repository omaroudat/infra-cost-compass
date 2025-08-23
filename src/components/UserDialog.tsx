import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserRole } from '@/types/auth';
import { useUserManagement } from '@/hooks/useUserManagement';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // For editing existing user
}

export const UserDialog = ({ isOpen, onClose, onSuccess, user }: UserDialogProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const { createUser, updateUser } = useUserManagement();

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.full_name || '');
      setRole(user.role || 'viewer');
      setPassword(''); // Don't show existing password
    } else {
      // Reset form for new user
      setUsername('');
      setFullName('');
      setRole('viewer');
      setPassword('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!isEditMode && !password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    if (!isEditMode && password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (isEditMode) {
        result = await updateUser(user.id, {
          username: username.trim(),
          fullName: fullName.trim() || username.trim(),
          role,
          ...(password.trim() && { password: password.trim() }) // Only update password if provided
        });
      } else {
        result = await createUser({
          username: username.trim(),
          password: password.trim(),
          role,
          fullName: fullName.trim() || username.trim()
        });
      }
      
      if (result.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update user information and permissions.' : 'Create a new user and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditMode && <span className="text-sm text-muted-foreground">(leave empty to keep current)</span>}
            </Label>
            <Input 
              id="password"
              type="password"
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditMode}
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="data_entry">Data Entry</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};