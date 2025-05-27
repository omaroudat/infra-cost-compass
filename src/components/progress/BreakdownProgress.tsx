
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { BreakdownItem } from '@/types';

interface BreakdownProgressProps {
  breakdownProgress: {
    breakdownId: string;
    percentage: number;
    completedPercentage: number;
  }[];
  breakdownItems: BreakdownItem[];
  language: 'en' | 'ar';
}

export const BreakdownProgress: React.FC<BreakdownProgressProps> = ({
  breakdownProgress,
  breakdownItems,
  language
}) => {
  const getBreakdownItem = (id: string) => breakdownItems?.find(item => item.id === id);

  if (breakdownProgress.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3">
        {language === 'en' ? 'Breakdown Progress' : 'تقدم البنود الفرعية'}
      </h4>
      <div className="grid gap-2">
        {breakdownProgress.map((breakdown) => {
          const breakdownItem = getBreakdownItem(breakdown.breakdownId);
          if (!breakdownItem) return null;
          
          return (
            <div key={breakdown.breakdownId} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>
                    {language === 'en' ? breakdownItem.description : (breakdownItem.descriptionAr || breakdownItem.description)}
                  </span>
                  <span>{breakdown.completedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={breakdown.completedPercentage} className="h-2" />
              </div>
              <span className="text-sm text-gray-500 w-16">
                {breakdown.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
