
import { Profile } from './types';

export const useAuthPermissions = (profile: Profile | null) => {
  const hasRole = (roles: string[]) => {
    return profile && roles.includes(profile.role);
  };

  const canEdit = () => hasRole(['admin', 'editor', 'data_entry']);
  const canDelete = () => hasRole(['admin', 'editor']);
  const isAdmin = () => hasRole(['admin']);

  return {
    hasRole,
    canEdit,
    canDelete,
    isAdmin
  };
};
