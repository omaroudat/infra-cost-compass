
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Profile } from '@/hooks/auth/types';
import { useAuthSignIn } from '@/hooks/auth/useAuthSignIn';
import { useAuthProfileUpdate } from '@/hooks/auth/useAuthProfileUpdate';
import { useAuthPermissions } from '@/hooks/auth/useAuthPermissions';

interface ManualAuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  isAdmin: () => boolean;
  isAuthenticated: boolean;
}

const ManualAuthContext = createContext<ManualAuthContextType | undefined>(undefined);

export const ManualAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { signIn: authSignIn } = useAuthSignIn();
  const { updateProfile: authUpdateProfile } = useAuthProfileUpdate();
  const { hasRole, canEdit, canDelete, isAdmin } = useAuthPermissions(profile);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedProfile = JSON.parse(savedUser);
          setProfile(parsedProfile);
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
        setProfile(result.data.profile);
        localStorage.setItem('currentUser', JSON.stringify(result.data.profile));
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
      loading,
      signIn,
      signOut,
      updateProfile,
      hasRole,
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
