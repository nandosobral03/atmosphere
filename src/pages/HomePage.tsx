import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { StatusDisplay } from "../components/StatusDisplay";
import { Card, Badge, StatusDot } from "../components/ui";
import { useCurrentConditions } from "../hooks/useCurrentConditions";
import { useCollectionInitializer } from "../hooks/useCollectionInitializer";
import { useActiveCollectionSettings } from "../hooks/useActiveCollectionSettings";
import { useCollectionStore } from "../store/collectionStore";
import { Icon } from "../components/ui/Icon";
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
  const activeCollection = getActiveCollection();

  const fetchSchedulerStatus = async () => {
    try {
      const result = (await invoke("get_scheduler_status")) as SchedulerStatus;
      setSchedulerStatus(result);
    } catch (error) {
      console.error("Failed to fetch scheduler status:", error);
    }
  };

  useEffect(() => {
    fetchSchedulerStatus();
    const interval = setInterval(fetchSchedulerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-full flex flex-col bg-bg-primary backdrop-blur-sm min-h-screen">
      {/* Status Display */}
      <StatusDisplay currentConditions={currentConditions} />

      {/* Wallpaper Status & Priority */}
      {currentConditions ? (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Wallpaper Status</h3>
            <div className="flex items-center space-x-3">
              {activeCollection && (
                <div className="text-xs text-text-secondary">{activeCollection.name}</div>
              )}
              <Badge
                variant={
                  schedulerStatus?.enabled && schedulerStatus?.is_running ? "success" : "secondary"
                }
                size="sm"
              >
                Auto: {schedulerStatus?.enabled && schedulerStatus?.is_running ? "ON" : "OFF"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              // Get all enabled settings that match current conditions AND have images
              const potentialWallpapers = currentConditions.active_categories
                .map(category => ({
                  category,
                  setting: settings[category],
                  info: WALLPAPER_CATEGORIES.find(c => c.key === category),
                }))
                .filter(({ setting }) => setting?.enabled && setting?.imagePath)
                .sort((a, b) => b.setting.priority - a.setting.priority); // Highest priority first

              if (potentialWallpapers.length === 0) {
                return (
                  <div className="text-text-secondary text-sm">
                    No enabled wallpapers for current conditions
                  </div>
                );
              }

              // Since we only show wallpapers with images, the first (highest priority) one is active
              return potentialWallpapers.map(({ category, setting, info }, index) => {
                const isActive = index === 0; // First one is always active since they all have images
                const hasImage = true; // All items in this list have images due to filtering

                return (
                  <Card
                    key={category}
                    variant={isActive ? "success" : hasImage ? "info" : "default"}
                    padding="md"
                    className="flex items-center space-x-3"
                  >
                    {/* Thumbnail for active wallpaper */}
                    {isActive && hasImage && (
                      <div className="w-16 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                        <img
                          src={convertFileSrc(setting.imagePath!)}
                          alt="Active wallpaper"
                          className="w-full h-full object-cover"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Preview
                        </div>
                      </div>
                    )}

                    <StatusDot variant={isActive ? "success" : hasImage ? "info" : "inactive"} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`text-sm font-medium ${isActive ? "text-success" : "text-text-primary"}`}
                        >
                          {info?.label || category}
                        </div>
                        <Badge variant={isActive ? "success" : "info"} size="xs">
                          {isActive ? "ACTIVE" : "READY"}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Priority: {setting.priority} • #{index + 1}
                      </div>
                    </div>
                  </Card>
                );
              });
            })()}
          </div>
        </Card>
      ) : (
        /* Skeleton Loader for Wallpaper Status */
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-border rounded w-32 animate-pulse"></div>
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-border rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-border rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </Card>
      )}

      {/* Spacer to push navigation to bottom */}
      <div className="flex-1" />

      {/* Bento Box Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentPage("collections")}
          className="p-6 rounded-2xl border border-border bg-card backdrop-blur-sm transition-all duration-300 ease-out group hover:-translate-y-1 hover:scale-[1.02] shadow-card hover:shadow-card-hover active:scale-[0.98] transform-gpu focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
        >
          <div className="text-center">
            <div className="mb-4 group-hover:scale-110 transition-transform duration-200 flex justify-center">
              <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                <Icon name="gallery" size={32} className="text-primary" />
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-text-primary text-lg">Collections</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Manage wallpaper collections
            </p>
          </div>
        </button>

        <button
          onClick={() => setCurrentPage("settings")}
          className="p-6 rounded-2xl border border-border bg-card backdrop-blur-sm transition-all duration-300 ease-out group hover:-translate-y-1 hover:scale-[1.02] shadow-card hover:shadow-card-hover active:scale-[0.98] transform-gpu focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
        >
          <div className="text-center">
            <div className="mb-4 group-hover:scale-110 transition-transform duration-200 flex justify-center">
              <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
                <Icon name="settings" size={32} className="text-primary" />
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-text-primary text-lg">Settings</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Configure app preferences</p>
          </div>
        </button>
      </div>
    </div>
  );
}
