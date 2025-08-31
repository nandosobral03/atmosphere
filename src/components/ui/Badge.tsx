import React from 'react';
import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

const badgeVariants = {
  primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] dark:bg-[var(--color-primary-dark)] dark:text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary-hover)] dark:bg-[var(--color-secondary-dark)] dark:text-[var(--color-secondary)]',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success-hover)] dark:bg-[var(--color-success-dark)] dark:text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger-hover)] dark:bg-[var(--color-danger-dark)] dark:text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning-hover)] dark:bg-[var(--color-warning-dark)] dark:text-[var(--color-warning)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info-hover)] dark:bg-[var(--color-info-dark)] dark:text-[var(--color-info)]'
};

const badgeSizes = {
  xs: 'px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)]', // px-2 py-1 text-xs
  sm: 'px-[var(--spacing-md)] py-[var(--spacing-xs)] text-[var(--font-size-xs)]', // px-3 py-1 text-xs
  md: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)]'  // px-3 py-2 text-sm
};

export function Badge({
  variant = 'primary',
  size = 'xs',
  className = '',
  children
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-[var(--radius-full)]';
  const variantClasses = badgeVariants[variant];
  const sizeClasses = badgeSizes[size];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
}