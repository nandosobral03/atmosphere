import React from 'react';
import { ReactNode } from 'react';

export interface CardProps {
  variant?: 'default' | 'highlighted' | 'status' | 'info' | 'success' | 'warning' | 'danger' | 'editing';
  padding?: 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

const cardVariants = {
  default: 'bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] border-[var(--color-gray-200)] dark:border-[var(--color-gray-700)]',
  highlighted: 'bg-[var(--color-primary-light)] dark:bg-[var(--color-primary-dark)] border-[var(--color-primary)] dark:border-[var(--color-primary)]',
  status: 'bg-[var(--color-primary-light)] dark:bg-[var(--color-primary-dark)] border-[var(--color-primary-hover)] dark:border-[var(--color-primary)]',
  info: 'bg-[var(--color-info-light)] dark:bg-[var(--color-info-dark)] border-[var(--color-info-hover)] dark:border-[var(--color-info)]',
  success: 'bg-[var(--color-success-light)] dark:bg-[var(--color-success-dark)] border-[var(--color-success-hover)] dark:border-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] dark:bg-[var(--color-warning-dark)] border-[var(--color-warning-hover)] dark:border-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-light)] dark:bg-[var(--color-danger-dark)] border-[var(--color-danger-hover)] dark:border-[var(--color-danger)]',
  editing: 'bg-[var(--color-warning-light)] dark:bg-[var(--color-warning-dark)] border-[var(--color-warning-hover)] dark:border-[var(--color-warning)]'
};

const cardPadding = {
  sm: 'p-[var(--spacing-md)]', // p-3
  md: 'p-[var(--spacing-lg)]', // p-4
  lg: 'p-[var(--spacing-2xl)]' // p-6
};

const cardShadows = {
  none: '',
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
  lg: 'shadow-[var(--shadow-lg)]'
};

export function Card({
  variant = 'default',
  padding = 'md',
  border = true,
  shadow = 'sm',
  className = '',
  children
}: CardProps) {
  const baseClasses = 'rounded-[var(--radius-lg)] transition-all';
  const variantClasses = cardVariants[variant];
  const paddingClasses = cardPadding[padding];
  const borderClasses = border ? 'border' : '';
  const shadowClasses = cardShadows[shadow];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${paddingClasses} ${borderClasses} ${shadowClasses} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}