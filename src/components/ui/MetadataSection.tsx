import React from 'react';
import { ReactNode } from 'react';

export interface MetadataItemProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

export interface MetadataSectionProps {
  items: MetadataItemProps[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  separator?: boolean;
  className?: string;
}

const layoutClasses = {
  vertical: 'space-y-[var(--spacing-sm)]',
  horizontal: 'flex items-center space-x-[var(--spacing-lg)]',
  grid: 'grid grid-cols-2 gap-[var(--spacing-md)]'
};

export function MetadataSection({
  items,
  layout = 'vertical',
  separator = true,
  className = ''
}: MetadataSectionProps) {
  const layoutClass = layoutClasses[layout];
  const separatorClasses = separator ? 'pt-[var(--spacing-md)] border-t border-[var(--color-gray-200)] dark:border-[var(--color-gray-600)]' : '';

  return (
    <div className={`${separatorClasses} ${className}`.trim()}>
      <div className={layoutClass}>
        {items.map((item, index) => (
          <MetadataItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
}

function MetadataItem({ label, value, icon }: MetadataItemProps) {
  return (
    <div className="flex items-center justify-between text-[var(--font-size-xs)] text-[var(--color-gray-500)] dark:text-[var(--color-gray-400)]">
      <div className="flex items-center space-x-[var(--spacing-sm)]">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="font-medium">{label}:</span>
      </div>
      <span className="text-[var(--color-gray-900)] dark:text-white">{value}</span>
    </div>
  );
}

// Pre-built metadata components for common patterns
export function TimestampMetadata({
  createdAt,
  lastModified,
  className = ''
}: {
  createdAt?: Date | string;
  lastModified?: Date | string;
  className?: string;
}) {
  const items: MetadataItemProps[] = [];

  if (createdAt) {
    items.push({
      label: 'Created',
      value: new Date(createdAt).toLocaleString(),
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
    });
  }

  if (lastModified) {
    items.push({
      label: 'Last Modified',
      value: new Date(lastModified).toLocaleString(),
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    });
  }

  return <MetadataSection items={items} className={className} />;
}