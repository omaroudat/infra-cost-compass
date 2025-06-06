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
        .from<Profile>('profiles')
        .select('*')
        .eq('username', username);

      return { data: result.data ?? null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>): Promise<ServiceResult<Profile>> {
    try {
      const result = await supabase
        .from<Profile>('profiles')
        .insert(profileData);

      return { data: result.data ? result.data[0] : null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByUsernameAndPassword(username: string, password: string): Promise<ServiceResult<Profile[]>> {
    try {
      const result = await supabase
        .from<Profile>('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at')
        .eq('username', username)
        .eq('password', password);

      return { data: result.data ?? null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<Profile>> {
    try {
      const result = await supabase
        .from<Profile>('profiles')
        .update(updates)
        .eq('id', id);

      return { data: result.data ? result.data[0] : null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string): Promise<ServiceResult<Profile[]>> {
    try {
      const result = await supabase
        .from<Profile>('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at')
        .eq('id', id);

      return { data: result.data ?? null, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
