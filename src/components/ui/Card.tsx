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
  padding?: "sm" | "md" | "lg";
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const cardVariants = {
  default: "bg-card border-border",
  highlighted: "bg-primary-light border-primary",
  status: "bg-primary-light border-primary-hover",
  info: "bg-primary-light border-primary",
  success: "bg-success-light border-success-hover",
  warning: "bg-warning-light border-warning-hover",
  danger: "bg-danger-light border-danger-hover",
  editing: "bg-warning-light border-warning-hover",
};

const cardPadding = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const cardShadows = {
  none: "",
  sm: "shadow-card",
  md: "shadow-card-hover",
  lg: "shadow-card-hover",
};

export function Card({
  variant = "default",
  padding = "md",
  border = true,
  shadow = "sm",
  className = "",
  children,
}: CardProps) {
  const baseClasses = "rounded-2xl transition-all";
  const variantClasses = cardVariants[variant];
  const paddingClasses = cardPadding[padding];
  const borderClasses = border ? "border" : "";
  const shadowClasses = cardShadows[shadow];

  const combinedClasses =
    `${baseClasses} ${variantClasses} ${paddingClasses} ${borderClasses} ${shadowClasses} ${className}`.trim();

  return <div className={combinedClasses}>{children}</div>;
}
