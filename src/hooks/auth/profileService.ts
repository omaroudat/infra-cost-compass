
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

type ServiceResult<T> = {
  data: T | null;
  error: any;
};

// Extended profile type for user management with roles
export type ProfileWithRoles = Profile & {
  user_roles?: { role: string }[];
};

export const profileService = {
  async checkExistingProfile(username: string): Promise<ServiceResult<Profile[]>> {
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username);

      return { data: result.data as Profile[] | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>): Promise<ServiceResult<Profile>> {
    try {
      // Extract only the fields that exist in the database and use proper types
      const dbData = {
        id: profileData.id,
        username: profileData.username,
        full_name: profileData.full_name,
        role: profileData.role,
        active_role: (profileData.active_role || 'viewer') as 'admin' | 'editor' | 'viewer' | 'data_entry',
        department: profileData.department,
        password: profileData.password,
        created_at: profileData.created_at
      };

      const result = await supabase
        .from('profiles')
        .insert(dbData)
        .select()
        .single();

      return { data: result.data as Profile | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByUsernameAndPassword(username: string, password: string): Promise<ServiceResult<Profile[]>> {
    try {
      // Since password might not be in the database, we'll need to handle this differently
      // For now, let's just find by username and handle password checking in the auth context
      const result = await supabase
        .from('profiles')
        .select('id, username, full_name, role, active_role, department, created_at, updated_at')
        .eq('username', username);

      return { data: result.data as Profile[] | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<Profile>> {
    try {
      // Extract only the fields that exist in the database
      const dbUpdates: Record<string, any> = {};
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.active_role !== undefined) dbUpdates.active_role = updates.active_role;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.password !== undefined) dbUpdates.password = updates.password;

      const result = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      return { data: result.data as Profile | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string): Promise<ServiceResult<Profile>> {
    try {
      const result = await supabase
        .from('profiles')
        .select('id, username, full_name, role, active_role, department, created_at, updated_at')
        .eq('id', id)
        .single();

      return { data: result.data as Profile | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAllProfiles(): Promise<ServiceResult<any[]>> {
    try {
      // First get all profiles
      const profilesResult = await supabase
        .from('profiles')
        .select('id, username, full_name, role, active_role, department, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (profilesResult.error) {
        return { data: null, error: profilesResult.error };
      }

      // Then get all user roles
      const rolesResult = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('is_active', true);

      if (rolesResult.error) {
        return { data: profilesResult.data, error: null }; // Return profiles even if roles fail
      }

      // Combine the data
      const profilesWithRoles = profilesResult.data?.map(profile => ({
        ...profile,
        user_roles: rolesResult.data?.filter(role => role.user_id === profile.id).map(r => ({ role: r.role })) || []
      })) || [];

      return { data: profilesWithRoles, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async switchUserRole(userId: string, newRole: 'admin' | 'editor' | 'viewer' | 'data_entry'): Promise<ServiceResult<boolean>> {
    try {
      const result = await supabase
        .from('profiles')
        .update({ active_role: newRole })
        .eq('id', userId);

      return { data: !result.error, error: result.error };
    } catch (error) {
      return { data: false, error };
    }
  },

  async deleteProfile(id: string): Promise<ServiceResult<boolean>> {
    try {
      const result = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      return { data: !result.error, error: result.error };
    } catch (error) {
      return { data: false, error };
    }
  }
};
