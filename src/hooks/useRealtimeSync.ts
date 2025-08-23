import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BOQItem, BreakdownItem } from '@/types';
import { toast } from 'sonner';

interface UseRealtimeSyncProps {
  boqItems: BOQItem[];
  breakdownItems: BreakdownItem[];
  onBOQUpdate?: () => void;
  onBreakdownUpdate?: () => void;
}

export const useRealtimeSync = ({ 
  boqItems, 
  breakdownItems, 
  onBOQUpdate, 
  onBreakdownUpdate 
}: UseRealtimeSyncProps) => {

  // Sync breakdown items when BOQ items are updated
  const syncBreakdownWithBOQ = async (updatedBOQItem: BOQItem) => {
    console.log('Syncing breakdown items with updated BOQ item:', updatedBOQItem);
    
    // Find breakdown items that reference this BOQ item
    const relatedBreakdownItems = breakdownItems.filter(
      breakdown => breakdown.boqItemId === updatedBOQItem.id
    );

    if (relatedBreakdownItems.length === 0) {
      console.log('No breakdown items found for BOQ item:', updatedBOQItem.id);
      return;
    }

    console.log(`Found ${relatedBreakdownItems.length} breakdown items to sync`);

    try {
      // Update each related breakdown item with the new BOQ unit rate
      for (const breakdownItem of relatedBreakdownItems) {
        const { error } = await supabase
          .from('breakdown_items')
          .update({ 
            unit_rate: updatedBOQItem.unitRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', breakdownItem.id);

        if (error) {
          console.error(`Error updating breakdown item ${breakdownItem.id}:`, error);
          throw error;
        }
      }

      console.log('Successfully synced breakdown items with BOQ changes');
      
      // Refresh breakdown items to reflect changes
      if (onBreakdownUpdate) {
        onBreakdownUpdate();
      }
      
      toast.success(`Updated ${relatedBreakdownItems.length} breakdown items with new BOQ values`);
    } catch (error) {
      console.error('Error syncing breakdown items:', error);
      toast.error('Failed to sync breakdown items with BOQ changes');
    }
  };

  useEffect(() => {
    console.log('Setting up real-time sync for BOQ items...');
    
    // Set up real-time listener for BOQ items
    const channel = supabase
      .channel('boq-breakdown-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'boq_items'
        },
        (payload) => {
          console.log('BOQ item updated via real-time:', payload);
          
          const updatedBOQItem = payload.new as any;
          
          // Transform to BOQItem type
          const boqItem: BOQItem = {
            id: updatedBOQItem.id,
            code: updatedBOQItem.code || '',
            description: updatedBOQItem.description || '',
            descriptionAr: updatedBOQItem.description_ar || '',
            quantity: parseFloat(updatedBOQItem.quantity) || 0,
            unit: updatedBOQItem.unit || '',
            unitAr: updatedBOQItem.unit_ar || '',
            unitRate: parseFloat(updatedBOQItem.unit_rate) || 0,
            totalAmount: parseFloat(updatedBOQItem.total_amount) || 0,
            parentId: updatedBOQItem.parent_id,
            level: updatedBOQItem.level || 0
          };

          // Sync breakdown items with the updated BOQ item
          syncBreakdownWithBOQ(boqItem);
          
          // Refresh BOQ items if callback provided
          if (onBOQUpdate) {
            onBOQUpdate();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'boq_items'
        },
        (payload) => {
          console.log('BOQ item inserted via real-time:', payload);
          
          // Refresh BOQ items if callback provided
          if (onBOQUpdate) {
            onBOQUpdate();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'boq_items'
        },
        (payload) => {
          console.log('BOQ item deleted via real-time:', payload);
          
          // Refresh BOQ items if callback provided
          if (onBOQUpdate) {
            onBOQUpdate();
          }
        }
      )
      .subscribe();

    console.log('Real-time sync channel subscribed');

    return () => {
      console.log('Cleaning up real-time sync...');
      supabase.removeChannel(channel);
    };
  }, [boqItems, breakdownItems, onBOQUpdate, onBreakdownUpdate]);

  return {
    syncBreakdownWithBOQ
  };
};