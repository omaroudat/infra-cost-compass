
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BOQItem, BreakdownItem, WIR } from '@/types';
import { useProgressCalculations } from '../../hooks/useProgressCalculations';

interface ProgressExportButtonProps {
  boqItems: BOQItem[];
  breakdownItems: BreakdownItem[];
  wirs: WIR[];
  language: 'en' | 'ar';
}

export const ProgressExportButton: React.FC<ProgressExportButtonProps> = ({
  boqItems,
  breakdownItems,
  wirs,
  language
}) => {
  const { calculateBOQProgress, getWIRsForBOQ, getWIRAmountForBOQ } = useProgressCalculations(
    boqItems,
    breakdownItems,
    wirs
  );

  const englishFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const flattenBOQItems = (items: BOQItem[], level: number = 0): any[] => {
    const result: any[] = [];
    
    items.forEach(item => {
      const relatedWIRs = getWIRsForBOQ(item.id);
      const approvedWIRs = relatedWIRs.filter(wir => wir.result === 'A');
      const boqTotalAmount = item.quantity * item.unitRate;
      
      // Calculate approved amount
      const approvedAmount = approvedWIRs.reduce((sum, wir) => 
        sum + getWIRAmountForBOQ(wir, item.id), 0
      );
      
      const costProgress = boqTotalAmount > 0 ? (approvedAmount / boqTotalAmount) * 100 : 0;
      const remainingAmount = boqTotalAmount - approvedAmount;
      const remainingPercentage = 100 - costProgress;
      
      // Main BOQ item row
      result.push({
        'Level': level,
        'BOQ Code': item.code,
        'Description': language === 'en' ? item.description : (item.descriptionAr || item.description),
        'Quantity': item.quantity,
        'Unit': language === 'en' ? item.unit : (item.unitAr || item.unit),
        'Unit Rate': englishFormatter.format(item.unitRate),
        'Total Amount': englishFormatter.format(boqTotalAmount),
        'Approved Amount': englishFormatter.format(approvedAmount),
        'Approved %': `${costProgress.toFixed(1)}%`,
        'Remaining Amount': englishFormatter.format(remainingAmount),
        'Remaining %': `${remainingPercentage.toFixed(1)}%`,
        'Type': 'BOQ Item',
        'Parent Code': item.parentId ? boqItems.find(p => p.id === item.parentId)?.code : '',
        'Status': costProgress >= 100 ? 'Completed' : costProgress > 0 ? 'In Progress' : 'Not Started'
      });

      // Add children recursively
      if (item.children && item.children.length > 0) {
        result.push(...flattenBOQItems(item.children, level + 1));
      }
    });

    return result;
  };

  const generateBreakdownSubItemsData = (): any[] => {
    const result: any[] = [];
    
    // Get all BOQ items (flattened)
    const flattenedBOQItems = (items: BOQItem[]): BOQItem[] => {
      const result: BOQItem[] = [];
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          result.push(...flattenedBOQItems(item.children));
        }
      });
      return result;
    };

    const allBOQItems = flattenedBOQItems(boqItems);

    allBOQItems.forEach(boqItem => {
      const subItems = breakdownItems.filter(bd => bd.boqItemId === boqItem.id && bd.isLeaf);
      const relatedWIRs = getWIRsForBOQ(boqItem.id);
      
      subItems.forEach(subItem => {
        const subItemWIRs = relatedWIRs.filter(wir => 
          wir.result === 'A' && 
          wir.selectedBreakdownItems?.includes(subItem.id)
        );

        // Calculate amount progress
        const subItemApprovedAmount = subItemWIRs.reduce((sum, wir) => {
          const wirValue = wir.value || 0;
          const unitRate = boqItem.unitRate || 0;
          const percentage = (subItem.percentage || 0) / 100;
          return sum + (wirValue * unitRate * percentage);
        }, 0);

        const boqTotalAmount = boqItem.quantity * boqItem.unitRate;
        const subItemTotalExpected = (boqTotalAmount * (subItem.percentage || 0)) / 100;
        const subItemAmountProgress = subItemTotalExpected > 0 ? (subItemApprovedAmount / subItemTotalExpected) * 100 : 0;

        // Calculate quantity progress
        const subItemApprovedQuantity = subItemWIRs.reduce((sum, wir) => sum + (wir.value || 0), 0);
        const subItemTotalExpectedQuantity = (boqItem.quantity * (subItem.percentage || 0)) / 100;
        const subItemQuantityProgress = subItemTotalExpectedQuantity > 0 ? (subItemApprovedQuantity / subItemTotalExpectedQuantity) * 100 : 0;

        const subItemRemainingAmount = subItemTotalExpected - subItemApprovedAmount;
        const subItemRemainingQuantity = subItemTotalExpectedQuantity - subItemApprovedQuantity;

        // Generate sub-item code: ParentCode-SubItemName
        const subItemCode = `${boqItem.code}-${subItem.description?.replace(/\s+/g, '') || subItem.id.slice(-6)}`;

        result.push({
          'Sub-Item Code': subItemCode,
          'Parent BOQ Code': boqItem.code,
          'Sub-Item Description': language === 'en' ? subItem.description : (subItem.descriptionAr || subItem.description),
          'Sub-Item Percentage': `${subItem.percentage}%`,
          'Expected Quantity': subItemTotalExpectedQuantity.toFixed(2),
          'Approved Quantity': subItemApprovedQuantity.toFixed(2),
          'Remaining Quantity': subItemRemainingQuantity.toFixed(2),
          'Quantity Progress %': `${subItemQuantityProgress.toFixed(1)}%`,
          'Unit': language === 'en' ? boqItem.unit : (boqItem.unitAr || boqItem.unit),
          'Expected Amount': englishFormatter.format(subItemTotalExpected),
          'Approved Amount': englishFormatter.format(subItemApprovedAmount),
          'Remaining Amount': englishFormatter.format(subItemRemainingAmount),
          'Amount Progress %': `${subItemAmountProgress.toFixed(1)}%`,
          'Status': subItemAmountProgress >= 100 ? 'Completed' : subItemAmountProgress > 0 ? 'In Progress' : 'Not Started'
        });
      });
    });

    return result;
  };

  const exportToExcel = () => {
    // Get top-level items
    const topLevelItems = boqItems.filter(item => !item.parentId || item.level === 0);
    
    // Flatten all BOQ data
    const exportData = flattenBOQItems(topLevelItems);

    // Generate breakdown sub-items data
    const breakdownData = generateBreakdownSubItemsData();

    // Create summary data
    const totalBOQAmount = exportData
      .filter(item => item.Type === 'BOQ Item')
      .reduce((sum, item) => sum + parseFloat(item['Total Amount'].replace(/[^0-9.-]/g, '')), 0);
    
    const totalApprovedAmount = exportData
      .filter(item => item.Type === 'BOQ Item')
      .reduce((sum, item) => sum + parseFloat(item['Approved Amount'].replace(/[^0-9.-]/g, '')), 0);

    const overallProgress = totalBOQAmount > 0 ? (totalApprovedAmount / totalBOQAmount) * 100 : 0;

    const summaryData = [
      {
        'Metric': 'Total Project Value',
        'Value': englishFormatter.format(totalBOQAmount),
        'Percentage': '100%'
      },
      {
        'Metric': 'Total Approved Amount',
        'Value': englishFormatter.format(totalApprovedAmount),
        'Percentage': `${overallProgress.toFixed(1)}%`
      },
      {
        'Metric': 'Remaining Amount',
        'Value': englishFormatter.format(totalBOQAmount - totalApprovedAmount),
        'Percentage': `${(100 - overallProgress).toFixed(1)}%`
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Project Summary');
    
    // Add detailed progress sheet
    const detailWs = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, detailWs, 'BOQ Progress');

    // Add breakdown sub-items sheet
    if (breakdownData.length > 0) {
      const breakdownWs = XLSX.utils.json_to_sheet(breakdownData);
      XLSX.utils.book_append_sheet(wb, breakdownWs, 'Breakdown Sub-Items');
    }

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Project_Progress_Report_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button onClick={exportToExcel} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {language === 'en' ? 'Export to Excel' : 'تصدير إلى إكسل'}
    </Button>
  );
};
