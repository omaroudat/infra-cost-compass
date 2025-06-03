
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const profileService = {
  async checkExistingProfile(username: string) {
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>) {
    try {
      const result = await supabase
        .from('profiles')
        .insert(profileData);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByUsernameAndPassword(username: string, password: string) {
    try {
      const result = await supabase
        .from('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at')
        .eq('username', username)
        .eq('password', password);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    try {
      const result = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string) {
    try {
      const result = await supabase
        .from('profiles')
        .select('id, username, full_name, role, department, created_at, updated_at')
        .eq('id', id);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
