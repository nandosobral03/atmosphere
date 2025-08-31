import React from 'react';
import { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tabVariants = {
  default: {
    container: 'bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-700)] rounded-[var(--radius-lg)]',
    tab: 'rounded-[var(--radius-md)]',
    active: 'bg-[var(--color-primary)] text-white',
    inactive: 'text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-600)]'
  },
  bordered: {
    container: 'border border-[var(--color-gray-200)] dark:border-[var(--color-gray-600)] rounded-[var(--radius-lg)] overflow-hidden',
    tab: '',
    active: 'bg-[var(--color-primary)] text-white',
    inactive: 'bg-[var(--color-white)] dark:bg-[var(--color-gray-800)] text-[var(--color-gray-700)] dark:text-[var(--color-gray-300)] hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-700)] border-r border-[var(--color-gray-200)] dark:border-[var(--color-gray-600)] last:border-r-0'
  }
};

const tabSizes = {
  sm: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-xs)]', // px-3 py-2 text-xs
  md: 'px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-[var(--font-size-sm)]', // px-4 py-2 text-sm
  lg: 'px-[var(--spacing-2xl)] py-[var(--spacing-md)] text-[var(--font-size-md)]' // px-6 py-3 text-base
};

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = ''
}: TabBarProps) {
  const variantConfig = tabVariants[variant];
  const sizeClasses = tabSizes[size];

  return (
    <div className={`flex ${variantConfig.container} ${className}`.trim()}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const isDisabled = tab.disabled;

        const tabClasses = `
          flex-1 font-medium transition-colors text-center
          ${variantConfig.tab}
          ${isActive ? variantConfig.active : variantConfig.inactive}
          ${sizeClasses}
          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${variant === 'bordered' && index > 0 ? 'border-l' : ''}
        `.trim();

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={tabClasses}
          >
            <div className="flex items-center justify-center space-x-[var(--spacing-sm)]">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 text-[var(--font-size-xs)] opacity-75">
                  ({tab.count})
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}