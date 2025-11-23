import React from "react";
import { ReactNode } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: "bg-primary hover:bg-primary-hover text-white shadow-sm border-transparent",
  secondary: "bg-white hover:bg-gray-50 text-text-primary border-border shadow-sm",
  success: "bg-success hover:bg-success-hover text-white shadow-sm border-transparent",
  danger: "bg-danger hover:bg-danger-hover text-white shadow-sm border-transparent",
  ghost:
    "bg-transparent hover:bg-gray-100 text-text-secondary hover:text-text-primary border-transparent shadow-none",
  outline: "bg-transparent hover:bg-gray-50 text-text-primary border-border border shadow-sm",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs font-medium",
  md: "px-4 py-2 text-sm font-medium",
  lg: "px-6 py-3 text-base font-medium",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-none cursor-pointer active:scale-[0.98]";

  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return (
    <button className={combinedClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="w-4 h-4 mr-2 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
