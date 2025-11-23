import { ReactNode } from "react";

export interface AlertProps {
  variant?: "success" | "danger" | "warning" | "info";
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  children: ReactNode;
}

const alertVariants = {
  success: "bg-success-light text-success-hover border-success-hover",
  danger: "bg-danger-light text-danger-hover border-danger-hover",
  warning: "bg-warning-light text-warning-hover border-warning-hover",
  info: "bg-info-light text-info-hover border-info-hover",
};

export function Alert({
  variant = "info",
  dismissible = false,
  onDismiss,
  className = "",
  children,
}: AlertProps) {
  const baseClasses = "p-3 rounded-xl text-sm font-medium transition-all duration-300 border";
  const variantClasses = alertVariants[variant];

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <div className={combinedClasses}>
      <div className={`flex items-center ${dismissible ? "justify-between" : "justify-center"}`}>
        <div className="break-words text-center flex-1">{children}</div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 p-1 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
