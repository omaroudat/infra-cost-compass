
import { toast } from 'sonner';
import { profileService } from './profileService';
import { Profile } from './types';

export const useAuthSignUp = () => {
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

  return { signUp };
};
