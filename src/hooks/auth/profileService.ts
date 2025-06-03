
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const profileService = {
  async checkExistingProfile(email: string) {
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    return result;
  },

  async createProfile(profileData: Omit<Profile, 'updated_at'>) {
    const result = await supabase
      .from('profiles')
      .insert(profileData);
    
    return result;
  },

  async findByEmailAndPassword(email: string, password: string) {
    const result = await supabase
      .from('profiles')
      .select('id, username, full_name, email, role, department, created_at, updated_at')
      .eq('email', email)
      .eq('password', password);
    
    return result;
  },

  async updateProfile(id: string, updates: Partial<Profile>) {
    const result = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    
    return result;
  },

  async fetchProfile(id: string) {
    const result = await supabase
      .from('profiles')
      .select('id, username, full_name, email, role, department, created_at, updated_at')
      .eq('id', id);
    
    return result;
  }
};
