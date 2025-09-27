import { memo } from "react";
import { Icon, IconName } from "./ui/Icon";

interface NavigationButtonProps {
  onClick: () => void;
  icon: IconName;
  title: string;
  description: string;
  className?: string;
}

const NavigationButtonComponent = ({ 
  onClick, 
  icon, 
  title, 
  description, 
  className = "" 
}: NavigationButtonProps) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-2xl border border-border bg-card backdrop-blur-sm transition-all duration-300 ease-out group hover:-translate-y-1 hover:scale-[1.02] shadow-card hover:shadow-card-hover active:scale-[0.98] transform-gpu focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer ${className}`}
  >
    <div className="text-center">
      <div className="mb-4 group-hover:scale-110 transition-transform duration-200 flex justify-center">
        <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
          <Icon name={icon} size={32} className="text-primary" />
        </div>
      </div>
      <h3 className="font-semibold mb-2 text-text-primary text-lg">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  </button>
);

export const NavigationButton = memo(NavigationButtonComponent);