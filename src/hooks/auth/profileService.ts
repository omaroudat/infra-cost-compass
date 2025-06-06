
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

type ServiceResult<T> = {
  data: T | null;
  error: any;
};

export const profileService = {
  async checkExistingProfile(username: string): Promise<ServiceResult<Profile[]>> {
    try {
      const query = supabase
        .from('profiles')
        .select('*' as const);
      
      const { data, error } = await query.eq('username', username);
      
      return { data: data as Profile[], error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>): Promise<ServiceResult<Profile>> {
    try {
      const insertQuery = supabase
        .from('profiles')
        .insert(profileData);
      
      const selectQuery = insertQuery.select('*' as const);
      const { data, error } = await selectQuery.single();
      
      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByUsernameAndPassword(username: string, password: string): Promise<ServiceResult<Profile[]>> {
    try {
      const query = supabase
        .from('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at' as const);
      
      const usernameQuery = query.eq('username', username);
      const { data, error } = await usernameQuery.eq('password', password);
      
      return { data: data as Profile[], error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<ServiceResult<Profile>> {
    try {
      const updateQuery = supabase
        .from('profiles')
        .update(updates);
      
      const filterQuery = updateQuery.eq('id', id);
      const selectQuery = filterQuery.select('*' as const);
      const { data, error } = await selectQuery.single();
      
      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string): Promise<ServiceResult<Profile>> {
    try {
      const query = supabase
        .from('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at' as const);
      
      const { data, error } = await query.eq('id', id).single();
      
      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
