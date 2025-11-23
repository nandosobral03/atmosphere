import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { StatusDisplay } from "../components/StatusDisplay";
import { Badge, StatusDot } from "../components/ui";
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
      {/* Status Display - Redesigned to be cleaner/header-like */}
      <StatusDisplay currentConditions={currentConditions} />

      {/* Wallpaper Status - Minimal List Layout */}
      <div className="flex flex-col min-h-0 mb-6">
        <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
          <h3 className="font-semibold text-text-primary text-base">Active Wallpaper</h3>
          <div className="flex items-center space-x-2">
            {activeCollection && (
              <span className="text-xs font-medium text-text-secondary bg-surface px-2 py-1 rounded-md border border-border">
                {activeCollection.name}
              </span>
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

        {currentConditions ? (
          <div className="flex-1 min-h-0 flex flex-col space-y-3">
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
                  <div className="text-center py-8 bg-surface/30 rounded-xl border border-dashed border-border">
                    <p className="text-text-secondary text-sm">
                      No enabled wallpapers for current conditions
                    </p>
                    <button
                      onClick={() => setCurrentPage("collections")}
                      className="mt-2 text-primary text-sm font-medium hover:underline"
                    >
                      Configure Collection
                    </button>
                  </div>
                );
              }

              // Since we only show wallpapers with images, the first (highest priority) one is active
              return potentialWallpapers.map(({ category, setting, info }, index) => {
                const isActive = index === 0; // First one is always active since they all have images

                // Only show the active one prominently, others in a smaller list if needed
                // For now, let's just show the active one as a "Hero" item and others as compact items

                if (isActive) {
                  return (
                    <div
                      key={category}
                      className="relative rounded-xl overflow-hidden bg-card border border-border shadow-sm flex-shrink-0"
                    >
                      <div className="aspect-video w-full relative bg-surface overflow-hidden">
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
                        <div className="hidden w-full h-full flex items-center justify-center text-text-tertiary text-sm">
                          No Preview Available
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <StatusDot variant="success" size="md" />
                                <span className="text-white font-semibold text-lg shadow-black/20 drop-shadow-sm">
                                  {info?.label || category}
                                </span>
                              </div>
                              <p className="text-white/80 text-xs font-medium">
                                Priority: {setting.priority} • Active Source
                              </p>
                            </div>
                            <Badge
                              variant="success"
                              size="sm"
                              className="bg-emerald-500/80 text-white border-emerald-400/50 backdrop-blur-md shadow-sm"
                            >
                              ACTIVE
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Secondary items (next in queue)
                return (
                  <div
                    key={category}
                    className="flex items-center p-3 bg-card/50 rounded-lg border border-border/50 hover:bg-card transition-colors flex-shrink-0"
                  >
                    <div className="w-12 h-8 rounded overflow-hidden bg-surface flex-shrink-0 mr-3">
                      <img
                        src={convertFileSrc(setting.imagePath!)}
                        alt="Next wallpaper"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-secondary">
                          {info?.label || category}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          Priority: {setting.priority}
                        </span>
                      </div>
                    </div>
                    <Badge variant="info" size="xs" className="ml-2 opacity-70">
                      READY
                    </Badge>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          /* Skeleton Loader */
          <div className="rounded-xl overflow-hidden bg-surface border border-border animate-pulse flex-shrink-0">
            <div className="aspect-video w-full bg-border/30"></div>
            <div className="p-4 space-y-2">
              <div className="h-6 bg-border/30 rounded w-1/3"></div>
              <div className="h-4 bg-border/30 rounded w-1/4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Grid - Simplified */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0 mt-auto">
        <button
          onClick={() => setCurrentPage("collections")}
          className="group flex items-center p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
            <Icon name="gallery" size={20} />
          </div>
          <div className="ml-3 text-left">
            <h3 className="font-semibold text-text-primary text-sm">Collections</h3>
            <p className="text-text-secondary text-[10px]">Manage wallpapers</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentPage("settings")}
          className="group flex items-center p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
            <Icon name="settings" size={20} />
          </div>
          <div className="ml-3 text-left">
            <h3 className="font-semibold text-text-primary text-sm">Settings</h3>
            <p className="text-text-secondary text-[10px]">App preferences</p>
          </div>
        </button>
      </div>
    </div>
  );
}
