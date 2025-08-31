import React from 'react';
import { ReactNode } from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const iconButtonVariants = {
  primary: 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary-light)]',
  secondary: 'text-[var(--color-secondary)] hover:text-[var(--color-secondary-hover)] hover:bg-[var(--color-secondary-light)]',
  success: 'text-[var(--color-success)] hover:text-[var(--color-success-hover)] hover:bg-[var(--color-success-light)]',
  danger: 'text-[var(--color-danger)] hover:text-[var(--color-danger-hover)] hover:bg-[var(--color-danger-light)]',
  ghost: 'text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] dark:text-[var(--color-gray-400)] dark:hover:text-[var(--color-gray-200)] hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-700)]'
};

const iconButtonSizes = {
  sm: 'p-[var(--spacing-xs)]', // p-1
  md: 'p-[var(--spacing-sm)]'  // p-2
};

export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClasses = iconButtonVariants[variant];
  const sizeClasses = iconButtonSizes[size];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}