
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
      const result = await supabase
        .from('profiles')
        .insert([profileData])
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
        .select('id, username, full_name, role, department, created_at, updated_at')
        .eq('username', username);

      return { data: result.data as Profile[] | null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<Profile>> {
    try {
      const result = await supabase
        .from('profiles')
        .update(updates)
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
        .select('id, username, full_name, role, department, created_at, updated_at')
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
        .select('id, username, full_name, role, department, created_at, updated_at')
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
