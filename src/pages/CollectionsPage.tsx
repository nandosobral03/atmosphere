import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { WallpaperCard } from "../components/WallpaperCard";
import { CollectionSelector } from "../components/CollectionSelector";
import { Button, Card, Alert, TabBar, IconButton } from "../components/ui";
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
  const { getActiveCollection } = useCollectionStore();
  const { setCurrentPage } = useNavigationStore();
  const { currentConditions } = useCurrentConditions();
  const { timePeriods } = useTimePeriods();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"weather" | "time" | "default">("weather");
  const messageTimeoutRef = useRef<any>();

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
  const weatherCategories = WALLPAPER_CATEGORIES.filter((cat) => ["thunderstorm", "rain", "snow", "fog", "cloudy", "sunny"].includes(cat.key));

  const timeCategories = WALLPAPER_CATEGORIES.filter((cat) => ["dawn", "morning", "midday", "afternoon", "dusk", "evening", "night", "late_night"].includes(cat.key)).sort((a, b) => {
    // Define chronological order starting from dawn
    const timeOrder = ["dawn", "morning", "midday", "afternoon", "dusk", "evening", "night", "late_night"];
    return timeOrder.indexOf(a.key) - timeOrder.indexOf(b.key);
  });

  const defaultCategories = WALLPAPER_CATEGORIES.filter((cat) => cat.key === "default");

  return (
    <div className="p-4 space-y-4 bg-bg-primary backdrop-blur-sm min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-3 mb-4">
        <IconButton onClick={() => setCurrentPage("home")} variant="ghost" title="Back to Home">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </IconButton>
        <span className="text-sm font-medium text-text-primary">Collections</span>
      </div>

      {/* Collection Selector */}
      <CollectionSelector />

      {/* Status Message */}
      {message && (
        <Alert variant={message.includes("Error") ? "danger" : "success"} dismissible={true} onDismiss={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Wallpaper Cards with Tabs */}
      {hasSettings && activeCollection ? (
        <div className="space-y-4">
          <Card variant="info" padding="sm">
            <h3 className="text-sm font-medium text-text-primary mb-1">Editing: {activeCollection.name}</h3>
            <p className="text-xs text-text-secondary">Configure wallpapers for different weather conditions and times of day</p>
          </Card>

          {/* Tab Navigation */}
          <TabBar
            variant="bordered"
            tabs={[
              {
                id: "weather",
                label: "Weather",
                icon: "weather",
                count: weatherCategories.length,
              },
              {
                id: "time",
                label: "Time",
                icon: "time",
                count: timeCategories.length,
              },
              {
                id: "default",
                label: "Default",
                icon: "tools",
                count: defaultCategories.length,
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as "weather" | "time" | "default")}
          />

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === "weather" &&
              weatherCategories.map((categoryInfo) => {
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

            {activeTab === "time" &&
              timeCategories.map((categoryInfo) => {
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

            {activeTab === "default" &&
              defaultCategories.map((categoryInfo) => {
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
        <div className="text-center text-text-secondary py-8">{!activeCollection ? "Select or create a collection to start configuring wallpapers." : "Loading collection settings..."}</div>
      )}
    </div>
  );
}
