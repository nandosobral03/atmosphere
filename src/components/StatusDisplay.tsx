import { CurrentConditions } from "../types";
import { getConditionIcon } from "../utils/icons";
import { Icon } from "./ui/Icon";

interface StatusDisplayProps {
  currentConditions: CurrentConditions | null;
}

export function StatusDisplay({ currentConditions }: StatusDisplayProps) {
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";

    // If it already contains AM/PM, return as is
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    try {
      // Handle 24-hour format like "18:25" or "07:05"
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? "PM" : "AM";
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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return { time, date };
  };

  const { time: currentTime } = getCurrentDateTime();

  if (!currentConditions) {
    return (
      <div className="mb-8 px-2 py-6 text-center">
        <div className="flex items-center justify-center space-x-3 text-text-secondary">
          <Icon name="loading" size={24} className="animate-spin" />
          <span className="text-base font-medium">Loading conditions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 px-2 pt-4">
      <div className="flex items-center justify-start space-x-6 mb-6">
        {/* Weather Icon & Temp Box */}
        <div className="flex flex-col items-center justify-center w-24 h-24 flex-shrink-0">
          <Icon
            name={
              currentConditions.weather_condition
                ? getConditionIcon(currentConditions.weather_condition.toLowerCase())
                : getConditionIcon(currentConditions.time_period || "loading")
            }
            size={40}
            className="text-primary mb-1"
          />
          {currentConditions.temperature && (
            <span className="text-2xl font-bold text-text-primary leading-none">
              {Math.round(currentConditions.temperature)}°
            </span>
          )}
        </div>

        <div className="w-px h-16 bg-black/20"></div>

        {/* Info */}
        <div>
          <h2 className="text-3xl font-bold text-text-primary capitalize leading-tight">
            {currentConditions.weather_condition || currentConditions.time_period}
          </h2>
          <div className="flex items-center text-sm text-text-secondary mt-2 space-x-3">
            {currentConditions.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1.5 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {currentConditions.location}
              </span>
            )}
            <span>•</span>
            <span className="min-w-20 text-right">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Detailed Stats Row */}
      <div className="flex items-center justify-between gap-4 pl-1">
        {currentConditions.humidity && (
          <div className="flex items-center space-x-3   flex-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-medium">Humidity</span>
              <span className="text-sm font-bold text-text-primary">
                {Math.round(currentConditions.humidity)}%
              </span>
            </div>
          </div>
        )}

        {currentConditions.sunrise && (
          <div className="flex items-center space-x-3  flex-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Icon name="dawn" size={16} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-medium">Sunrise</span>
              <span className="text-sm font-bold text-text-primary">
                {formatTime(currentConditions.sunrise)}
              </span>
            </div>
          </div>
        )}

        {currentConditions.sunset && (
          <div className="flex items-center space-x-3  flex-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Icon name="evening" size={16} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-medium">Sunset</span>
              <span className="text-sm font-bold text-text-primary">
                {formatTime(currentConditions.sunset)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
