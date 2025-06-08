
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WIR } from '@/types';
import { toast } from 'sonner';

export const useSupabaseWIRs = () => {
  const [wirs, setWIRs] = useState<WIR[]>([]);
  const [loading, setLoading] = useState(true);

  const generateWIRNumber = (): string => {
    const timestamp = Date.now();
    return `WIR-${timestamp}`;
  };

  const fetchWIRs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wirs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        id: item.id,
        wirNumber: item.wir_number,
        boqItemId: item.boq_item_id,
        description: item.description,
        descriptionAr: item.description_ar,
        submittalDate: item.submittal_date,
        receivedDate: item.received_date,
        status: item.status as 'submitted' | 'completed',
        result: item.result as 'A' | 'B' | 'C' | undefined,
        statusConditions: item.status_conditions,
        calculatedAmount: item.calculated_amount,
        calculationEquation: item.calculation_equation,
        breakdownApplied: null,
        contractor: item.contractor,
        engineer: item.engineer,
        lengthOfLine: item.length_of_line ? parseFloat(item.length_of_line.toString()) : 0,
        diameterOfLine: item.diameter_of_line ? parseFloat(item.diameter_of_line.toString()) : 0,
        lineNo: item.line_no,
        region: item.region,
        value: item.value ? parseFloat(item.value.toString()) : 0,
        parentWIRId: item.parent_wir_id,
        revisionNumber: item.revision_number || 0,
        linkedBOQItems: item.linked_boq_items || [item.boq_item_id],
        originalWIRId: item.original_wir_id,
        selectedBreakdownItems: item.selected_breakdown_items || []
      }));

      setWIRs(transformedData);
    } catch (error) {
      console.error('Error fetching WIRs:', error);
      toast.error('Failed to fetch WIRs');
    } finally {
      setLoading(false);
    }
  };

  const addWIR = async (wir: Omit<WIR, 'calculatedAmount' | 'breakdownApplied'>) => {
    try {
      // Use provided WIR number if it exists, otherwise generate a new one
      const wirNumber = wir.wirNumber || generateWIRNumber();
      
      const insertData = {
        wir_number: wirNumber,
        boq_item_id: wir.boqItemId,
        description: wir.description,
        description_ar: wir.descriptionAr,
        submittal_date: wir.submittalDate,
        received_date: wir.receivedDate,
        status: wir.status,
        result: wir.result,
        status_conditions: wir.statusConditions,
        contractor: wir.contractor,
        engineer: wir.engineer,
        length_of_line: wir.lengthOfLine,
        diameter_of_line: wir.diameterOfLine,
        line_no: wir.lineNo,
        region: wir.region,
        value: wir.value,
        parent_wir_id: wir.parentWIRId,
        revision_number: wir.revisionNumber,
        original_wir_id: wir.originalWIRId,
        linked_boq_items: wir.linkedBOQItems,
        selected_breakdown_items: wir.selectedBreakdownItems
      };

      const { data, error } = await supabase
        .from('wirs')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await fetchWIRs();
      toast.success('WIR added successfully');
      return data;
    } catch (error) {
      console.error('Error adding WIR:', error);
      toast.error('Failed to add WIR');
      throw error;
    }
  };

  const updateWIR = async (id: string, updates: Partial<WIR>) => {
    try {
      const { error } = await supabase
        .from('wirs')
        .update({
          wir_number: updates.wirNumber,
          description: updates.description,
          description_ar: updates.descriptionAr,
          submittal_date: updates.submittalDate,
          received_date: updates.receivedDate,
          status: updates.status,
          result: updates.result,
          status_conditions: updates.statusConditions,
          calculated_amount: updates.calculatedAmount,
          calculation_equation: updates.calculationEquation,
          contractor: updates.contractor,
          engineer: updates.engineer,
          length_of_line: updates.lengthOfLine,
          diameter_of_line: updates.diameterOfLine,
          line_no: updates.lineNo,
          region: updates.region,
          value: updates.value,
          linked_boq_items: updates.linkedBOQItems,
          selected_breakdown_items: updates.selectedBreakdownItems
        })
        .eq('id', id);

      if (error) throw error;

      await fetchWIRs();
      toast.success('WIR updated successfully');
    } catch (error) {
      console.error('Error updating WIR:', error);
      toast.error('Failed to update WIR');
      throw error;
    }
  };

  const deleteWIR = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wirs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchWIRs();
      toast.success('WIR deleted successfully');
    } catch (error) {
      console.error('Error deleting WIR:', error);
      toast.error('Failed to delete WIR');
      throw error;
    }
  };

  useEffect(() => {
    fetchWIRs();
  }, []);

  return {
    wirs,
    loading,
    addWIR,
    updateWIR,
    deleteWIR,
    refetch: fetchWIRs
  };
};
