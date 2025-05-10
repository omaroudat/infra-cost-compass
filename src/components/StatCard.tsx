
import React from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  className?: string;
};

const StatCard = ({ title, value, icon, description, trend, className = '' }: StatCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-100 rounded-md">{icon}</div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        
        {trend && (
          <div className="flex items-center mt-2">
            {trend.direction === 'up' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-approved"><path d="m18 15-6-6-6 6"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-rejected"><path d="m6 9 6 6 6-6"></path></svg>
            )}
            <span className={`text-sm ml-1 ${
              trend.direction === 'up' ? 'text-status-approved' : 'text-status-rejected'
            }`}>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
