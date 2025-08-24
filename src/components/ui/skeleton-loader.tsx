import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circular' | 'table';
  lines?: number;
  height?: string;
  width?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', lines = 1, height, width, ...props }, ref) => {
    const baseClasses = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md";
    
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                baseClasses,
                i === lines - 1 ? "h-4 w-3/4" : "h-4 w-full",
                className
              )}
            />
          ))}
        </div>
      );
    }

    const variants = {
      default: "h-4 w-full",
      card: "h-32 w-full",
      text: "h-4 w-full",
      circular: "h-10 w-10 rounded-full",
      table: "h-8 w-full"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          height && `h-[${height}]`,
          width && `w-[${width}]`,
          className
        )}
        style={{
          ...(height && { height }),
          ...(width && { width })
        }}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// Table Skeleton Component
const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Card Skeleton Component
const CardSkeleton = ({ showAvatar = false }: { showAvatar?: boolean }) => (
  <div className="p-6 space-y-4">
    {showAvatar && (
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    )}
    <Skeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

// Dashboard Stats Skeleton
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card-refined p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton variant="circular" className="h-8 w-8" />
        </div>
        <Skeleton className="h-8 w-16" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export { Skeleton, TableSkeleton, CardSkeleton, StatsSkeleton };