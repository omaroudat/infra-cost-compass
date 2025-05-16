
import React from 'react';
import StatCard from '../StatCard';
import { WIR } from '@/types';

interface DashboardStatCardsProps {
  filteredWirs: WIR[];
  formatter: Intl.NumberFormat;
}

const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ filteredWirs, formatter }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Approved WIRs Amount" 
        value={formatter.format(filteredWirs.filter(w => w.status === 'A').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-approved"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
        }
      />
      <StatCard 
        title="Conditional WIRs Amount" 
        value={formatter.format(filteredWirs.filter(w => w.status === 'B').reduce((sum, w) => sum + (w.calculatedAmount || 0), 0))}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-conditional"><path d="M12 22V8"></path><path d="m5 12 7-4 7 4"></path><path d="M5 16l7-4 7 4"></path><path d="M5 20l7-4 7 4"></path></svg>
        }
      />
      <StatCard 
        title="Total WIRs" 
        value={filteredWirs.length.toString()}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M9 14h.01"></path><path d="M13 14h.01"></path><path d="M9 18h.01"></path><path d="M13 18h.01"></path></svg>
        }
      />
    </div>
  );
};

export default DashboardStatCards;
