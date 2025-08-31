import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const skeletonVariants = {
  text: 'rounded-[var(--radius-sm)]',
  rectangular: 'rounded-[var(--radius-md)]',
  circular: 'rounded-[var(--radius-full)]'
};

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = ''
}: SkeletonProps) {
  const baseClasses = 'bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)] animate-pulse';
  const variantClasses = skeletonVariants[variant];
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  // Default dimensions for different variants
  const defaultClasses = variant === 'text' ? 'h-4' : variant === 'circular' ? 'w-10 h-10' : 'w-full h-20';
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${!width && !height ? defaultClasses : ''} ${className}`.trim();

  return <div className={combinedClasses} style={style} />;
}

// Pre-built skeleton components for common patterns
export function TextSkeleton({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : '100%'} />
      ))}
    </div>
  );
}

export function ButtonSkeleton({ className = '' }: { className?: string }) {
  return <Skeleton variant="rectangular" width="100px" height="36px" className={className} />;
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-[var(--spacing-lg)] space-y-[var(--spacing-md)] ${className}`.trim()}>
      <div className="flex items-center space-x-[var(--spacing-md)]">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="120px" />
    </div>
  );
}