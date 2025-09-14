
import { useState } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/hooks/auth/profileService';
import { UserRole } from '@/types/auth';
import { logAuditActivity } from '@/hooks/useAuditLogger';
import { useAuth } from '@/context/ManualAuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CreateUserData {
  username: string;
  password: string;
  role: UserRole;
  fullName?: string;
}

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { profile } = useAuth();

  const createUser = async (userData: CreateUserData) => {
    setIsLoading(true);
    
    try {
      console.log('Creating user with data:', userData);

      // Check if username already exists
      const { data: existingUsers, error: checkError } = await profileService.checkExistingProfile(userData.username);
      
      if (checkError) {
        console.error('Error checking existing user:', checkError);
        toast.error('Failed to check existing users');
        return { success: false, error: checkError };
      }

      if (existingUsers && existingUsers.length > 0) {
        toast.error('Username already exists');
        return { success: false, error: 'Username already exists' };
      }

      // Create new profile directly in the profiles table
      const newProfile = {
        id: crypto.randomUUID(), // Generate a UUID for the user
        username: userData.username,
        full_name: userData.fullName || userData.username,
        role: userData.role,
        active_role: userData.role,
        password: userData.password, // Now this column exists
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating profile:', newProfile);

      const { data: createdProfile, error: createError } = await profileService.createProfile(newProfile);

      if (createError) {
        console.error('Error creating user:', createError);
        toast.error(`Failed to create user: ${createError.message || 'Unknown error'}`);
        return { success: false, error: createError };
      }

      console.log('User created successfully:', createdProfile);
      toast.success(`User ${userData.username} created successfully`);
      
      // Ensure role is assigned in user_roles and get created id
      const createdId = (createdProfile as any)?.id || newProfile.id;
      try {
        const { error: roleInsertError } = await supabase
          .from('user_roles')
          .insert([{ user_id: createdId, role: userData.role }]);
        if (roleInsertError) {
          console.error('Error assigning role to user_roles:', roleInsertError);
          toast.error('User created, but failed to assign role.');
        }
      } catch (e) {
        console.error('Unexpected error assigning role:', e);
      }
      
      // Log user creation
      logAuditActivity({
        action: 'CREATE',
        resourceType: 'USER',
        resourceId: createdId,
        details: {
          username: userData.username,
          role: userData.role,
          fullName: userData.fullName
        }
      }, profile);
      
      // Refresh users list
      await fetchUsers();
      
      return { success: true, data: createdProfile };
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateUser = async (id: string, updates: Partial<CreateUserData>) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await profileService.updateProfile(id, {
        username: updates.username,
        full_name: updates.fullName,
        role: updates.role,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
        return { success: false, error };
      }

      toast.success('User updated successfully');
      
      // Log user update
      logAuditActivity({
        action: 'UPDATE',
        resourceType: 'USER',
        resourceId: id,
        details: {
          updatedFields: Object.keys(updates),
          username: updates.username,
          role: updates.role
        }
      }, profile);
      
      await fetchUsers();
      
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error updating user:', error);
      toast.error('An unexpected error occurred');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await profileService.deleteProfile(id);
      
      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
        return { success: false, error };
      }

      toast.success('User deleted successfully');
      
      // Log user deletion
      logAuditActivity({
        action: 'DELETE',
        resourceType: 'USER',
        resourceId: id,
        details: { action: 'delete_user' }
      }, profile);
      
      await fetchUsers();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers
  };
};
