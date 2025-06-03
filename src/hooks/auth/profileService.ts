
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const profileService = {
  async checkExistingProfile(email: string) {
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
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

  async findByEmailAndPassword(email: string, password: string) {
    try {
      const query = supabase
        .from('profiles')
        .select('id, username, full_name, email, role, department, created_at, updated_at')
        .eq('email', email)
        .eq('password', password);
      
      const result = await query;
      
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
        .select('id, username, full_name, email, role, department, created_at, updated_at')
        .eq('id', id);
      
      return { data: result.data, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
