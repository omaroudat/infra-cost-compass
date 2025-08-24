import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  pulse?: boolean;
  shine?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    loading = false, 
    loadingText,
    icon: Icon,
    iconPosition = 'left',
    gradient = false,
    pulse = false,
    shine = false,
    disabled,
    variant = 'default',
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    const getVariantClasses = () => {
      if (gradient) {
        switch (variant) {
          case 'default':
            return 'bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 border-0 text-primary-foreground';
          case 'destructive':
            return 'bg-gradient-to-r from-destructive to-red-600 hover:shadow-lg hover:shadow-destructive/25 border-0';
          case 'secondary':
            return 'bg-gradient-secondary hover:shadow-lg hover:shadow-secondary/25 border-0';
          case 'premium':
            return 'bg-gradient-accent hover:shadow-lg hover:shadow-accent/25 border-0';
          default:
            return '';
        }
      }
      return '';
    };

    const buttonClasses = cn(
      'btn-base relative overflow-hidden transition-all duration-300',
      gradient && getVariantClasses(),
      pulse && !isDisabled && 'hover:animate-pulse-glow',
      shine && 'hover:shadow-premium',
      !isDisabled && 'hover:scale-105 active:scale-95',
      isDisabled && 'cursor-not-allowed opacity-60',
      className
    );

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        );
      }

      return (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
          {children && (
            <span className={cn(Icon ? (iconPosition === 'left' ? 'ml-2' : 'mr-2') : '')}>
              {children}
            </span>
          )}
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
        </>
      );
    };

    return (
      <Button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        variant={gradient ? 'default' : variant}
        {...props}
      >
        {renderContent()}
        {shine && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-all duration-700" />
        )}
      </Button>
    );
  }
);
EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };