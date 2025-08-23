
import { toast } from 'sonner';
import { profileService } from './profileService';
import { Profile } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSignIn = () => {
  const signIn = async (username: string, password: string) => {
    try {
      // Simple hardcoded admin check for demo purposes
      if (username === 'Admin' && password === 'Admin123') {
        const adminProfile: Profile = {
          id: 'admin-id',
          username: 'Admin',
          full_name: 'Administrator',
          role: 'admin',
          active_role: 'admin',
          user_roles: ['admin'],
          department: 'Management',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        toast.success('Signed in successfully!');
        return { data: { profile: adminProfile }, error: null };
      }

      // For other users, check the database
      const result = await profileService.findByUsernameAndPassword(username, password);

      if (result.error) {
        throw new Error('Invalid username or password');
      }

      const profiles = result.data || [];
      if (profiles.length === 0) {
        throw new Error('Invalid username or password');
      }

      const profileData = profiles[0];

      // Fetch user roles for this profile
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id)
        .eq('is_active', true);

      const userRoles = rolesData?.map(r => r.role) || [];

      const typedProfile: Profile = {
        id: profileData.id,
        username: profileData.username || '',
        full_name: profileData.full_name || '',
        role: profileData.role || 'viewer',
        active_role: profileData.active_role || userRoles[0] || 'viewer',
        user_roles: userRoles,
        department: profileData.department || '',
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString()
      };

      toast.success('Signed in successfully!');
      return { data: { profile: typedProfile }, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Invalid username or password');
      return { data: null, error };
    }
  };

  return { signIn };
};
