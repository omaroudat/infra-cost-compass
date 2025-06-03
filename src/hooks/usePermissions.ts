
import { useAuth } from '@/context/SupabaseAuthContext';

export const usePermissions = () => {
  const { profile, canEdit, canDelete, isAdmin } = useAuth();

  const hasPermission = (action: 'view' | 'edit' | 'delete' | 'admin'): boolean => {
    if (!profile) return false;

    switch (action) {
      case 'view':
        return true; // All authenticated users can view
      case 'edit':
        return canEdit();
      case 'delete':
        return canDelete();
      case 'admin':
        return isAdmin();
      default:
        return false;
    }
  };

  const checkPermission = (action: 'view' | 'edit' | 'delete' | 'admin'): void => {
    if (!hasPermission(action)) {
      throw new Error(`Access denied: You don't have permission to ${action}`);
    }
  };

  return {
    hasPermission,
    checkPermission,
    userRole: profile?.role || 'viewer',
    isAuthenticated: !!profile
  };
};
