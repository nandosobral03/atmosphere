import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const toggleSizes = {
  sm: {
    container: 'w-7 h-4', // w-7 h-4
    thumb: 'w-2.5 h-2.5', // w-2.5 h-2.5
    translate: 'translate-x-3' // translate-x-3
  },
  md: {
    container: 'w-9 h-5', // w-9 h-5 (existing size)
    thumb: 'w-3 h-3', // w-3 h-3
    translate: 'translate-x-5' // translate-x-5
  },
  lg: {
    container: 'w-11 h-6', // w-11 h-6
    thumb: 'w-4 h-4', // w-4 h-4
    translate: 'translate-x-6' // translate-x-6
  }
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = ''
}: ToggleProps) {
  const sizeConfig = toggleSizes[size];

  const containerClasses = `${sizeConfig.container} rounded-[var(--radius-full)] transition-colors ${
    checked 
      ? 'bg-[var(--color-primary)]' 
      : 'bg-[var(--color-gray-300)] dark:bg-[var(--color-gray-600)]'
  } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`;

  const thumbClasses = `${sizeConfig.thumb} bg-[var(--color-white)] rounded-[var(--radius-full)] shadow-[var(--shadow-md)] transform transition-transform ${
    checked ? sizeConfig.translate : 'translate-x-1'
  } mt-1`;

  return (
    <div className={`flex items-center ${className}`.trim()}>
      {label && (
        <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] mr-[var(--spacing-md)]">
          {label}
        </span>
      )}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={containerClasses}>
          <div className={thumbClasses} />
        </div>
      </label>
    </div>
  );
}