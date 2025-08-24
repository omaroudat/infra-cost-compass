import React from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Toast } from '@/components/ui/toast';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

interface AnnouncementProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
}

export const AccessibilityAnnouncement: React.FC<AnnouncementProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onDismiss
}) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    announceMessage(message);
  }, [message, announceMessage]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAriaRole = () => {
    return type === 'error' ? 'alert' : 'status';
  };

  return (
    <div
      role={getAriaRole()}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        fixed top-4 right-4 z-50 max-w-sm
        bg-card border rounded-lg shadow-lg p-4
        flex items-start gap-3
        ${type === 'success' ? 'border-success bg-success/10' : ''}
        ${type === 'warning' ? 'border-warning bg-warning/10' : ''}
        ${type === 'error' ? 'border-destructive bg-destructive/10' : ''}
        ${type === 'info' ? 'border-primary bg-primary/10' : ''}
      `}
    >
      <div className={`
        ${type === 'success' ? 'text-success' : ''}
        ${type === 'warning' ? 'text-warning' : ''}
        ${type === 'error' ? 'text-destructive' : ''}
        ${type === 'info' ? 'text-primary' : ''}
      `}>
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Live Region Component for dynamic content updates
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'all',
  className
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className={className}
  >
    {children}
  </div>
);

// Status announcer hook
export const useStatusAnnouncement = () => {
  const { announceMessage } = useAccessibility();

  const announceSuccess = (message: string) => {
    announceMessage(`Success: ${message}`);
  };

  const announceError = (message: string) => {
    announceMessage(`Error: ${message}`);
  };

  const announceWarning = (message: string) => {
    announceMessage(`Warning: ${message}`);
  };

  const announceInfo = (message: string) => {
    announceMessage(`Information: ${message}`);
  };

  const announceProgress = (current: number, total: number, task?: string) => {
    const percentage = Math.round((current / total) * 100);
    const taskText = task ? ` ${task}` : '';
    announceMessage(`Progress${taskText}: ${percentage}% complete, ${current} of ${total}`);
  };

  const announcePageChange = (pageName: string) => {
    announceMessage(`Navigated to ${pageName} page`);
  };

  return {
    announceSuccess,
    announceError,
    announceWarning,
    announceInfo,
    announceProgress,
    announcePageChange,
    announce: announceMessage
  };
};