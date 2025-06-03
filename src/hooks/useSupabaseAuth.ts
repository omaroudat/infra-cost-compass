
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
  created_at: string;
  updated_at: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with proper error handling
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                if (error.code === 'PGRST116') {
                  console.log('Profile not found, user needs to complete setup');
                  toast.error('User profile not found. Please contact administrator.');
                } else {
                  console.error('Error fetching profile:', error);
                  toast.error('Failed to load user profile');
                }
              } else if (profileData) {
                // Type cast the role to ensure it matches our Profile interface
                const typedProfile: Profile = {
                  ...profileData,
                  role: profileData.role as 'admin' | 'editor' | 'viewer'
                };
                setProfile(typedProfile);
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
              toast.error('Failed to load user data');
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    const identifier = email;
    
    if (!authRateLimiter.isAllowed(identifier)) {
      toast.error('Too many signup attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username || email.split('@')[0],
            full_name: fullName || username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;
      
      if (data.user && !data.session) {
        toast.success('Check your email for the confirmation link!');
      } else {
        toast.success('Account created successfully!');
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign up';
      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Try signing in instead.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast.success('Signed in successfully!');
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Invalid username or password';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid username or password. Please check your credentials.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Account not activated. Please contact administrator.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      
      // Refetch profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error('Error refetching profile:', fetchError);
      } else if (profileData) {
        // Type cast the role to ensure it matches our Profile interface
        const typedProfile: Profile = {
          ...profileData,
          role: profileData.role as 'admin' | 'editor' | 'viewer'
        };
        setProfile(typedProfile);
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
