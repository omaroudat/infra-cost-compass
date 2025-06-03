
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';

export const useRealtime = () => {
  const { refetchAll } = useAppContext();

  useEffect(() => {
    // Subscribe to real-time changes for all tables
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'boq_items'
        },
        () => {
          console.log('BOQ items changed, refetching...');
          refetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakdown_items'
        },
        () => {
          console.log('Breakdown items changed, refetching...');
          refetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wirs'
        },
        () => {
          console.log('WIRs changed, refetching...');
          refetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contractors'
        },
        () => {
          console.log('Contractors changed, refetching...');
          refetchAll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'engineers'
        },
        () => {
          console.log('Engineers changed, refetching...');
          refetchAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchAll]);
};
