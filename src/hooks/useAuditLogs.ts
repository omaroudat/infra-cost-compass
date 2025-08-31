import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditLog {
  id: string;
  user_id: string | null;
  username: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  username?: string;
  action?: string;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchLogs = async (filters: AuditLogFilters = {}, page = 0, limit = 50) => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Apply filters
      if (filters.username) {
        query = query.ilike('username', `%${filters.username}%`);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.search) {
        query = query.or(
          `username.ilike.%${filters.search}%,action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to fetch audit logs');
        return;
      }

      setLogs((data || []) as AuditLog[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const exportLogs = async (filters: AuditLogFilters = {}) => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply same filters as fetchLogs
      if (filters.username) {
        query = query.ilike('username', `%${filters.username}%`);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.search) {
        query = query.or(
          `username.ilike.%${filters.search}%,action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error exporting audit logs:', error);
        toast.error('Failed to export audit logs');
        return null;
      }

      return (data || []) as AuditLog[];
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
      return null;
    }
  };

  return {
    logs,
    isLoading,
    total,
    fetchLogs,
    exportLogs
  };
};