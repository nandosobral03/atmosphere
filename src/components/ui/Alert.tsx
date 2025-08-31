import React from 'react';
import { ReactNode } from 'react';

export interface AlertProps {
  variant?: 'success' | 'danger' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children: ReactNode;
}

const alertVariants = {
  success: 'bg-[var(--color-success-light)] text-[var(--color-success-hover)] border-[var(--color-success-hover)] dark:bg-[var(--color-success-dark)] dark:text-[var(--color-success)] dark:border-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger-hover)] border-[var(--color-danger-hover)] dark:bg-[var(--color-danger-dark)] dark:text-[var(--color-danger)] dark:border-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning-hover)] border-[var(--color-warning-hover)] dark:bg-[var(--color-warning-dark)] dark:text-[var(--color-warning)] dark:border-[var(--color-warning)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info-hover)] border-[var(--color-info-hover)] dark:bg-[var(--color-info-dark)] dark:text-[var(--color-info)] dark:border-[var(--color-info)]'
};

export function Alert({
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = '',
  children
}: AlertProps) {
  const baseClasses = 'p-[var(--spacing-md)] rounded-[var(--radius-lg)] text-[var(--font-size-sm)] font-medium transition-all duration-300 border';
  const variantClasses = alertVariants[variant];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      <div className={`flex items-center ${dismissible ? 'justify-between' : 'justify-center'}`}>
        <div className="break-words text-center flex-1">{children}</div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-[var(--spacing-lg)] p-[var(--spacing-xs)] hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}