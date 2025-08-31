import React from 'react';
import { ReactNode } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'navigation';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border-transparent',
  secondary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white border-transparent',
  success: 'bg-[var(--color-success)] hover:bg-[var(--color-success-hover)] text-white border-transparent',
  danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-white border-transparent',
  ghost: 'bg-transparent hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-700)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] border-[var(--color-gray-300)] dark:border-[var(--color-gray-600)]',
  navigation: 'bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-700)] text-[var(--color-gray-900)] dark:text-white border-[var(--color-gray-200)] dark:border-[var(--color-gray-700)]'
};

const buttonSizes = {
  sm: 'px-[var(--spacing-md)] py-[var(--spacing-xs)] text-[var(--font-size-xs)] font-medium',
  md: 'px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] font-medium',
  lg: 'px-[var(--spacing-2xl)] py-[var(--spacing-md)] text-[var(--font-size-md)] font-semibold'
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-[var(--radius-lg)] border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--color-gray-400)]';
  
  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="w-4 h-4 mr-2 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}