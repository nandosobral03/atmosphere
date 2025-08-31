import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  label,
  error,
  placeholder,
  className = '',
  ...props
}: SelectProps) {
  const baseClasses = 'w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] rounded-[var(--radius-md)] border bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] text-[var(--color-gray-900)] dark:text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-offset-0 focus:outline-none transition-colors disabled:bg-[var(--color-gray-100)] dark:disabled:bg-[var(--color-gray-700)] disabled:cursor-not-allowed';
  
  const borderClasses = error 
    ? 'border-[var(--color-danger)] dark:border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
    : 'border-[var(--color-gray-300)] dark:border-[var(--color-gray-600)]';
  
  const combinedClasses = `${baseClasses} ${borderClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[var(--font-size-sm)] font-medium text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] mb-[var(--spacing-sm)]">
          {label}
        </label>
      )}
      <select
        className={combinedClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}