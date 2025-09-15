
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WIR } from '@/types';
import { toast } from 'sonner';
import { logAuditActivity } from '@/hooks/useAuditLogger';
import { useAuth } from '@/context/ManualAuthContext';

export const useSupabaseWIRs = () => {
  const [wirs, setWIRs] = useState<WIR[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const generateWIRNumber = async (): Promise<string> => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const datePrefix = `WIR-${day}-${month}-${year}`;
    
    // Get all WIRs to find the highest sequence number globally (never resets)
    const { data, error } = await supabase
      .from('wirs')
      .select('wir_number')
      .like('wir_number', 'WIR-%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching existing WIRs:', error);
      // Fallback to 000001 if there's an error
      return `${datePrefix}-000001`;
    }

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      // Find the highest sequence number across all WIRs
      let maxSequence = 0;
      for (const wir of data) {
        const wirNumber = wir.wir_number;
        const lastSequence = wirNumber.split('-').pop();
        if (lastSequence) {
          const sequence = parseInt(lastSequence);
          if (!isNaN(sequence) && sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      }
      sequenceNumber = maxSequence + 1;
    }

    const formattedSequence = sequenceNumber.toString().padStart(6, '0');
    return `${datePrefix}-${formattedSequence}`;
  };

  const fetchWIRs = async () => {
    try {
      setLoading(true);
      console.log('Fetching WIRs from Supabase...');
      
      // Check if we can connect to Supabase
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth session:', authData, 'Auth error:', authError);
      
      const { data, error } = await supabase
        .from('wirs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching WIRs:', error);
        throw error;
      }

      console.log('Raw WIR data from Supabase:', data);

      const transformedData = (data || []).map((item: any) => ({
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
        manholeFrom: (item as any).manhole_from || '',
        manholeTo: (item as any).manhole_to || '',
        zone: (item as any).zone || '',
        road: (item as any).road || '',
        line: (item as any).line || '',
        value: item.value ? parseFloat(item.value.toString()) : 0,
        parentWIRId: item.parent_wir_id,
        revisionNumber: item.revision_number || 0,
        linkedBOQItems: item.linked_boq_items || [item.boq_item_id],
        originalWIRId: item.original_wir_id,
        selectedBreakdownItems: item.selected_breakdown_items || [],
        startTaskOnSite: item.start_task_on_site,
        attachments: item.attachments || []
      }));

      console.log('Transformed WIR data:', transformedData);
      setWIRs(transformedData);
      
      if (data && data.length > 0) {
        console.log(`Successfully loaded ${data.length} WIRs`);
      } else {
        console.log('No WIRs found in database');
      }
    } catch (error) {
      console.error('Error fetching WIRs:', error);
      
      // More specific error handling
      if (error && typeof error === 'object') {
        const err = error as any;
        if (err.message?.includes('JWT')) {
          toast.error('Authentication error. Please check your login status.');
        } else if (err.message?.includes('Failed to fetch')) {
          toast.error('Connection error. Please check your internet connection and try again.');
        } else if (err.message?.includes('permission')) {
          toast.error('Permission denied. Please check your access rights.');
        } else {
          toast.error(`Failed to fetch WIRs: ${err.message || 'Unknown error'}`);
        }
      } else {
        toast.error('Failed to fetch WIRs: Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const addWIR = async (wir: Omit<WIR, 'calculatedAmount' | 'breakdownApplied'>) => {
    try {
      // Generate WIR number if not provided or use provided one
      let wirNumber;
      if (wir.wirNumber && wir.wirNumber.trim() !== '') {
        wirNumber = wir.wirNumber;
      } else {
        wirNumber = await generateWIRNumber();
      }
      
      const insertData = {
        wir_number: wirNumber,
        boq_item_id: wir.boqItemId,
        description: wir.description,
        description_ar: wir.descriptionAr,
        submittal_date: wir.submittalDate || null,
        start_task_on_site: wir.startTaskOnSite || null,
        received_date: wir.receivedDate || null,
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
        selected_breakdown_items: wir.selectedBreakdownItems,
        attachments: wir.attachments || [],
        ...(wir.manholeFrom && { manhole_from: wir.manholeFrom }),
        ...(wir.manholeTo && { manhole_to: wir.manholeTo }),
        ...(wir.zone && { zone: wir.zone }),
        ...(wir.road && { road: wir.road }),
        ...(wir.line && { line: wir.line })
      };

      let { data, error } = await supabase
        .from('wirs')
        .insert(insertData)
        .select()
        .single();

      // Handle unique conflict on wir_number by regenerating and retrying once (only for auto-generated numbers)
      const isDuplicate = (err: any) => {
        const msg = String(err?.message || '').toLowerCase();
        const details = String(err?.details || '').toLowerCase();
        return err?.code === '23505' || msg.includes('duplicate') || details.includes('duplicate') || msg.includes('conflict');
      };
      if (error && isDuplicate(error) && (!wir.wirNumber || wir.wirNumber.trim() === '')) {
        const newWirNumber = await generateWIRNumber();
        insertData.wir_number = newWirNumber;
        wirNumber = newWirNumber;
        const retry = await supabase
          .from('wirs')
          .insert(insertData)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;

      // Log WIR creation
      await logAuditActivity({
        action: 'CREATE',
        resourceType: 'WIR',
        resourceId: data.id,
        details: {
          wir_number: wirNumber,
          description: wir.description,
          contractor: wir.contractor,
          engineer: wir.engineer,
          status: wir.status,
          submittal_date: wir.submittalDate
        }
      }, profile);

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
        // Get the original WIR data for comparison
        const { data: originalWIR, error: fetchError } = await supabase
          .from('wirs')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const updateData: any = {};
        
        if (updates.wirNumber !== undefined) updateData.wir_number = updates.wirNumber;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.descriptionAr !== undefined) updateData.description_ar = updates.descriptionAr;
        if (updates.submittalDate !== undefined && updates.submittalDate !== '') updateData.submittal_date = updates.submittalDate;
        if (updates.startTaskOnSite !== undefined) updateData.start_task_on_site = updates.startTaskOnSite || null;
        if (updates.receivedDate !== undefined) updateData.received_date = updates.receivedDate || null;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.result !== undefined) updateData.result = updates.result;
        if (updates.statusConditions !== undefined) updateData.status_conditions = updates.statusConditions;
        if (updates.calculatedAmount !== undefined) updateData.calculated_amount = updates.calculatedAmount;
        if (updates.calculationEquation !== undefined) updateData.calculation_equation = updates.calculationEquation;
        if (updates.contractor !== undefined) updateData.contractor = updates.contractor;
        if (updates.engineer !== undefined) updateData.engineer = updates.engineer;
        if (updates.lengthOfLine !== undefined) updateData.length_of_line = updates.lengthOfLine;
        if (updates.diameterOfLine !== undefined) updateData.diameter_of_line = updates.diameterOfLine;
        if (updates.lineNo !== undefined) updateData.line_no = updates.lineNo;
        if (updates.region !== undefined) updateData.region = updates.region;
        if (updates.value !== undefined) updateData.value = updates.value;
        if (updates.linkedBOQItems !== undefined) updateData.linked_boq_items = updates.linkedBOQItems;
        if (updates.selectedBreakdownItems !== undefined) updateData.selected_breakdown_items = updates.selectedBreakdownItems;
        if (updates.attachments !== undefined) updateData.attachments = updates.attachments;
        
        // Add new fields only if they exist in the updates
        if (updates.manholeFrom !== undefined) updateData.manhole_from = updates.manholeFrom;
        if (updates.manholeTo !== undefined) updateData.manhole_to = updates.manholeTo;
        if (updates.zone !== undefined) updateData.zone = updates.zone;
        if (updates.road !== undefined) updateData.road = updates.road;
        if (updates.line !== undefined) updateData.line = updates.line;

        const { error } = await supabase
          .from('wirs')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;

        // Detect result submission (status change to completed with result)
        const isResultSubmission = 
          originalWIR.status === 'submitted' && 
          updates.status === 'completed' && 
          updates.result;

        // Log the appropriate audit activity
        if (isResultSubmission) {
          await logAuditActivity({
            action: 'APPROVAL',
            resourceType: 'WIR',
            resourceId: id,
            details: {
              wir_number: originalWIR.wir_number,
              result: updates.result,
              received_date: updates.receivedDate,
              status_change: `${originalWIR.status} → ${updates.status}`,
              completion_date: new Date().toISOString()
            }
          }, profile);
        } else {
          // Log regular update with changed fields
          const changedFields: Record<string, any> = {};
          Object.keys(updates).forEach(key => {
            const originalKey = key === 'wirNumber' ? 'wir_number' :
                             key === 'descriptionAr' ? 'description_ar' :
                             key === 'submittalDate' ? 'submittal_date' :
                             key === 'receivedDate' ? 'received_date' :
                             key === 'startTaskOnSite' ? 'start_task_on_site' :
                             key === 'statusConditions' ? 'status_conditions' :
                             key === 'calculatedAmount' ? 'calculated_amount' :
                             key === 'calculationEquation' ? 'calculation_equation' :
                             key === 'lengthOfLine' ? 'length_of_line' :
                             key === 'diameterOfLine' ? 'diameter_of_line' :
                             key === 'lineNo' ? 'line_no' :
                             key === 'manholeFrom' ? 'manhole_from' :
                             key === 'manholeTo' ? 'manhole_to' :
                             key === 'linkedBOQItems' ? 'linked_boq_items' :
                             key === 'selectedBreakdownItems' ? 'selected_breakdown_items' :
                             key;
            
            const oldValue = originalWIR[originalKey];
            const newValue = (updates as any)[key];
            if (oldValue !== newValue) {
              changedFields[key] = { from: oldValue, to: newValue };
            }
          });

          await logAuditActivity({
            action: 'UPDATE',
            resourceType: 'WIR',
            resourceId: id,
            details: {
              wir_number: originalWIR.wir_number,
              changed_fields: changedFields
            }
          }, profile);
        }

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
      // Get the WIR data before deletion for audit logging
      const { data: wirData, error: fetchError } = await supabase
        .from('wirs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('wirs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log WIR deletion
      await logAuditActivity({
        action: 'DELETE',
        resourceType: 'WIR',
        resourceId: id,
        details: {
          wir_number: wirData.wir_number,
          description: wirData.description,
          contractor: wirData.contractor,
          engineer: wirData.engineer,
          status: wirData.status,
          deleted_date: new Date().toISOString()
        }
      }, profile);

      await fetchWIRs();
      toast.success('WIR deleted successfully');
    } catch (error) {
      console.error('Error deleting WIR:', error);
      toast.error('Failed to delete WIR');
      throw error;
    }
  };

  useEffect(() => {
    console.log('useSupabaseWIRs: Initial fetch on mount');
    fetchWIRs();
  }, []);

  return {
    wirs,
    loading,
    addWIR,
    updateWIR,
    deleteWIR,
    refetch: fetchWIRs,
    generateWIRNumber
  };
};
