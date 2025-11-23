import {
  WallpaperCategory,
  WallpaperSetting,
  CurrentConditions,
  TimePeriodsResponse,
  WallpaperSettings,
} from "../types";
import { WALLPAPER_CATEGORIES } from "../types";
import { getCurrentActiveWallpaper } from "../utils/wallpaper";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Icon } from "./ui/Icon";

interface WallpaperCardProps {
  categoryInfo: (typeof WALLPAPER_CATEGORIES)[0];
  setting: WallpaperSetting;
  currentConditions: CurrentConditions | null;
  timePeriods: TimePeriodsResponse | null;
  allSettings: WallpaperSettings;
  onToggleCategory: (category: WallpaperCategory) => void;
  onUpdatePriority: (category: WallpaperCategory, priority: number) => void;
  onFileSelect: (category: WallpaperCategory) => void;
}

const TIME_BASED_CATEGORIES = [
  "dawn",
  "morning",
  "midday",
  "afternoon",
  "dusk",
  "evening",
  "night",
  "late_night",
];

// Map category keys to icon names
const getCategoryIcon = (categoryKey: string): string => {
  // Direct mappings for most categories
  const iconMap: Record<string, string> = {
    late_night: "late-night",
    partly_cloudy: "partly-cloudy",
  };

  // Use mapped icon if available, otherwise use the category key directly
  return iconMap[categoryKey] || categoryKey;
};

export function WallpaperCard({
  categoryInfo,
  setting,
  currentConditions,
  timePeriods,
  allSettings,
  onToggleCategory,
  onUpdatePriority,
  onFileSelect,
}: WallpaperCardProps) {
  // const isCurrentlyActive =
  //   currentConditions?.active_categories.includes(categoryInfo.key) || false;
  const activeWallpaper = getCurrentActiveWallpaper(currentConditions, allSettings);
  // Only show as active if it's the active wallpaper AND has an image
  const isActiveWallpaper = activeWallpaper?.category === categoryInfo.key && !!setting.imagePath;

  return (
    <div
      className={`border rounded-xl p-4 shadow-card transition-all ${
        isActiveWallpaper ? "bg-card border-primary" : "bg-card border-border"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Icon
              name={getCategoryIcon(categoryInfo.key) as any}
              size={20}
              className="text-text-primary"
            />
            <h3 className="text-lg font-semibold text-text-primary">{categoryInfo.label}</h3>
            {isActiveWallpaper && (
              <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">{categoryInfo.description}</p>
          {/* Display time range for time-based categories */}
          {timePeriods &&
            TIME_BASED_CATEGORIES.includes(categoryInfo.key) &&
            (() => {
              const periodDetail = timePeriods.periods.find(p => p.period === categoryInfo.key);
              return periodDetail ? (
                <p className="text-xs text-primary font-medium">
                  {periodDetail.start_time} - {periodDetail.end_time}
                </p>
              ) : null;
            })()}
        </div>
        <div className="ml-3">
          {categoryInfo.key === "default" ? null : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={setting.enabled}
                onChange={() => onToggleCategory(categoryInfo.key)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors ${
                  setting.enabled ? "bg-primary" : "bg-border"
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${
                    setting.enabled ? "translate-x-5" : "translate-x-1"
                  } mt-1`}
                />
              </div>
            </label>
          )}
        </div>
      </div>

      {(setting.enabled || categoryInfo.key === "default") && (
        <div className="space-y-3">
          {categoryInfo.key !== "default" && (
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Priority: {setting.priority}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={setting.priority}
                onChange={e => onUpdatePriority(categoryInfo.key, parseInt(e.target.value))}
                className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer slider"
              />
            </div>
          )}

          <div>
            {setting.imagePath ? (
              <div className="space-y-2">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface">
                  <img
                    src={convertFileSrc(setting.imagePath)}
                    alt={`${categoryInfo.label} wallpaper`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center text-text-secondary text-sm">
                    Preview unavailable
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-success-light border border-success rounded-lg">
                  <span className="text-success-hover font-medium text-xs flex items-center gap-1">
                    <Icon name="check" size={12} className="text-success-hover" />
                    Image configured
                  </span>
                  <button
                    onClick={() => onFileSelect(categoryInfo.key)}
                    className="bg-surface hover:bg-border text-text-primary text-xs px-2 py-1 rounded-lg transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onFileSelect(categoryInfo.key)}
                className="w-full bg-primary hover:bg-primary-hover text-text-inverse font-medium py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Select Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
