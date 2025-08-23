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

export const useProgressSummaryData = (boqItemId: string): ProgressSummaryData | null => {
  const { wirs, breakdownItems } = useAppContext();

  return useMemo(() => {
    if (!boqItemId) return null;

    // Get all WIRs for this BOQ item
    const relatedWIRs = wirs.filter(wir => 
      wir.boqItemId === boqItemId || 
      (wir.linkedBOQItems && wir.linkedBOQItems.includes(boqItemId))
    );

    // Get all breakdown items for this BOQ item
    const relatedBreakdownItems = breakdownItems.filter(item => 
      item.boqItemId === boqItemId && item.isLeaf
    );

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
      if (wir.selectedBreakdownItems && wir.selectedBreakdownItems.length > 0) {
        wir.selectedBreakdownItems.forEach(breakdownId => {
          if (segment.breakdownWIRs[breakdownId]) {
            segment.breakdownWIRs[breakdownId].push(wir.wirNumber || wir.id);
          }
        });
      } else if (wir.result === 'A' || wir.status === 'completed') {
        // If no specific breakdown items selected but WIR is approved/completed,
        // add to all breakdown items for this BOQ
        relatedBreakdownItems.forEach(breakdown => {
          segment.breakdownWIRs[breakdown.id].push(wir.wirNumber || wir.id);
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
  }, [boqItemId, wirs, breakdownItems]);
};