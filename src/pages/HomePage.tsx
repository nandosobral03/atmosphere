import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { StatusDisplay } from "../components/StatusDisplay";
import { useCurrentConditions } from "../hooks/useCurrentConditions";
import { useCollectionInitializer } from "../hooks/useCollectionInitializer";
import { useActiveCollectionSettings } from "../hooks/useActiveCollectionSettings";
import { getCurrentActiveWallpaper } from "../utils/wallpaper";
import { useCollectionStore } from "../store/collectionStore";
import { useNavigationStore } from "../store/navigationStore";
import { WALLPAPER_CATEGORIES } from "../types";

interface SchedulerStatus {
  enabled: boolean;
  interval_minutes: number;
  is_running: boolean;
  last_applied_path: string | null;
}

export function HomePage() {
  // Initialize collections if none exist
  useCollectionInitializer();

  const { currentConditions } = useCurrentConditions();
  const settings = useActiveCollectionSettings();
  const { getActiveCollection } = useCollectionStore();
  const { setCurrentPage } = useNavigationStore();
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const activeWallpaper = getCurrentActiveWallpaper(currentConditions, settings);
  const activeCollection = getActiveCollection();

  const fetchSchedulerStatus = async () => {
    try {
      const result = (await invoke("get_scheduler_status")) as SchedulerStatus;
      setSchedulerStatus(result);
    } catch (error) {
      console.error("Failed to fetch scheduler status:", error);
    }
  };

  const toggleScheduler = async () => {
    if (!schedulerStatus) return;

    setIsToggling(true);
    try {
      if (schedulerStatus.enabled && schedulerStatus.is_running) {
        await invoke("stop_wallpaper_scheduler");
      } else {
        await invoke("start_wallpaper_scheduler");
      }
      await fetchSchedulerStatus();
    } catch (error) {
      console.error("Failed to toggle scheduler:", error);
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => {
    fetchSchedulerStatus();
    const interval = setInterval(fetchSchedulerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Status Display */}
      <StatusDisplay currentConditions={currentConditions} />

      {/* Wallpaper Status & Priority */}
      {currentConditions ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Wallpaper Status</h3>
            <div className="flex items-center space-x-3">
              {activeCollection && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {activeCollection.name}
                </div>
              )}
              <button
                onClick={toggleScheduler}
                disabled={isToggling || !schedulerStatus}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                  schedulerStatus?.enabled && schedulerStatus?.is_running 
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                } disabled:bg-gray-400`}
              >
                Auto: {schedulerStatus?.enabled && schedulerStatus?.is_running ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              // Get all enabled settings that match current conditions AND have images
              const potentialWallpapers = currentConditions.active_categories
                .map((category) => ({
                  category,
                  setting: settings[category],
                  info: WALLPAPER_CATEGORIES.find((c) => c.key === category),
                }))
                .filter(({ setting }) => setting?.enabled && setting?.imagePath)
                .sort((a, b) => b.setting.priority - a.setting.priority); // Highest priority first

              if (potentialWallpapers.length === 0) {
                return <div className="text-gray-500 dark:text-gray-400 text-sm">No enabled wallpapers for current conditions</div>;
              }

              // Since we only show wallpapers with images, the first (highest priority) one is active
              return potentialWallpapers.map(({ category, setting, info }, index) => {
                const isActive = index === 0; // First one is always active since they all have images
                const hasImage = true; // All items in this list have images due to filtering

                return (
                  <div
                    key={category}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isActive
                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
                        : hasImage
                        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {/* Thumbnail for active wallpaper */}
                    {isActive && hasImage && (
                      <div className="w-16 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        <img
                          src={convertFileSrc(setting.imagePath!)}
                          alt="Active wallpaper"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-xs">No Preview</div>
                      </div>
                    )}
                    
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? "bg-green-500" : hasImage ? "bg-blue-500" : "bg-gray-400"}`} />
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${isActive ? "text-green-900 dark:text-green-100" : "text-gray-900 dark:text-white"}`}>
                          {info?.label || category}
                        </div>
                        {isActive && <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">ACTIVE</span>}
                        {!isActive && <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">READY</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Priority: {setting.priority} • #{index + 1}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        /* Skeleton Loader for Wallpaper Status */
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to push navigation to bottom */}
      <div className="flex-1" />

      {/* Bento Box Navigation */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setCurrentPage("collections")} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
          <div className="text-center">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Collections</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage wallpaper collections</p>
          </div>
        </button>

        <button onClick={() => setCurrentPage("settings")} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
          <div className="text-center">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure app preferences</p>
          </div>
        </button>
      </div>
    </div>
  );
}
