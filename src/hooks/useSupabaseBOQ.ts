import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BOQItem } from '@/types';
import { toast } from 'sonner';

export const useSupabaseBOQ = () => {
  const [boqItems, setBOQItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBOQItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching BOQ items from Supabase...');
      
      // Test connection first
      const { data: healthCheck, error: healthError } = await supabase
        .from('boq_items')
        .select('count', { count: 'exact', head: true });
      
      if (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error(`Database connection failed: ${healthError.message}`);
      }
      
      console.log('Database connection successful, count:', healthCheck);
      
      const { data, error } = await supabase
        .from('boq_items')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('Supabase error fetching BOQ items:', error);
        throw error;
      }

      console.log('Raw BOQ data from Supabase:', data);

      // Transform database data to match our type structure
      const transformedData = buildHierarchy(data || []);
      console.log('Transformed BOQ data:', transformedData);
      setBOQItems(transformedData);
      
      if (data && data.length > 0) {
        console.log(`Successfully loaded ${data.length} BOQ items`);
      } else {
        console.log('No BOQ items found in database');
      }
    } catch (error) {
      console.error('Error fetching BOQ items:', error);
      
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          toast.error('Connection error while fetching BOQ items. Please check your internet connection and try again.');
        } else if (err.message?.includes('JWT') || err.message?.includes('auth')) {
          toast.error('Authentication error. Please log in again.');
        } else if (err.message?.includes('permission') || err.message?.includes('RLS')) {
          toast.error('Permission denied. Please contact your administrator.');
        } else {
          toast.error(`Failed to fetch BOQ items: ${err.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to fetch BOQ items. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (items: any[]): BOQItem[] => {
    console.log('Building hierarchy from items:', items);
    const itemMap = new Map();
    const rootItems: BOQItem[] = [];

    // First pass: create all items
    items.forEach(item => {
      const boqItem: BOQItem = {
        id: item.id,
        code: item.code || '',
        description: item.description || '',
        descriptionAr: item.description_ar || '',
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || '',
        unitAr: item.unit_ar || '',
        unitRate: parseFloat(item.unit_rate) || 0,
        totalAmount: parseFloat(item.total_amount) || 0,
        parentId: item.parent_id,
        level: item.level || 0,
        children: []
      };
      itemMap.set(item.id, boqItem);
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const boqItem = itemMap.get(item.id);
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(boqItem);
        }
      } else {
        rootItems.push(boqItem);
      }
    });

    console.log('Built hierarchy:', rootItems);
    return rootItems;
  };

  const addBOQItem = async (item: Omit<BOQItem, 'id'>, parentId?: string) => {
    try {
      console.log('Adding BOQ item:', item, 'with parentId:', parentId);
      
      const insertData = {
        code: item.code,
        description: item.description,
        description_ar: item.descriptionAr || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_ar: item.unitAr || null,
        unit_rate: item.unitRate,
        parent_id: parentId || null,
        level: item.level || 0
      };
      
      console.log('Inserting BOQ item with data:', insertData);

      const { data, error } = await supabase
        .from('boq_items')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error during insert:', error);
        throw error;
      }

      console.log('Successfully added BOQ item:', data);
      await fetchBOQItems();
      toast.success('BOQ item added successfully');
      return data;
    } catch (error) {
      console.error('Error adding BOQ item:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Connection error: Cannot connect to database. Please check your internet connection.');
      } else if (error && typeof error === 'object' && 'message' in error) {
        toast.error('Database error: ' + (error as any).message);
      } else {
        toast.error('Failed to add BOQ item: Unknown error occurred');
      }
      throw error;
    }
  };

  const updateBOQItem = async (id: string, updates: Partial<BOQItem>) => {
    try {
      console.log('Updating BOQ item:', id, updates);
      
      const updateData: any = {
        code: updates.code,
        description: updates.description,
        description_ar: updates.descriptionAr || null,
        quantity: updates.quantity,
        unit: updates.unit,
        unit_ar: updates.unitAr || null,
        unit_rate: updates.unitRate,
        level: updates.level
      };

      const { error } = await supabase
        .from('boq_items')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating BOQ item:', error);
        throw error;
      }

      console.log('Successfully updated BOQ item');
      await fetchBOQItems();
      toast.success('BOQ item updated successfully');
    } catch (error) {
      console.error('Error updating BOQ item:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Connection error: Cannot connect to database. Please check your internet connection.');
      } else {
        toast.error('Failed to update BOQ item: ' + (error as Error).message);
      }
      throw error;
    }
  };

  const deleteBOQItem = async (id: string) => {
    try {
      console.log('Deleting BOQ item:', id);
      
      const { error } = await supabase
        .from('boq_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting BOQ item:', error);
        throw error;
      }

      console.log('Successfully deleted BOQ item');
      await fetchBOQItems();
      toast.success('BOQ item deleted successfully');
    } catch (error) {
      console.error('Error deleting BOQ item:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Connection error: Cannot connect to database. Please check your internet connection.');
      } else {
        toast.error('Failed to delete BOQ item: ' + (error as Error).message);
      }
      throw error;
    }
  };

  useEffect(() => {
    console.log('useSupabaseBOQ: Initial fetch on mount');
    fetchBOQItems();
  }, []);

  return {
    boqItems,
    loading,
    addBOQItem,
    updateBOQItem,
    deleteBOQItem,
    refetch: fetchBOQItems
  };
};
