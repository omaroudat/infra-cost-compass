
import { BOQItem } from '@/types';

export const getFlattenedBOQItems = (boqItems: BOQItem[]): BOQItem[] => {
  const result: BOQItem[] = [];
  
  const flattenItems = (items: BOQItem[]) => {
    items.forEach(item => {
      // Check if this item is a leaf (no children) and has quantity > 0
      const hasChildren = item.children && item.children.length > 0;
      const hasQuantity = item.quantity && item.quantity > 0;
      
      if (!hasChildren && hasQuantity) {
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
