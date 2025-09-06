
import { BOQItem } from '@/types';

export const getFlattenedBOQItems = (boqItems: BOQItem[]): BOQItem[] => {
  const result: BOQItem[] = [];
  
  const flattenItems = (items: BOQItem[]) => {
    items.forEach(item => {
      // Check if this item is a leaf (no children)
      const hasChildren = item.children && item.children.length > 0;
      
      // Include all leaf items regardless of quantity (for WIR referencing)
      if (!hasChildren) {
        result.push(item);
      }
      
      // Continue flattening children
      if (item.children && item.children.length > 0) {
        flattenItems(item.children);
      }
    });
  };
  
  flattenItems(boqItems);
  return result;
};
