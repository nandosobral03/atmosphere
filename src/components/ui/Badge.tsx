import { ReactNode } from "react";

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline";
  size?: "xs" | "sm" | "md";
  className?: string;
  children: ReactNode;
}

const badgeVariants = {
  primary: "bg-primary/10 text-primary border border-primary/20",
  secondary: "bg-gray-100 text-gray-600 border border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  outline: "bg-transparent text-text-secondary border border-border",
};

const badgeSizes = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Badge({ variant = "primary", size = "sm", className = "", children }: BadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded";
  const variantClasses = badgeVariants[variant];
  const sizeClasses = badgeSizes[size];

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return <span className={combinedClasses}>{children}</span>;
}
