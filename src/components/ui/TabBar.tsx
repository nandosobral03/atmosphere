import { ReactNode } from "react";
import { Icon, IconName } from "./Icon";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode | IconName;
  count?: number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "bordered";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const tabVariants = {
  default: {
    container: "bg-surface rounded-lg",
    tab: "rounded-md",
    active: "bg-primary text-text-inverse",
    inactive: "text-text-primary hover:bg-border",
  },
  bordered: {
    container: "border border-border rounded-lg overflow-hidden",
    tab: "",
    active: "bg-primary text-text-inverse",
    inactive: "bg-card text-text-primary hover:bg-surface border-r border-border last:border-r-0",
  },
};

const tabSizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  size = "md",
  className = "",
}: TabBarProps) {
  const variantConfig = tabVariants[variant];
  const sizeClasses = tabSizes[size];

  return (
    <div className={`flex ${variantConfig.container} ${className}`.trim()}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const isDisabled = tab.disabled;

        const tabClasses = `
          flex-1 font-medium transition-colors text-center cursor-pointer
          ${variantConfig.tab}
          ${isActive ? variantConfig.active : variantConfig.inactive}
          ${sizeClasses}
          ${isDisabled ? "cursor-not-allowed opacity-50" : ""}
          ${variant === "bordered" && index > 0 ? "border-l" : ""}
        `.trim();

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={tabClasses}
          >
            <div className="flex items-center justify-center space-x-2">
              {tab.icon && (
                <span>
                  {typeof tab.icon === "string" ? (
                    <Icon name={tab.icon as IconName} size={16} />
                  ) : (
                    tab.icon
                  )}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 text-xs opacity-75">({tab.count})</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
