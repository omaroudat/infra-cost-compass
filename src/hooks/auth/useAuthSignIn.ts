import { toast } from 'sonner';
import { profileService } from './profileService';
import { Profile } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useAuthSignIn = () => {
  const signIn = async (username: string, password: string) => {
    try {
      console.log('🔐 Starting authentication for:', username);
      
      // Check admin credentials and fetch from database
      if (username === 'Admin' && password === 'Admin123') {
        console.log('🔍 Fetching admin profile from database...');
        
        // Fetch the admin profile from database
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', 'Admin')
          .eq('password', 'Admin123')
          .single();

        if (adminError || !adminData) {
          console.error('❌ Admin user not found in database:', adminError);
          throw new Error('Admin user not found in database');
        }

        console.log('✅ Admin profile found:', adminData);

        // Fetch user roles for admin
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', adminData.id)
          .eq('is_active', true);

        console.log('👥 User roles query result:', rolesData, rolesError);

        const userRoles = rolesData?.map(r => r.role) || ['admin'];

        const adminProfile: Profile = {
          id: adminData.id,
          username: adminData.username || 'Admin',
          full_name: adminData.full_name || 'Administrator',
          role: adminData.role || 'admin',
          active_role: adminData.active_role || 'admin',
          user_roles: userRoles,
          department: adminData.department || 'Management',
          created_at: adminData.created_at || new Date().toISOString(),
          updated_at: adminData.updated_at || new Date().toISOString()
        };

        console.log('🎉 Final admin profile:', adminProfile);
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