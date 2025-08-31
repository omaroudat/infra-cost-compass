
import { useState } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/hooks/auth/profileService';
import { UserRole } from '@/types/auth';
import { useAuditLogger } from '@/hooks/useAuditLogger';

export interface CreateUserData {
  username: string;
  password: string;
  role: UserRole;
  fullName?: string;
}

export const useUserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const { logCreate, logUpdate, logDelete } = useAuditLogger();

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
      
      // Log user creation
      logCreate('USER', createdProfile[0]?.id || 'unknown', {
        username: userData.username,
        role: userData.role,
        fullName: userData.fullName
      });
      
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
      logUpdate('USER', id, {
        updatedFields: Object.keys(updates),
        username: updates.username,
        role: updates.role
      });
      
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
      logDelete('USER', id, { action: 'delete_user' });
      
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
