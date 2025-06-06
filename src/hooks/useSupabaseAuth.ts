
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAuthSignIn } from './auth/useAuthSignIn';
import { useAuthProfileUpdate } from './auth/useAuthProfileUpdate';
import { useAuthPermissions } from './auth/useAuthPermissions';
import { Profile } from './auth/types';

export type { Profile } from './auth/types';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { signIn } = useAuthSignIn();
  const { updateProfile: updateProfileService } = useAuthProfileUpdate();
  const permissions = useAuthPermissions(profile);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedProfile = JSON.parse(savedUser);
          setProfile(parsedProfile);
          
          const mockUser = {
            id: parsedProfile.id,
            email: parsedProfile.username,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated' as const,
            created_at: parsedProfile.created_at
          };
          setUser(mockUser);
          
          const mockSession = {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expires_in: 3600,
            token_type: 'bearer' as const,
            user: mockUser
          };
          setSession(mockSession);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    const result = await signIn(username, password);
    if (result.data && !result.error) {
      setUser(result.data.user);
      setSession(result.data.session);
      setProfile(result.data.profile);
    }
    return result;
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.removeItem('currentUser');
      
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    await updateProfileService(profile, updates, setProfile);
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn: handleSignIn,
    signOut,
    updateProfile,
    ...permissions,
    isAuthenticated: !!user
  };
};
