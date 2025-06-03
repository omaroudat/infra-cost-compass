
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const profileService = {
  async checkExistingProfile(email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async findByEmailAndPassword(email: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, role, department, created_at, updated_at')
        .eq('email', email)
        .eq('password', password);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async fetchProfile(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, role, department, created_at, updated_at')
        .eq('id', id);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};
