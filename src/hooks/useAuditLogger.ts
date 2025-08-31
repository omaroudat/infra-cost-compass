import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/ManualAuthContext';
import { Profile } from './auth/types';

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
}

// Standalone audit logging function that doesn't depend on auth context
export const logAuditActivity = async (data: AuditLogData, profile?: Profile | null) => {
  try {
    const logEntry = {
      user_id: profile?.id || null,
      username: profile?.username || 'Unknown',
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      details: data.details || {},
      ip_address: null, // Could be enhanced with IP detection
      user_agent: navigator.userAgent
    };

    const { error } = await supabase
      .from('audit_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Failed to log audit activity:', error);
    }
  } catch (error) {
    console.error('Error logging audit activity:', error);
  }
};

export const useAuditLogger = () => {
  const { profile } = useAuth();

  const logActivity = async (data: AuditLogData) => {
    try {
      const logEntry = {
        user_id: profile?.id || null,
        username: profile?.username || 'Unknown',
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        details: data.details || {},
        ip_address: null, // Could be enhanced with IP detection
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Failed to log audit activity:', error);
      }
    } catch (error) {
      console.error('Error logging audit activity:', error);
    }
  };

  const logLogin = (success: boolean, details?: Record<string, any>) => {
    logActivity({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      resourceType: 'AUTH',
      details
    });
  };

  const logLogout = () => {
    logActivity({
      action: 'LOGOUT',
      resourceType: 'AUTH'
    });
  };

  const logCreate = (resourceType: string, resourceId: string, details?: Record<string, any>) => {
    logActivity({
      action: 'CREATE',
      resourceType,
      resourceId,
      details
    });
  };

  const logUpdate = (resourceType: string, resourceId: string, details?: Record<string, any>) => {
    logActivity({
      action: 'UPDATE',
      resourceType,
      resourceId,
      details
    });
  };

  const logDelete = (resourceType: string, resourceId: string, details?: Record<string, any>) => {
    logActivity({
      action: 'DELETE',
      resourceType,
      resourceId,
      details
    });
  };

  const logApproval = (resourceType: string, resourceId: string, result: string, details?: Record<string, any>) => {
    logActivity({
      action: 'APPROVAL',
      resourceType,
      resourceId,
      details: { result, ...details }
    });
  };

  return {
    logActivity,
    logLogin,
    logLogout,
    logCreate,
    logUpdate,
    logDelete,
    logApproval
  };
};