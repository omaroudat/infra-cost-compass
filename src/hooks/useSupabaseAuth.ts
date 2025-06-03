
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { authRateLimiter } from '@/utils/rateLimiter';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  department?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session from localStorage
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedProfile = JSON.parse(savedUser);
          setProfile(parsedProfile);
          // Create a mock user object for compatibility
          const mockUser = {
            id: parsedProfile.id,
            email: parsedProfile.email,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: parsedProfile.created_at
          } as User;
          setUser(mockUser);
          
          // Create a mock session
          const mockSession = {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser
          } as Session;
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

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    const identifier = email;
    
    if (!authRateLimiter.isAllowed(identifier)) {
      toast.error('Too many signup attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast.error('This email is already registered. Try signing in instead.');
        return { data: null, error: { message: 'User already exists' } };
      }

      // Create new profile
      const newProfile = {
        id: crypto.randomUUID(),
        username: username || email.split('@')[0],
        password: password,
        full_name: fullName || username || email.split('@')[0],
        email: email,
        role: 'viewer' as const,
        department: 'General',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile);

      if (insertError) throw insertError;
      
      toast.success('Account created successfully! Please sign in.');
      return { data: { user: newProfile }, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const identifier = email;
    
    if (!authRateLimiter.isAllowed(identifier)) {
      toast.error('Too many login attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      // Query profiles table for username/password authentication
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !profileData) {
        throw new Error('Invalid username or password');
      }

      // Create mock user and session objects
      const mockUser = {
        id: profileData.id,
        email: profileData.email,
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: profileData.created_at
      } as User;

      const mockSession = {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      } as Session;

      setUser(mockUser);
      setSession(mockSession);
      setProfile(profileData);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(profileData));
      
      toast.success('Signed in successfully!');
      return { data: { user: mockUser, session: mockSession }, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Invalid username or password';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      return { data: null, error };
    }
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
    if (!profile) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      
      // Refetch profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (fetchError) {
        console.error('Error refetching profile:', fetchError);
      } else if (profileData) {
        const typedProfile: Profile = {
          ...profileData,
          role: profileData.role as 'admin' | 'editor' | 'viewer'
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

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    hasRole,
    canEdit,
    canDelete,
    isAdmin,
    isAuthenticated: !!user
  };
};
