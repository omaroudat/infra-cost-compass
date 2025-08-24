import React from 'react';

// ARIA Label Helper
export const getAriaLabel = (
  element: string,
  context?: string,
  state?: string
): string => {
  let label = element;
  if (context) label += ` ${context}`;
  if (state) label += `, ${state}`;
  return label;
};

// ARIA Describedby Helper
export const getAriaDescribedBy = (...ids: (string | undefined)[]): string | undefined => {
  const validIds = ids.filter(Boolean) as string[];
  return validIds.length > 0 ? validIds.join(' ') : undefined;
};

// Generate unique IDs for accessibility
let idCounter = 0;
export const generateId = (prefix: string = 'accessibility'): string => {
  return `${prefix}-${++idCounter}`;
};

// Screen Reader Only Text Component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Visually Hidden but Focusable Component
export const VisuallyHidden: React.FC<{ 
  children: React.ReactNode;
  focusable?: boolean;
}> = ({ children, focusable = false }) => (
  <span className={focusable ? 'sr-only focus:not-sr-only' : 'sr-only'}>
    {children}
  </span>
);

// ARIA Expanded Button
interface AriaExpandedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  expanded: boolean;
  controls?: string;
  children: React.ReactNode;
}

export const AriaExpandedButton: React.FC<AriaExpandedButtonProps> = ({
  expanded,
  controls,
  children,
  ...props
}) => (
  <button
    {...props}
    aria-expanded={expanded}
    aria-controls={controls}
    type="button"
  >
    {children}
    <ScreenReaderOnly>
      {expanded ? 'expanded' : 'collapsed'}
    </ScreenReaderOnly>
  </button>
);

// ARIA Selected Option
interface AriaSelectedOptionProps {
  children: React.ReactNode;
  selected: boolean;
  value: string;
  onClick: () => void;
}

export const AriaSelectedOption: React.FC<AriaSelectedOptionProps> = ({
  children,
  selected,
  value,
  onClick
}) => (
  <div
    role="option"
    aria-selected={selected}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    tabIndex={selected ? 0 : -1}
    className={`cursor-pointer p-2 rounded ${
      selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
    }`}
  >
    {children}
    {selected && <ScreenReaderOnly>, selected</ScreenReaderOnly>}
  </div>
);

// Progress Announcer
interface ProgressAnnouncerProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressAnnouncer: React.FC<ProgressAnnouncerProps> = ({
  value,
  max,
  label = 'Progress',
  showPercentage = true
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${label}${showPercentage ? `, ${percentage}% complete` : ''}`}
      className="sr-only"
    >
      {label}: {value} of {max}
      {showPercentage && ` (${percentage}%)`}
    </div>
  );
};

// Error Boundary with Accessibility
interface AccessibleErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AccessibleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  AccessibleErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AccessibleErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Accessibility Error Boundary caught an error:', error, errorInfo);
    
    // Announce error to screen readers
    const announcer = document.querySelector('[aria-live="assertive"]');
    if (announcer) {
      announcer.textContent = 'An error occurred. Please refresh the page or contact support.';
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 border border-destructive bg-destructive/10 rounded-lg"
          >
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Loading State Announcer
export const LoadingAnnouncer: React.FC<{
  isLoading: boolean;
  message?: string;
}> = ({ isLoading, message = 'Content is loading' }) => {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="sr-only"
    >
      {message}
    </div>
  );
};

// Form Validation Helpers
export const getValidationProps = (
  fieldName: string,
  errors: Record<string, string>,
  helpText?: string
) => {
  const error = errors[fieldName];
  const hasError = Boolean(error);
  
  return {
    'aria-invalid': hasError,
    'aria-describedby': getAriaDescribedBy(
      helpText && `${fieldName}-help`,
      error && `${fieldName}-error`
    ),
    'aria-required': true
  };
};

// Table Helpers
export const getTableCellProps = (
  rowIndex: number,
  colIndex: number,
  isHeader: boolean = false
) => ({
  role: isHeader ? 'columnheader' : 'cell',
  'aria-rowindex': rowIndex + 1,
  'aria-colindex': colIndex + 1,
  ...(isHeader && { scope: 'col' })
});

// Dialog Helpers
export const getDialogProps = (
  isOpen: boolean,
  titleId: string,
  descriptionId?: string
) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': titleId,
  'aria-describedby': descriptionId,
  'aria-hidden': !isOpen
});