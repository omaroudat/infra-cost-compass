import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient' | 'bordered';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-card text-card-foreground border shadow-sm',
  elevated: 'bg-card text-card-foreground border-0 shadow-premium',
  glass: 'glass-card',
  gradient: 'bg-gradient-subtle border-0 shadow-elegant text-foreground',
  bordered: 'bg-card text-card-foreground border-2 border-primary/10 shadow-soft'
};

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          cardVariants[variant],
          padding !== 'none' && paddingVariants[padding],
          hover && 'interactive-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className
}) => {
  if (loading) {
    return (
      <EnhancedCard variant="elevated" className={className}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            {Icon && <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />}
          </div>
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard variant="elevated" hover className={cn('group', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
            {value}
          </p>
          
          {(description || trend) && (
            <div className="flex items-center justify-between text-sm">
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div className={cn(
                  'flex items-center space-x-1 font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}>
                  <span className={trend.isPositive ? '↗' : '↘'} />
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </EnhancedCard>
  );
};

export { EnhancedCard, StatsCard };