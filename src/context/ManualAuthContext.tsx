
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/hooks/auth/types';
import { useAuthSignIn } from '@/hooks/auth/useAuthSignIn';
import { useAuthProfileUpdate } from '@/hooks/auth/useAuthProfileUpdate';
import { useAuthPermissions } from '@/hooks/auth/useAuthPermissions';
import { supabase } from '@/integrations/supabase/client';

interface ManualAuthContextType {
  profile: Profile | null;
  userRoles: string[];
  activeRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  switchRole: (role: string) => Promise<{ success: boolean; error?: any }>;
  hasRole: (roles: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  isAdmin: () => boolean;
  isAuthenticated: boolean;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

export const ManualAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { signIn: authSignIn } = useAuthSignIn();
  const { updateProfile: authUpdateProfile } = useAuthProfileUpdate();
  const { hasRole, canEdit, canDelete, isAdmin } = useAuthPermissions(profile);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return rolesData?.map(r => r.role) || [];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return userRoles.some(role => roles.includes(role));
  };

  const switchRole = async (role: string) => {
    if (!profile) return { success: false, error: 'Not authenticated' };

    try {
      // Call the database function to switch role
      const { data, error } = await supabase.rpc('switch_user_role', { 
        _role: role 
      });

      if (error) {
        console.error('Error switching role:', error);
        return { success: false, error };
      }

      if (data === true) {
        setActiveRole(role);
        const updatedProfile = { ...profile, active_role: role };
        setProfile(updatedProfile);
        localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
        toast.success(`Switched to ${role} role`);
        return { success: true };
      } else {
        return { success: false, error: 'Role switch failed - user may not have this role' };
      }
    } catch (error) {
      console.error('Error switching role:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedProfile = JSON.parse(savedUser);
          setProfile(parsedProfile);
          
          // Fetch user roles
          if (parsedProfile.id) {
            const roles = await fetchUserRoles(parsedProfile.id);
            setUserRoles(roles);
            setActiveRole(parsedProfile.active_role || roles[0] || 'viewer');
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('currentUser'); // Clear corrupted data
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const result = await authSignIn(username, password);
      if (result.data?.profile) {
        const profileWithRoles = result.data.profile;
        setProfile(profileWithRoles);
        
        // Fetch user roles
        const roles = await fetchUserRoles(profileWithRoles.id);
        setUserRoles(roles);
        setActiveRole(profileWithRoles.active_role || roles[0] || 'viewer');
        
        const updatedProfile = {
          ...profileWithRoles,
          user_roles: roles
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      }
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setProfile(null);
      setUserRoles([]);
      setActiveRole(null);
      localStorage.removeItem('currentUser');
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    await authUpdateProfile(profile, updates, setProfile);
  };

  return (
    <ManualAuthContext.Provider value={{
      profile,
      userRoles,
      activeRole,
      loading,
      signIn,
      signOut,
      updateProfile,
      switchRole,
      hasRole,
      hasAnyRole,
      canEdit,
      canDelete,
      isAdmin,
      isAuthenticated: !!profile
    }}>
      {children}
    </ManualAuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ManualAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a ManualAuthProvider');
  }
  return context;
};
