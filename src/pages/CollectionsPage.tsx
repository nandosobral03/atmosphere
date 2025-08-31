import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { WallpaperCard } from "../components/WallpaperCard";
import { CollectionSelector } from "../components/CollectionSelector";
import { useCurrentConditions } from "../hooks/useCurrentConditions";
import { useTimePeriods } from "../hooks/useTimePeriods";
import { useCollectionInitializer } from "../hooks/useCollectionInitializer";
import { useActiveCollectionSettings } from "../hooks/useActiveCollectionSettings";
import { useWallpaperStore } from "../store/wallpaperStore";
import { useCollectionStore } from "../store/collectionStore";
import { useNavigationStore } from "../store/navigationStore";
import { WALLPAPER_CATEGORIES, WallpaperCategory } from "../types";
import { getCurrentActiveWallpaper } from "../utils/wallpaper";

export function CollectionsPage() {
  // Initialize collections if none exist
  useCollectionInitializer();

  const { updateSetting } = useWallpaperStore();
  const settings = useActiveCollectionSettings();
  const { getActiveCollection, validateCollection } = useCollectionStore();
  const { setCurrentPage } = useNavigationStore();
  const { currentConditions } = useCurrentConditions();
  const { timePeriods } = useTimePeriods();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'weather' | 'time' | 'default'>('weather');
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-dismiss success messages after 4 seconds
  const setMessageWithAutoDismiss = (msg: string) => {
    setMessage(msg);

    // Clear existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    // Auto-dismiss success messages (not error messages)
    if (msg && !msg.includes("Error")) {
      messageTimeoutRef.current = setTimeout(() => {
        setMessage("");
      }, 4000);
    }
  };

  const handleFileSelect = async (category: WallpaperCategory) => {
    try {
      const filePath = await open({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
          },
        ],
      });

      if (filePath) {
        setMessageWithAutoDismiss(`Copying ${category} wallpaper...`);

        // Copy the image to app data directory
        const copiedPath = await invoke("copy_wallpaper_image", {
          sourcePath: filePath,
          category: category,
        });

        // Update setting with the copied path
        updateSetting(category, { imagePath: copiedPath as string });
        setMessageWithAutoDismiss(`${category} wallpaper updated!`);
      }
    } catch (error) {
      setMessage(`Error selecting file: ${error}`);
    }
  };

  const handleSaveConfiguration = async () => {
    const activeCollection = getActiveCollection();

    if (!activeCollection) {
      setMessage("No active collection selected");
      return;
    }

    // Validate collection before saving
    const validation = validateCollection(activeCollection);
    if (!validation.isValid) {
      setMessage(`Cannot save: ${validation.error}`);
      return;
    }

    const activeWallpaper = getCurrentActiveWallpaper(currentConditions, settings);

    if (!activeWallpaper?.setting?.imagePath) {
      setMessage("No wallpaper configured for current conditions");
      return;
    }

    setIsLoading(true);
    setMessageWithAutoDismiss("Applying wallpaper...");

    try {
      const result = await invoke("set_wallpaper", { path: activeWallpaper.setting.imagePath });
      setMessageWithAutoDismiss(`Configuration saved and wallpaper applied from "${activeCollection.name}"!`);
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: WallpaperCategory) => {
    const currentSetting = settings[category];
    updateSetting(category, { enabled: !currentSetting.enabled });
  };

  const updatePriority = (category: WallpaperCategory, priority: number) => {
    updateSetting(category, { priority });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const activeCollection = getActiveCollection();
  const hasSettings = Object.keys(settings).length > 0;

  // Organize categories by type
  const weatherCategories = WALLPAPER_CATEGORIES.filter(cat => 
    ['thunderstorm', 'rain', 'snow', 'fog', 'cloudy', 'sunny'].includes(cat.key)
  );
  
  const timeCategories = WALLPAPER_CATEGORIES.filter(cat => 
    ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night', 'late_night'].includes(cat.key)
  ).sort((a, b) => {
    // Define chronological order starting from dawn
    const timeOrder = ['dawn', 'morning', 'midday', 'afternoon', 'dusk', 'evening', 'night', 'late_night'];
    return timeOrder.indexOf(a.key) - timeOrder.indexOf(b.key);
  });
  
  const defaultCategories = WALLPAPER_CATEGORIES.filter(cat => 
    cat.key === 'default'
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => setCurrentPage("home")} className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Back to Home">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collections</span>
      </div>

      {/* Apply Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleSaveConfiguration}
          disabled={isLoading || !hasSettings || !activeCollection}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors w-full"
        >
          {isLoading ? "Saving..." : activeCollection ? `Apply Wallpaper from "${activeCollection.name}"` : "No Collection Selected"}
        </button>
      </div>

      {/* Collection Selector */}
      <CollectionSelector />

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            message.includes("Error")
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
          }`}
        >
          <div className="break-words text-center">{message}</div>
        </div>
      )}

      {/* Wallpaper Cards with Tabs */}
      {hasSettings && activeCollection ? (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Editing: {activeCollection.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure wallpapers for different weather conditions and times of day</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'weather'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🌦️ Weather ({weatherCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-600 ${
                activeTab === 'time'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🕐 Time ({timeCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('default')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-600 ${
                activeTab === 'default'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🔧 Default ({defaultCategories.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'weather' && weatherCategories.map((categoryInfo) => {
              const setting = settings[categoryInfo.key];
              if (!setting) return null;

              return (
                <WallpaperCard
                  key={categoryInfo.key}
                  categoryInfo={categoryInfo}
                  setting={setting}
                  currentConditions={currentConditions}
                  timePeriods={timePeriods}
                  allSettings={settings}
                  onToggleCategory={toggleCategory}
                  onUpdatePriority={updatePriority}
                  onFileSelect={handleFileSelect}
                />
              );
            })}

            {activeTab === 'time' && timeCategories.map((categoryInfo) => {
              const setting = settings[categoryInfo.key];
              if (!setting) return null;

              return (
                <WallpaperCard
                  key={categoryInfo.key}
                  categoryInfo={categoryInfo}
                  setting={setting}
                  currentConditions={currentConditions}
                  timePeriods={timePeriods}
                  allSettings={settings}
                  onToggleCategory={toggleCategory}
                  onUpdatePriority={updatePriority}
                  onFileSelect={handleFileSelect}
                />
              );
            })}

            {activeTab === 'default' && defaultCategories.map((categoryInfo) => {
              const setting = settings[categoryInfo.key];
              if (!setting) return null;

              return (
                <WallpaperCard
                  key={categoryInfo.key}
                  categoryInfo={categoryInfo}
                  setting={setting}
                  currentConditions={currentConditions}
                  timePeriods={timePeriods}
                  allSettings={settings}
                  onToggleCategory={toggleCategory}
                  onUpdatePriority={updatePriority}
                  onFileSelect={handleFileSelect}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">{!activeCollection ? "Select or create a collection to start configuring wallpapers." : "Loading collection settings..."}</div>
      )}
    </div>
  );
}
