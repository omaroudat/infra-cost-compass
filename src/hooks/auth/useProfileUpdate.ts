
import { toast } from 'sonner';
import { profileService } from './profileService';
import { Profile } from './types';

export const useProfileUpdate = () => {
  const updateProfile = async (profile: Profile | null, updates: Partial<Profile>, setProfile: (profile: Profile) => void) => {
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
      } else if (fetchResult.data && fetchResult.data.length > 0) {
        const profileData = fetchResult.data[0];
        const typedProfile: Profile = {
          id: profileData.id,
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          role: (profileData.role as 'admin' | 'editor' | 'viewer') || 'viewer',
          department: profileData.department || undefined,
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

  return { updateProfile };
};
