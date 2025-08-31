import React from 'react';
import { ReactNode } from 'react';

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  icon?: ReactNode;
  backdrop?: 'light' | 'dark' | 'blur';
  className?: string;
}

const backdropVariants = {
  light: 'bg-[var(--color-white)] bg-opacity-80',
  dark: 'bg-[var(--color-black)] bg-opacity-50',
  blur: 'bg-[var(--color-white)] bg-opacity-70 backdrop-blur-sm dark:bg-[var(--color-black)] dark:bg-opacity-50'
};

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  icon,
  backdrop = 'blur',
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  const backdropClasses = backdropVariants[backdrop];

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${backdropClasses} ${className}`.trim()}>
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] rounded-[var(--radius-xl)] p-[var(--spacing-2xl)] shadow-[var(--shadow-lg)] border border-[var(--color-gray-200)] dark:border-[var(--color-gray-700)] max-w-sm w-full mx-[var(--spacing-lg)]">
        <div className="text-center space-y-[var(--spacing-lg)]">
          {/* Loading Spinner or Custom Icon */}
          <div className="flex justify-center">
            {icon || (
              <div className="animate-spin rounded-[var(--radius-full)] h-8 w-8 border-b-2 border-[var(--color-primary)]" />
            )}
          </div>
          
          {/* Loading Message */}
          <div>
            <h3 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-gray-900)] dark:text-white mb-[var(--spacing-sm)]">
              {message}
            </h3>
            <p className="text-[var(--font-size-sm)] text-[var(--color-gray-500)] dark:text-[var(--color-gray-400)]">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simpler version for inline loading states
export function InlineLoading({
  message = 'Loading...',
  size = 'md',
  className = ''
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizes = {
    sm: 'text-[var(--font-size-sm)]',
    md: 'text-[var(--font-size-md)]',
    lg: 'text-[var(--font-size-lg)]'
  };

  return (
    <div className={`flex items-center justify-center space-x-[var(--spacing-md)] ${className}`.trim()}>
      <div className={`animate-spin rounded-[var(--radius-full)] border-b-2 border-[var(--color-primary)] ${sizeClasses[size]}`} />
      <span className={`text-[var(--color-gray-600)] dark:text-[var(--color-gray-400)] ${textSizes[size]}`}>
        {message}
      </span>
    </div>
  );
}