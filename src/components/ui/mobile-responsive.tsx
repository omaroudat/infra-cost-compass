import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

// Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className
}) => (
  <div className={cn(
    'w-full mx-auto px-4 sm:px-6 lg:px-8',
    'max-w-7xl',
    className
  )}>
    {children}
  </div>
);

// Mobile Navigation Component
interface MobileNavProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const MobileNav: React.FC<MobileNavProps> = ({
  children,
  trigger,
  side = 'left'
}) => (
  <div className="md:hidden">
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={side} className="w-80 p-0">
        {children}
      </SheetContent>
    </Sheet>
  </div>
);

// Responsive Grid
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className
}) => {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

// Responsive Stack
interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    mobile?: 'row' | 'column';
    tablet?: 'row' | 'column';
    desktop?: 'row' | 'column';
  };
  gap?: number;
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = { mobile: 'column', tablet: 'row', desktop: 'row' },
  gap = 4,
  className
}) => {
  const stackClasses = [
    'flex',
    `gap-${gap}`,
    direction.mobile === 'column' ? 'flex-col' : 'flex-row',
    direction.tablet === 'column' ? 'md:flex-col' : 'md:flex-row',
    direction.desktop === 'column' ? 'lg:flex-col' : 'lg:flex-row',
  ].join(' ');

  return (
    <div className={cn(stackClasses, className)}>
      {children}
    </div>
  );
};

// Mobile-friendly Button Group
interface MobileButtonGroupProps {
  children: React.ReactNode;
  stackOnMobile?: boolean;
  className?: string;
}

export const MobileButtonGroup: React.FC<MobileButtonGroupProps> = ({
  children,
  stackOnMobile = true,
  className
}) => (
  <div className={cn(
    'flex gap-2',
    stackOnMobile && 'flex-col sm:flex-row',
    className
  )}>
    {children}
  </div>
);

// Responsive Table Wrapper
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className
}) => (
  <div className={cn(
    'w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
    className
  )}>
    <div className="min-w-full inline-block align-middle">
      {children}
    </div>
  </div>
);

// Hide/Show on breakpoints
interface BreakpointVisibilityProps {
  children: React.ReactNode;
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
  showOn?: ('mobile' | 'tablet' | 'desktop')[];
  className?: string;
}

export const BreakpointVisibility: React.FC<BreakpointVisibilityProps> = ({
  children,
  hideOn = [],
  showOn = [],
  className
}) => {
  const visibilityClasses = [
    hideOn.includes('mobile') && 'hidden',
    hideOn.includes('tablet') && 'md:hidden',
    hideOn.includes('desktop') && 'lg:hidden',
    showOn.includes('mobile') && 'block',
    showOn.includes('tablet') && 'md:block',
    showOn.includes('desktop') && 'lg:block',
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(visibilityClasses, className)}>
      {children}
    </div>
  );
};