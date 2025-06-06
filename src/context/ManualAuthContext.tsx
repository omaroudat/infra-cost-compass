
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/hooks/auth/profileService';
import { Profile } from '@/hooks/auth/types';

interface ManualAuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (username: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedProfile = JSON.parse(savedUser);
          setProfile(parsedProfile);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const result = await profileService.findByUsernameAndPassword(username, password);

      if (result.error) {
        throw new Error('Invalid username or password');
      }

      const profiles = result.data || [];
      if (profiles.length === 0) {
        throw new Error('Invalid username or password');
      }

      const profileData = profiles[0];
      const typedProfile: Profile = {
        id: profileData.id,
        username: profileData.username || '',
        full_name: profileData.full_name || '',
        role: (profileData.role as 'admin' | 'editor' | 'viewer') || 'viewer',
        department: profileData.department || '',
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString()
      };

      setProfile(typedProfile);
      localStorage.setItem('currentUser', JSON.stringify(typedProfile));
      
      toast.success('Signed in successfully!');
      return { data: { profile: typedProfile }, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Invalid username or password');
      return { data: null, error };
    }
  };

  const signUp = async (username: string, password: string, fullName?: string) => {
    try {
      const existingQuery = await profileService.checkExistingProfile(username);

      if (existingQuery.data && existingQuery.data.length > 0) {
        toast.error('This username is already registered. Try signing in instead.');
        return { data: null, error: { message: 'User already exists' } };
      }

      const newProfile: Omit<Profile, 'updated_at'> = {
        id: crypto.randomUUID(),
        username: username,
        password: password,
        full_name: fullName || username,
        role: 'viewer',
        department: 'General',
        created_at: new Date().toISOString()
      };

      const insertResult = await profileService.createProfile(newProfile);

      if (insertResult.error) throw insertResult.error;
      
      toast.success('Account created successfully! Please sign in.');
      return { data: { user: newProfile }, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('Failed to sign up');
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
    if (!profile) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const updateResult = await profileService.updateProfile(profile.id, updates);

      if (updateResult.error) throw updateResult.error;
      
      toast.success('Profile updated successfully!');
      
      const fetchResult = await profileService.fetchProfile(profile.id);
      
      if (fetchResult.error) {
        console.error('Error refetching profile:', fetchResult.error);
      } else if (fetchResult.data) {
        const profileData = fetchResult.data;
        const typedProfile: Profile = {
          id: profileData.id,
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          role: (profileData.role as 'admin' | 'editor' | 'viewer') || 'viewer',
          department: profileData.department || '',
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || new Date().toISOString()
        };
        setProfile(typedProfile);
        localStorage.setItem('currentUser', JSON.stringify(typedProfile));
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const hasRole = (roles: string[]) => {
    return profile && roles.includes(profile.role);
  };

  const canEdit = () => hasRole(['admin', 'editor']);
  const canDelete = () => hasRole(['admin']);
  const isAdmin = () => hasRole(['admin']);

  return (
    <ManualAuthContext.Provider value={{
      profile,
      loading,
      signIn,
      signUp,
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
