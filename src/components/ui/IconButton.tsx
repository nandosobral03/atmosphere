import React from 'react';
import { ReactNode } from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const iconButtonVariants = {
  primary: 'text-primary hover:text-primary-hover hover:bg-primary-light',
  secondary: 'text-text-secondary hover:text-text-primary hover:bg-surface',
  success: 'text-success hover:text-success-hover hover:bg-success-light',
  danger: 'text-danger hover:text-danger-hover hover:bg-danger-light',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface'
};

const iconButtonSizes = {
  sm: 'p-1',
  md: 'p-2'
};

export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';
  
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