
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/hooks/auth/types';
import { useAuthSignIn } from '@/hooks/auth/useAuthSignIn';
import { useAuthProfileUpdate } from '@/hooks/auth/useAuthProfileUpdate';
import { useAuthPermissions } from '@/hooks/auth/useAuthPermissions';
import { logAuditActivity } from '@/hooks/useAuditLogger';
import { supabase } from '@/integrations/supabase/client';

// Define the role types to match our database enum
type AppRole = 'admin' | 'editor' | 'viewer' | 'data_entry';

interface ManualAuthContextType {
  profile: Profile | null;
  userRoles: AppRole[];
  activeRole: AppRole | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  switchRole: (role: AppRole) => Promise<{ success: boolean; error?: any }>;
  hasRole: (roles: string[]) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  isAdmin: () => boolean;
  isAuthenticated: boolean;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

export const ManualAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const { signIn: authSignIn } = useAuthSignIn();
  const { updateProfile: authUpdateProfile } = useAuthProfileUpdate();
  const { hasRole, canEdit, canDelete, isAdmin } = useAuthPermissions(profile);

  const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
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

      return (rolesData?.map(r => r.role) as AppRole[]) || [];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return userRoles.some(role => roles.includes(role));
  };

  const switchRole = async (role: AppRole) => {
    if (!profile) return { success: false, error: 'Not authenticated' };

    try {
      // Update the profile directly in the database
      const { data, error } = await supabase
        .from('profiles')
        .update({ active_role: role, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error switching role:', error);
        return { success: false, error };
      }

      // Update local state
      setActiveRole(role);
      const updatedProfile = { ...profile, active_role: role };
      setProfile(updatedProfile);
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      toast.success(`Switched to ${role} role`);
      return { success: true };
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
            setActiveRole((parsedProfile.active_role as AppRole) || roles[0] || 'viewer');
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
        setActiveRole((profileWithRoles.active_role as AppRole) || roles[0] || 'viewer');
        
        const updatedProfile = {
          ...profileWithRoles,
          user_roles: roles
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
        
        // Log successful login
        logAuditActivity({
          action: 'LOGIN_SUCCESS',
          resourceType: 'AUTH',
          details: { username, roles: roles.join(', ') }
        }, profileWithRoles);
      } else if (result.error) {
        // Log failed login
        logAuditActivity({
          action: 'LOGIN_FAILED',
          resourceType: 'AUTH',
          details: { username, error: result.error.message || 'Login failed' }
        });
      }
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      // Log failed login
      logAuditActivity({
        action: 'LOGIN_FAILED',
        resourceType: 'AUTH',
        details: { username, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Log logout before clearing profile
      logAuditActivity({
        action: 'LOGOUT',
        resourceType: 'AUTH'
      }, profile);
      
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
    if (profile) {
      logAuditActivity({
        action: 'UPDATE',
        resourceType: 'USER',
        resourceId: profile.id,
        details: { updatedFields: Object.keys(updates) }
      }, profile);
    }
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
