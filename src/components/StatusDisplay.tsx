import { CurrentConditions } from "../types";
import { getConditionIcon } from "../utils/icons";
import { Icon } from "./ui/Icon";

interface StatusDisplayProps {
  currentConditions: CurrentConditions | null;
}

export function StatusDisplay({ currentConditions }: StatusDisplayProps) {
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    
    // If it already contains AM/PM, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    try {
      // Handle 24-hour format like "18:25" or "07:05"
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = now.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    return { time, date };
  };

  const { time: currentTime, date: currentDate } = getCurrentDateTime();

  if (!currentConditions) {
    return (
      <div className="bg-card rounded-2xl p-4 mb-6 border border-border shadow-card">
        <div className="flex items-center justify-center py-4">
          <div className="text-center text-text-secondary">
            <div className="mb-2">
              <Icon name="loading" size={24} className="text-text-secondary animate-spin" />
            </div>
            <div className="text-sm">Loading conditions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 mb-6 border border-border shadow-card">
      {/* Main Status Row */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Weather Icon & Temp */}
        <div className="flex flex-col items-center bg-surface rounded-lg p-3 min-w-[80px]">
          <div className="mb-1">
            <Icon 
              name={currentConditions.weather_condition 
                ? getConditionIcon(currentConditions.weather_condition.toLowerCase()) 
                : getConditionIcon(currentConditions.time_period || "loading")}
              size={32} 
              className="text-text-primary" 
            />
          </div>
          {currentConditions.temperature && (
            <span className="text-sm font-semibold text-text-primary">
              {Math.round(currentConditions.temperature)}°
            </span>
          )}
        </div>

        {/* Weather & Location Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg text-text-primary capitalize leading-tight">
            {currentConditions.weather_condition || currentConditions.time_period}
          </div>
          {currentConditions.location && (
            <div className="text-sm text-text-secondary flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {currentConditions.location}
            </div>
          )}
          <div className="text-sm text-text-secondary mt-1">
            {currentDate} • {currentTime}
          </div>
        </div>

        {/* Additional Weather Info */}
        {currentConditions.humidity && (
          <div className="text-center bg-surface rounded-lg p-2 min-w-[60px]">
            <div className="text-xs text-text-secondary">Humidity</div>
            <div className="text-sm font-semibold text-text-primary">
              {Math.round(currentConditions.humidity)}%
            </div>
          </div>
        )}
      </div>

      {/* Sun Times Row */}
      {currentConditions.sunrise && currentConditions.sunset && (
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon name="dawn" size={18} className="text-primary" />
            <div>
              <div className="text-xs text-text-secondary">Sunrise</div>
              <div className="text-sm font-medium text-text-primary">
                {formatTime(currentConditions.sunrise)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Icon name="evening" size={18} className="text-primary" />
            <div>
              <div className="text-xs text-text-secondary">Sunset</div>
              <div className="text-sm font-medium text-text-primary">
                {formatTime(currentConditions.sunset)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
