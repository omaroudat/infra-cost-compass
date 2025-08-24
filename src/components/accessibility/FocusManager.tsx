import React, { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  restoreFocus = false,
  autoFocus = false,
  trapFocus = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [restoreFocus, autoFocus]);

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!trapFocus || event.key !== 'Tab' || !containerRef.current) {
      return;
    }

    const focusableElements = getFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

// Skip Link Component
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-lg"
    onFocus={() => {
      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.textContent = `Skip link activated: ${typeof children === 'string' ? children : 'Skip to section'}`;
      announcement.className = 'sr-only';
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }}
  >
    {children}
  </a>
);

// Landmark Region Component
interface LandmarkProps {
  children: React.ReactNode;
  role?: 'main' | 'navigation' | 'complementary' | 'contentinfo' | 'banner';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
}

export const Landmark: React.FC<LandmarkProps> = ({
  children,
  role = 'main',
  ariaLabel,
  ariaLabelledBy,
  className
}) => {
  const props = {
    role,
    className,
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy })
  };

  return React.createElement(role === 'main' ? 'main' : 'section', props, children);
};