import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  blur?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  blur = true,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {isLoading && (
        <div className={cn(
          'absolute inset-0 z-50 flex items-center justify-center',
          'bg-background/80 backdrop-blur-sm',
          blur && 'backdrop-blur-md'
        )}>
          <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-card/90 shadow-luxury border">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-lg opacity-20 animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            {message && (
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <Loader2 className={cn('animate-spin text-primary', sizeConfig[size], className)} />
  );
};

// Loading Button Component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
        'bg-primary text-primary-foreground font-medium',
        'hover:bg-primary/90 transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading && <Spinner size="sm" className="text-current" />}
      {isLoading ? loadingText : children}
    </button>
  );
};