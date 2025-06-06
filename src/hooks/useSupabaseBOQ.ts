
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
      
      const { data, error } = await supabase
        .from('boq_items')
        .select('*')
        .order('created_at');

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to fetch BOQ items: ' + error.message);
        return;
      }

      console.log('Raw BOQ data from Supabase:', data);

      // Transform database data to match our type structure
      const transformedData = buildHierarchy(data || []);
      console.log('Transformed BOQ data:', transformedData);
      setBOQItems(transformedData);
      
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} BOQ items successfully`);
      }
    } catch (error) {
      console.error('Error fetching BOQ items:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Cannot connect to database. Please check your internet connection and Supabase configuration.');
      } else {
        toast.error('Failed to fetch BOQ items: ' + (error as Error).message);
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
      
      // First, let's check if we can make a simple query to test connectivity
      console.log('Testing basic Supabase connectivity...');
      const { data: testData, error: testError } = await supabase
        .from('boq_items')
        .select('count')
        .limit(1)
        .single();
      
      if (testError && testError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
        console.error('Connection test failed:', testError);
        console.error('Test error details:', {
          code: testError.code,
          details: testError.details,
          hint: testError.hint,
          message: testError.message
        });
        throw new Error(`Database connection test failed: ${testError.message}`);
      }
      
      console.log('Connection test passed, proceeding with insert...');
      
      const insertData = {
        code: item.code,
        description: item.description,
        description_ar: item.descriptionAr || null,
        quantity: item.quantity,
        unit: item.unit,
        unit_ar: item.unitAr || null,
        unit_rate: item.unitRate,
        total_amount: item.totalAmount || (item.quantity * item.unitRate),
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
        console.error('Error adding BOQ item:', error);
        console.error('Insert error details:', {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message
        });
        throw error;
      }

      console.log('Successfully added BOQ item:', data);
      await fetchBOQItems(); // Refresh data
      toast.success('BOQ item added successfully');
      return data;
    } catch (error) {
      console.error('Error adding BOQ item:', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          const errorMsg = 'Network error: Cannot connect to Supabase. Please check:\n1. Your internet connection\n2. Supabase project is running\n3. CORS settings are correct';
          toast.error(errorMsg);
          console.error('Network connectivity issue detected');
        } else {
          toast.error('Network error: ' + error.message);
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        toast.error('Database error: ' + (error as any).message);
      } else {
        toast.error('Failed to add BOQ item: Unknown error');
      }
      throw error;
    }
  };

  const updateBOQItem = async (id: string, updates: Partial<BOQItem>) => {
    try {
      console.log('Updating BOQ item:', id, updates);
      
      const { error } = await supabase
        .from('boq_items')
        .update({
          code: updates.code,
          description: updates.description,
          description_ar: updates.descriptionAr || null,
          quantity: updates.quantity,
          unit: updates.unit,
          unit_ar: updates.unitAr || null,
          unit_rate: updates.unitRate,
          total_amount: updates.totalAmount,
          level: updates.level
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating BOQ item:', error);
        throw error;
      }

      console.log('Successfully updated BOQ item');
      await fetchBOQItems(); // Refresh data
      toast.success('BOQ item updated successfully');
    } catch (error) {
      console.error('Error updating BOQ item:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Cannot connect to database. Please check your internet connection and Supabase configuration.');
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
      await fetchBOQItems(); // Refresh data
      toast.success('BOQ item deleted successfully');
    } catch (error) {
      console.error('Error deleting BOQ item:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Network error: Cannot connect to database. Please check your internet connection and Supabase configuration.');
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
