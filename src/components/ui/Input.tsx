import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  className?: string;
}

const inputVariants = {
  default: 'border-[var(--color-gray-300)] dark:border-[var(--color-gray-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
  error: 'border-[var(--color-danger)] dark:border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
};

const inputSizes = {
  sm: 'px-[var(--spacing-md)] py-[var(--spacing-xs)] text-[var(--font-size-sm)]', // px-3 py-1
  md: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)]', // px-3 py-2
  lg: 'px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-md)]'   // px-4 py-3
};

export function Input({
  variant = 'default',
  size = 'md',
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  const baseClasses = 'w-full rounded-[var(--radius-md)] border bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] text-[var(--color-gray-900)] dark:text-white focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors disabled:bg-[var(--color-gray-100)] dark:disabled:bg-[var(--color-gray-700)] disabled:cursor-not-allowed';
  
  const variantClasses = inputVariants[error ? 'error' : variant];
  const sizeClasses = inputSizes[size];
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] mb-[var(--spacing-sm)]">
          {label}
        </label>
      )}
      <input
        className={combinedClasses}
        {...props}
      />
      {error && (
        <p className="mt-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}