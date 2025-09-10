import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { WIR, BreakdownItem } from '../types';

export interface ProgressSegment {
  id: string;
  sequence: number;
  manholeFrom: string;
  manholeTo: string;
  zone: string;
  road: string;
  line: string;
  wirs: WIR[];
  breakdownWIRs: Record<string, string[]>; // breakdown item id -> WIR numbers
}

export interface ProgressSummaryData {
  boqItemId: string;
  breakdownItems: BreakdownItem[];
  segments: ProgressSegment[];
}

export const useProgressSummaryData = (boqItemId: string, approvedOnly: boolean = true): ProgressSummaryData | null => {
  const { wirs, breakdownItems } = useAppContext();

  return useMemo(() => {
    if (!boqItemId) return null;

    // Debug: Log all WIRs and the selected BOQ item ID
    console.log('Progress Summary Debug:');
    console.log('Selected BOQ Item ID:', boqItemId);
    console.log('All WIRs:', wirs.map(wir => ({ 
      id: wir.id, 
      wirNumber: wir.wirNumber, 
      boqItemId: wir.boqItemId, 
      linkedBOQItems: wir.linkedBOQItems,
      result: wir.result,
      description: wir.description
    })));

    // Get WIRs for this BOQ item - filter based on approval setting
    const relatedWIRs = wirs.filter(wir => {
      const isRelatedBOQ = wir.boqItemId === boqItemId || 
        (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItemId));
      
      console.log(`WIR ${wir.wirNumber || wir.id}:`, {
        boqItemId: wir.boqItemId,
        linkedBOQItems: wir.linkedBOQItems,
        isRelatedBOQ,
        result: wir.result,
        passesApprovalFilter: wir.result === 'A' || wir.result === 'B'
      });
      
      if (!isRelatedBOQ) return false;
      
      return approvedOnly ? (wir.result === 'A' || wir.result === 'B') : true;
    });

    console.log('Related WIRs after filtering:', relatedWIRs.map(wir => ({ 
      id: wir.id, 
      wirNumber: wir.wirNumber, 
      result: wir.result 
    })));

    // Get breakdown sub-items for this BOQ item (exclude main item)
    const relatedBreakdownItems = breakdownItems.filter(item => 
      item.boqItemId === boqItemId && item.isLeaf
    );

    console.log('Breakdown items filtering debug:');
    console.log('All breakdown items:', breakdownItems.map(item => ({
      id: item.id,
      boqItemId: item.boqItemId,
      description: item.description,
      isLeaf: item.isLeaf,
      parentBreakdownId: item.parentBreakdownId
    })));
    console.log('Selected BOQ Item ID:', boqItemId);
    console.log('Related breakdown items found:', relatedBreakdownItems.map(item => ({
      id: item.id,
      description: item.description,
      isLeaf: item.isLeaf,
      parentBreakdownId: item.parentBreakdownId
    })));

    // Group WIRs by manhole segments (manholeFrom + manholeTo combination)
    const segmentMap = new Map<string, ProgressSegment>();

    relatedWIRs.forEach(wir => {
      const segmentKey = `${wir.manholeFrom || ''}-${wir.manholeTo || ''}`;
      
      if (!segmentMap.has(segmentKey)) {
        segmentMap.set(segmentKey, {
          id: segmentKey,
          sequence: segmentMap.size + 1,
          manholeFrom: wir.manholeFrom || '',
          manholeTo: wir.manholeTo || '',
          zone: wir.zone || '',
          road: wir.road || '',
          line: wir.line || '',
          wirs: [],
          breakdownWIRs: {}
        });
      }

      const segment = segmentMap.get(segmentKey)!;
      segment.wirs.push(wir);

      // Initialize breakdown WIRs for all breakdown items
      relatedBreakdownItems.forEach(breakdown => {
        if (!segment.breakdownWIRs[breakdown.id]) {
          segment.breakdownWIRs[breakdown.id] = [];
        }
      });

      // Map WIR numbers to breakdown items
      console.log(`Mapping WIR ${wir.wirNumber || wir.id}:`, {
        selectedBreakdownItems: wir.selectedBreakdownItems,
        relatedBreakdownItems: relatedBreakdownItems.map(b => ({ id: b.id, description: b.description }))
      });

      if (wir.selectedBreakdownItems && wir.selectedBreakdownItems.length > 0) {
        wir.selectedBreakdownItems.forEach(breakdownId => {
          if (segment.breakdownWIRs[breakdownId]) {
            segment.breakdownWIRs[breakdownId].push(wir.wirNumber || wir.id);
            console.log(`Added WIR ${wir.wirNumber || wir.id} to breakdown ${breakdownId}`);
          } else {
            console.log(`Breakdown ${breakdownId} not found in segment.breakdownWIRs`);
          }
        });
      } else {
        // If no specific breakdown items selected, add to all breakdown items for this BOQ
        console.log(`No specific breakdown items selected for WIR ${wir.wirNumber || wir.id}, adding to all breakdown items`);
        relatedBreakdownItems.forEach(breakdown => {
          segment.breakdownWIRs[breakdown.id].push(wir.wirNumber || wir.id);
          console.log(`Added WIR ${wir.wirNumber || wir.id} to breakdown ${breakdown.id} (${breakdown.description})`);
        });
      }

      // Update segment info with the latest WIR data (in case of multiple WIRs for same segment)
      if (wir.zone) segment.zone = wir.zone;
      if (wir.road) segment.road = wir.road;
      if (wir.line) segment.line = wir.line;
    });

    const segments = Array.from(segmentMap.values()).sort((a, b) => a.sequence - b.sequence);

    return {
      boqItemId,
      breakdownItems: relatedBreakdownItems,
      segments
    };
  }, [boqItemId, wirs, breakdownItems, approvedOnly]);
};