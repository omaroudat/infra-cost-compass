
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BreakdownItem } from '@/types';
import { toast } from 'sonner';

export const useSupabaseBreakdown = () => {
  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBreakdownItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('breakdown_items')
        .select(`
          *,
          boq_item:boq_items(*)
        `)
        .order('created_at');

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        id: item.id,
        keyword: item.keyword,
        keywordAr: item.keyword_ar,
        description: item.description,
        descriptionAr: item.description_ar,
        percentage: item.percentage ? parseFloat(item.percentage.toString()) : 0,
        value: item.value ? parseFloat(item.value.toString()) : 0,
        boqItemId: item.boq_item_id,
        parentBreakdownId: item.parent_breakdown_id,
        unitRate: item.unit_rate ? parseFloat(item.unit_rate.toString()) : 0,
        quantity: item.quantity ? parseFloat(item.quantity.toString()) : 0,
        isLeaf: item.is_leaf || false,
        parentInfo: item.boq_item ? {
          code: item.boq_item.code,
          description: item.boq_item.description,
          descriptionAr: item.boq_item.description_ar || ''
        } : undefined
      }));

      setBreakdownItems(transformedData);
    } catch (error) {
      console.error('Error fetching breakdown items:', error);
      toast.error('Failed to fetch breakdown items');
    } finally {
      setLoading(false);
    }
  };

  const addBreakdownItem = async (item: Omit<BreakdownItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('breakdown_items')
        .insert({
          keyword: item.keyword,
          keyword_ar: item.keywordAr,
          description: item.description,
          description_ar: item.descriptionAr,
          percentage: item.percentage,
          value: item.value,
          boq_item_id: item.boqItemId,
          parent_breakdown_id: item.parentBreakdownId,
          unit_rate: item.unitRate,
          quantity: item.quantity,
          is_leaf: item.isLeaf
        })
        .select()
        .single();

      if (error) throw error;

      await fetchBreakdownItems();
      toast.success('Breakdown item added successfully');
      return data;
    } catch (error) {
      console.error('Error adding breakdown item:', error);
      toast.error('Failed to add breakdown item');
      throw error;
    }
  };

  const updateBreakdownItem = async (id: string, updates: Partial<BreakdownItem>) => {
    try {
      const { error } = await supabase
        .from('breakdown_items')
        .update({
          keyword: updates.keyword,
          keyword_ar: updates.keywordAr,
          description: updates.description,
          description_ar: updates.descriptionAr,
          percentage: updates.percentage,
          value: updates.value,
          unit_rate: updates.unitRate,
          quantity: updates.quantity,
          is_leaf: updates.isLeaf
        })
        .eq('id', id);

      if (error) throw error;

      await fetchBreakdownItems();
      toast.success('Breakdown item updated successfully');
    } catch (error) {
      console.error('Error updating breakdown item:', error);
      toast.error('Failed to update breakdown item');
      throw error;
    }
  };

  const deleteBreakdownItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('breakdown_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBreakdownItems();
      toast.success('Breakdown item deleted successfully');
    } catch (error) {
      console.error('Error deleting breakdown item:', error);
      toast.error('Failed to delete breakdown item');
      throw error;
    }
  };

  useEffect(() => {
    fetchBreakdownItems();
  }, []);

  return {
    breakdownItems,
    loading,
    addBreakdownItem,
    updateBreakdownItem,
    deleteBreakdownItem,
    refetch: fetchBreakdownItems
  };
};
