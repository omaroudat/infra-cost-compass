
import { BOQItem } from '@/types';

export const getFlattenedBOQItems = (boqItems: BOQItem[]): BOQItem[] => {
  const result: BOQItem[] = [];
  
  const flattenItems = (items: BOQItem[]) => {
    items.forEach(item => {
      // Include level 3 items that have quantities (actual work items)
      if (item.level === 3 && item.quantity > 0) {
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
