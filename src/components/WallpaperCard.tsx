import { WallpaperCategory, WallpaperSetting, CurrentConditions, TimePeriodsResponse, WallpaperSettings } from "../types";
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

const TIME_BASED_CATEGORIES = ["dawn", "morning", "midday", "afternoon", "dusk", "evening", "night", "late_night"];

export function WallpaperCard({ categoryInfo, setting, currentConditions, timePeriods, allSettings, onToggleCategory, onUpdatePriority, onFileSelect }: WallpaperCardProps) {
  const isCurrentlyActive = currentConditions?.active_categories.includes(categoryInfo.key) || false;
  const activeWallpaper = getCurrentActiveWallpaper(currentConditions, allSettings);
  // Only show as active if it's the active wallpaper AND has an image
  const isActiveWallpaper = activeWallpaper?.category === categoryInfo.key && !!setting.imagePath;
  const isCurrentButNotActive = isCurrentlyActive && !isActiveWallpaper && setting.enabled && !!setting.imagePath;

  return (
    <div
      className={`border rounded-lg p-4 shadow-sm transition-all ${
        isActiveWallpaper
          ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-600"
          : isCurrentButNotActive
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{categoryInfo.label}</h3>
            {isActiveWallpaper && <span className="text-xs bg-cyan-100 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full">ACTIVE</span>}
            {isCurrentButNotActive && <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">CURRENT</span>}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{categoryInfo.description}</p>
          {/* Display time range for time-based categories */}
          {timePeriods &&
            TIME_BASED_CATEGORIES.includes(categoryInfo.key) &&
            (() => {
              const periodDetail = timePeriods.periods.find((p) => p.period === categoryInfo.key);
              return periodDetail ? (
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  {periodDetail.start_time} - {periodDetail.end_time}
                </p>
              ) : null;
            })()}
        </div>
        <div className="ml-3">
          {categoryInfo.key === "default" ? null : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={setting.enabled} onChange={() => onToggleCategory(categoryInfo.key)} className="sr-only" />
              <div className={`w-9 h-5 rounded-full transition-colors ${setting.enabled ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${setting.enabled ? "translate-x-5" : "translate-x-1"} mt-1`} />
              </div>
            </label>
          )}
        </div>
      </div>

      {(setting.enabled || categoryInfo.key === "default") && (
        <div className="space-y-3">
          {categoryInfo.key !== "default" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Priority: {setting.priority}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={setting.priority}
                onChange={(e) => onUpdatePriority(categoryInfo.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          <div>
            {setting.imagePath ? (
              <div className="space-y-2">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                  <img 
                    src={convertFileSrc(setting.imagePath)}
                    alt={`${categoryInfo.label} wallpaper`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Preview unavailable
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded">
                  <span className="text-cyan-700 dark:text-cyan-300 font-medium text-xs flex items-center gap-1">
                    <Icon name="check" size={12} className="text-cyan-700 dark:text-cyan-300" />
                    Image configured
                  </span>
                  <button onClick={() => onFileSelect(categoryInfo.key)} className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded transition-colors">
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => onFileSelect(categoryInfo.key)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded text-sm transition-colors">
                Select Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
