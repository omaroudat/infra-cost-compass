
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

type ServiceResult<T> = {
  data: T | null;
  error: any;
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
      // Extract only the fields that exist in the database
      const dbData = {
        id: profileData.id,
        username: profileData.username,
        full_name: profileData.full_name,
        role: profileData.role,
        active_role: profileData.active_role || 'viewer',
        department: profileData.department,
        password: profileData.password,
        created_at: profileData.created_at
      };

      const result = await supabase
        .from('profiles')
        .insert([dbData])
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
      const dbUpdates: any = {};
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

  async getAllProfiles(): Promise<ServiceResult<Profile[]>> {
    try {
      const result = await supabase
        .from('profiles')
        .select('id, username, full_name, role, active_role, department, created_at, updated_at')
        .order('created_at', { ascending: false });

      return { data: result.data as Profile[] | null, error: result.error };
    } catch (error) {
      return { data: null, error };
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
