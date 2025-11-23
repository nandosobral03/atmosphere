export interface StatusDotProps {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "inactive";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusDotVariants = {
  primary: "bg-primary shadow-[0_0_0_1px_rgba(79,70,229,0.2)]",
  secondary: "bg-gray-400",
  success: "bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]",
  danger: "bg-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]",
  warning: "bg-amber-500 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]",
  info: "bg-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]",
  inactive: "bg-gray-300",
};

const statusDotSizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2.5 h-2.5",
  lg: "w-3.5 h-3.5",
};

export function StatusDot({ variant = "primary", size = "md", className = "" }: StatusDotProps) {
  const baseClasses = "rounded-full flex-shrink-0";
  const variantClasses = statusDotVariants[variant];
  const sizeClasses = statusDotSizes[size];

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

  return <div className={combinedClasses} />;
}
