
import { toast } from 'sonner';
import { authRateLimiter } from '@/utils/rateLimiter';
import { profileService } from './profileService';
import { Profile } from './types';

export const useSignIn = () => {
  const signIn = async (email: string, password: string) => {
    const identifier = email;
    
    if (!authRateLimiter.isAllowed(identifier)) {
      toast.error('Too many login attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const result = await profileService.findByEmailAndPassword(email, password);

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
        email: profileData.email || '',
        role: (profileData.role as 'admin' | 'editor' | 'viewer') || 'viewer',
        department: profileData.department || undefined,
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString()
      };

      const mockUser = {
        id: typedProfile.id,
        email: typedProfile.email,
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated' as const,
        created_at: typedProfile.created_at
      };

      const mockSession = {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh',
        expires_in: 3600,
        token_type: 'bearer' as const,
        user: mockUser
      };

      localStorage.setItem('currentUser', JSON.stringify(typedProfile));
      
      toast.success('Signed in successfully!');
      return { data: { user: mockUser, session: mockSession, profile: typedProfile }, error: null };
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

  return { signIn };
};
