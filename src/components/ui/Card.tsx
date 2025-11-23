import { ReactNode } from "react";

export interface CardProps {
  variant?:
    | "default"
    | "highlighted"
    | "status"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "editing";
  padding?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const cardVariants = {
  default: "bg-card border-border",
  highlighted: "bg-primary-light border-primary-light/50",
  status: "bg-white border-border",
  info: "bg-blue-50 border-blue-100",
  success: "bg-green-50 border-green-100",
  warning: "bg-amber-50 border-amber-100",
  danger: "bg-red-50 border-red-100",
  editing: "bg-amber-50/50 border-amber-200 dashed border-2",
};

const cardPadding = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const cardShadows = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export function Card({
  variant = "default",
  padding = "md",
  border = true,
  shadow = "sm",
  className = "",
  children,
}: CardProps) {
  const baseClasses = "rounded-lg transition-all duration-200";
  const variantClasses = cardVariants[variant];
  const paddingClasses = cardPadding[padding];
  const borderClasses = border && !variant.includes("editing") ? "border" : "";
  const shadowClasses = cardShadows[shadow];

  const combinedClasses =
    `${baseClasses} ${variantClasses} ${paddingClasses} ${borderClasses} ${shadowClasses} ${className}`.trim();

  return <div className={combinedClasses}>{children}</div>;
}
