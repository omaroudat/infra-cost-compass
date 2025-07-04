
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contractor, Engineer } from '@/types';
import { toast } from 'sonner';

export const useSupabaseStaff = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContractors = async () => {
    try {
      console.log('Fetching contractors from Supabase...');
      
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error fetching contractors:', error);
        throw error;
      }

      console.log('Raw contractor data from Supabase:', data);

      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        company: item.company,
        email: item.email,
        phone: item.phone,
        createdAt: item.created_at
      }));

      setContractors(transformedData);
      console.log(`Successfully loaded ${transformedData.length} contractors`);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.message?.includes('JWT')) {
          toast.error('Authentication error while fetching contractors');
        } else if (err.message?.includes('Failed to fetch')) {
          toast.error('Connection error while fetching contractors');
        } else {
          toast.error(`Failed to fetch contractors: ${err.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to fetch contractors');
      }
    }
  };

  const fetchEngineers = async () => {
    try {
      console.log('Fetching engineers from Supabase...');
      
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error fetching engineers:', error);
        throw error;
      }

      console.log('Raw engineer data from Supabase:', data);

      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        department: item.department,
        email: item.email,
        phone: item.phone,
        specialization: item.specialization,
        createdAt: item.created_at
      }));

      setEngineers(transformedData);
      console.log(`Successfully loaded ${transformedData.length} engineers`);
    } catch (error) {
      console.error('Error fetching engineers:', error);
      
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.message?.includes('JWT')) {
          toast.error('Authentication error while fetching engineers');
        } else if (err.message?.includes('Failed to fetch')) {
          toast.error('Connection error while fetching engineers');
        } else {
          toast.error(`Failed to fetch engineers: ${err.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to fetch engineers');
      }
    } finally {
      setLoading(false);
    }
  };

  const addContractor = async (contractor: Omit<Contractor, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .insert({
          name: contractor.name,
          company: contractor.company,
          email: contractor.email,
          phone: contractor.phone
        })
        .select()
        .single();

      if (error) throw error;

      await fetchContractors();
      toast.success('Contractor added successfully');
      return data;
    } catch (error) {
      console.error('Error adding contractor:', error);
      toast.error('Failed to add contractor');
      throw error;
    }
  };

  const updateContractor = async (id: string, updates: Partial<Contractor>) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .update({
          name: updates.name,
          company: updates.company,
          email: updates.email,
          phone: updates.phone
        })
        .eq('id', id);

      if (error) throw error;

      await fetchContractors();
      toast.success('Contractor updated successfully');
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast.error('Failed to update contractor');
      throw error;
    }
  };

  const deleteContractor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contractors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchContractors();
      toast.success('Contractor deleted successfully');
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast.error('Failed to delete contractor');
      throw error;
    }
  };

  const addEngineer = async (engineer: Omit<Engineer, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .insert({
          name: engineer.name,
          department: engineer.department,
          email: engineer.email,
          phone: engineer.phone,
          specialization: engineer.specialization
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEngineers();
      toast.success('Engineer added successfully');
      return data;
    } catch (error) {
      console.error('Error adding engineer:', error);
      toast.error('Failed to add engineer');
      throw error;
    }
  };

  const updateEngineer = async (id: string, updates: Partial<Engineer>) => {
    try {
      const { error } = await supabase
        .from('engineers')
        .update({
          name: updates.name,
          department: updates.department,
          email: updates.email,
          phone: updates.phone,
          specialization: updates.specialization
        })
        .eq('id', id);

      if (error) throw error;

      await fetchEngineers();
      toast.success('Engineer updated successfully');
    } catch (error) {
      console.error('Error updating engineer:', error);
      toast.error('Failed to update engineer');
      throw error;
    }
  };

  const deleteEngineer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('engineers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEngineers();
      toast.success('Engineer deleted successfully');
    } catch (error) {
      console.error('Error deleting engineer:', error);
      toast.error('Failed to delete engineer');
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('useSupabaseStaff: Initial fetch on mount');
      setLoading(true);
      await Promise.all([fetchContractors(), fetchEngineers()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return {
    contractors,
    engineers,
    loading,
    addContractor,
    updateContractor,
    deleteContractor,
    addEngineer,
    updateEngineer,
    deleteEngineer,
    refetch: () => Promise.all([fetchContractors(), fetchEngineers()])
  };
};
