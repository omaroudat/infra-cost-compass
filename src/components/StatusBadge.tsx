
import { WIRStatus } from '../types';

type StatusInfo = {
  color: string;
  label: string;
};

const statusMap: Record<WIRStatus, StatusInfo> = {
  'A': { color: 'bg-status-approved', label: 'Approved' },
  'B': { color: 'bg-status-conditional', label: 'Conditional' },
  'C': { color: 'bg-status-rejected', label: 'Rejected' }
};

type StatusBadgeProps = {
  status: WIRStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { color, label } = statusMap[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white`}>
      {label}
    </span>
  );
};

export default StatusBadge;
