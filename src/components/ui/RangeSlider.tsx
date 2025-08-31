import React from 'react';

export interface RangeSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  error?: string;
  className?: string;
}

export function RangeSlider({
  label,
  showValue = false,
  valueFormatter,
  error,
  className = '',
  value,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: RangeSliderProps) {
  const currentValue = Number(value) || 0;
  const formatValue = valueFormatter || ((val: number) => val.toString());

  return (
    <div className={`w-full ${className}`.trim()}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-[var(--spacing-sm)]">
          {label && (
            <label className="text-[var(--font-size-sm)] font-medium text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)]">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-[var(--font-size-sm)] text-[var(--color-gray-500)] dark:text-[var(--color-gray-400)]">
              {formatValue(currentValue)}
            </span>
          )}
        </div>
      )}
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="w-full h-2 bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-600)] rounded-[var(--radius-lg)] appearance-none cursor-pointer slider disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      
      {/* Show min/max labels if provided */}
      {(min !== undefined && max !== undefined) && (
        <div className="flex justify-between text-[var(--font-size-xs)] text-[var(--color-gray-500)] dark:text-[var(--color-gray-400)] mt-[var(--spacing-xs)]">
          <span>{formatValue(Number(min))}</span>
          <span>{formatValue(Number(max))}</span>
        </div>
      )}
      
      {error && (
        <p className="mt-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}