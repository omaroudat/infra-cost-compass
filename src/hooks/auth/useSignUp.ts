
import { toast } from 'sonner';
import { authRateLimiter } from '@/utils/rateLimiter';
import { profileService } from './profileService';
import { Profile } from './types';

export const useSignUp = () => {
  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    const identifier = email;
    
    if (!authRateLimiter.isAllowed(identifier)) {
      toast.error('Too many signup attempts. Please try again later.');
      return { data: null, error: { message: 'Rate limit exceeded' } };
    }

    try {
      const existingQuery = await profileService.checkExistingProfile(email);

      if (existingQuery.data && existingQuery.data.length > 0) {
        toast.error('This email is already registered. Try signing in instead.');
        return { data: null, error: { message: 'User already exists' } };
      }

      const newProfile: Omit<Profile, 'updated_at'> = {
        id: crypto.randomUUID(),
        username: username || email.split('@')[0],
        password: password,
        full_name: fullName || username || email.split('@')[0],
        email: email,
        role: 'viewer' as const,
        department: 'General',
        created_at: new Date().toISOString()
      };

      const insertResult = await profileService.createProfile(newProfile);

      if (insertResult.error) throw insertResult.error;
      
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

  return { signUp };
};
