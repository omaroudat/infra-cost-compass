
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

type ServiceResult<T> = {
  data: T | null;
  error: any;
};

export const profileService = {
  async checkExistingProfile(username: string): Promise<ServiceResult<any[]>> {
    try {
      const query = supabase.from('profiles').select('*');
      const filteredQuery = query.eq('username', username);
      const result = await filteredQuery;
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>): Promise<ServiceResult<any>> {
    try {
      const query = supabase.from('profiles').insert(profileData);
      const result = await query;
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByUsernameAndPassword(username: string, password: string): Promise<ServiceResult<any[]>> {
    try {
      const baseQuery = supabase.from('profiles');
      const selectQuery = baseQuery.select('id, username, full_name, role, department, created_at, updated_at');
      const usernameFilter = selectQuery.eq('username', username);
      const passwordFilter = usernameFilter.eq('password', password);
      const result = await passwordFilter;
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<any>> {
    try {
      const query = supabase.from('profiles').update(updates);
      const filteredQuery = query.eq('id', id);
      const result = await filteredQuery;
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string): Promise<ServiceResult<any[]>> {
    try {
      const baseQuery = supabase.from('profiles');
      const selectQuery = baseQuery.select('id, username, full_name, role, department, created_at, updated_at');
      const filteredQuery = selectQuery.eq('id', id);
      const result = await filteredQuery;
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
