
import { WIRStatus } from '../types';
import { Check, CheckCheck, X } from 'lucide-react';

type StatusInfo = {
  color: string;
  icon: React.ReactNode;
};

const statusMap: Record<WIRStatus, StatusInfo> = {
  'A': { color: 'bg-status-approved', icon: <Check className="h-3.5 w-3.5" /> },
  'B': { color: 'bg-status-conditional', icon: <CheckCheck className="h-3.5 w-3.5" /> },
  'C': { color: 'bg-status-rejected', icon: <X className="h-3.5 w-3.5" /> }
};

type StatusBadgeProps = {
  status: WIRStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { color, icon } = statusMap[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white`}>
      {status} {icon}
    </span>
  );
};

export default StatusBadge;
