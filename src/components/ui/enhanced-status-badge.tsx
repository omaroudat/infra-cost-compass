import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface EnhancedStatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected' | 'conditional' | 'in_progress' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

const statusConfig = {
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    classes: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    iconClasses: 'text-success'
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    iconClasses: 'text-warning'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    classes: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
    iconClasses: 'text-destructive'
  },
  conditional: {
    label: 'Conditional',
    icon: AlertTriangle,
    classes: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
    iconClasses: 'text-accent'
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    classes: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    iconClasses: 'text-primary'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    classes: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    iconClasses: 'text-success'
  }
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3'
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4'
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'h-5 w-5'
  }
};

export const EnhancedStatusBadge: React.FC<EnhancedStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  animated = false,
  className
}) => {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border transition-all duration-200',
        config.classes,
        sizeStyles.badge,
        animated && 'hover:scale-105 hover:shadow-md',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeStyles.icon,
            config.iconClasses,
            status === 'in_progress' && animated && 'animate-spin'
          )}
        />
      )}
      <span className="font-semibold tracking-wide">{config.label}</span>
    </Badge>
  );
};

// Progress Status Badge with percentage
interface ProgressStatusBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const ProgressStatusBadge: React.FC<ProgressStatusBadgeProps> = ({
  percentage,
  size = 'md',
  showText = true,
  className
}) => {
  const getStatus = (percent: number) => {
    if (percent === 0) return 'pending';
    if (percent < 50) return 'in_progress';
    if (percent < 100) return 'conditional';
    return 'completed';
  };

  const status = getStatus(percentage);
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className={cn(
          'relative overflow-hidden rounded-full bg-muted border',
          sizeStyles.badge
        )}>
          <div
            className={cn(
              'absolute inset-0 transition-all duration-500 ease-out',
              config.classes.replace('/10', '/20').replace('hover:bg-', 'bg-')
            )}
            style={{ width: `${percentage}%` }}
          />
          {showText && (
            <div className="relative z-10 px-3 py-1.5">
              <span className="text-xs font-bold text-foreground/80">
                {percentage.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};