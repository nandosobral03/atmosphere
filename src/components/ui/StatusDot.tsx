import React from 'react';

export interface StatusDotProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusDotVariants = {
  primary: 'bg-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary)]',
  success: 'bg-[var(--color-success)]',
  danger: 'bg-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]',
  info: 'bg-[var(--color-info)]',
  inactive: 'bg-[var(--color-gray-400)]'
};

const statusDotSizes = {
  sm: 'w-2 h-2', // w-2 h-2
  md: 'w-3 h-3', // w-3 h-3 (current standard)
  lg: 'w-4 h-4'  // w-4 h-4
};

export function StatusDot({
  variant = 'primary',
  size = 'md',
  className = ''
}: StatusDotProps) {
  const baseClasses = 'rounded-[var(--radius-full)] flex-shrink-0';
  const variantClasses = statusDotVariants[variant];
  const sizeClasses = statusDotSizes[size];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return <div className={combinedClasses} />;
}