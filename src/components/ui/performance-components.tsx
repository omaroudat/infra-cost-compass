import React, { Suspense, lazy } from 'react';
import { Skeleton } from './skeleton-loader';

// Lazy loading wrapper with fallback
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback = <Skeleton className="h-32 w-full" />,
  className
}) => (
  <div className={className}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </div>
);

// Optimized Image component with lazy loading
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
  lazy = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={error ? fallback : src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
};

// Virtualized list for performance
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleStart * itemHeight}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, visibleStart + index))}
        </div>
      </div>
    </div>
  );
}

// Debounced search input
interface DebouncedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  onSearch,
  placeholder = 'Search...',
  delay = 300,
  className
}) => {
  const [query, setQuery] = React.useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [query, delay, onSearch]);
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    />
  );
};

// Memoized component wrapper
export function withMemo<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, areEqual);
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  });
};