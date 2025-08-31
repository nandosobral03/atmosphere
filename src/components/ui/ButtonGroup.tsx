import React from 'react';
import { ReactNode } from 'react';

export interface ButtonGroupProps {
  children: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'column';
  className?: string;
}

const spacingClasses = {
  sm: 'gap-[var(--spacing-sm)]', // gap-2
  md: 'gap-[var(--spacing-md)]', // gap-3
  lg: 'gap-[var(--spacing-lg)]'  // gap-4
};

const directionClasses = {
  row: 'flex-row',
  column: 'flex-col'
};

export function ButtonGroup({
  children,
  spacing = 'sm',
  direction = 'row',
  className = ''
}: ButtonGroupProps) {
  const baseClasses = 'flex items-center';
  const spacingClass = spacingClasses[spacing];
  const directionClass = directionClasses[direction];
  
  const combinedClasses = `${baseClasses} ${directionClass} ${spacingClass} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}