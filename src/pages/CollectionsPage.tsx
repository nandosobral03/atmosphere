import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { WallpaperCard } from "../components/WallpaperCard";
import { CollectionSelector } from "../components/CollectionSelector";
import { Alert, TabBar, IconButton } from "../components/ui";
import { Icon } from "../components/ui/Icon";
import { useCurrentConditions } from "../hooks/useCurrentConditions";
import { useTimePeriods } from "../hooks/useTimePeriods";
import { useCollectionInitializer } from "../hooks/useCollectionInitializer";
import { useActiveCollectionSettings } from "../hooks/useActiveCollectionSettings";
import { useWallpaperStore } from "../store/wallpaperStore";
import { useCollectionStore } from "../store/collectionStore";
import { useNavigationStore } from "../store/navigationStore";
import { WALLPAPER_CATEGORIES, WallpaperCategory } from "../types";

export function CollectionsPage() {
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

  const setMessageWithAutoDismiss = (msg: string) => {
    setMessage(msg);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

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

        const activeCollection = getActiveCollection();
        if (!activeCollection) {
          setMessage("No active collection selected");
          return;
        }

        const copiedPath = await invoke("copy_wallpaper_image", {
          sourcePath: filePath,
          category: category,
          collectionId: activeCollection.id,
        });

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

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const activeCollection = getActiveCollection();
  const hasSettings = Object.keys(settings).length > 0;

  const weatherCategories = WALLPAPER_CATEGORIES.filter(cat =>
    ["thunderstorm", "rain", "snow", "fog", "cloudy", "sunny"].includes(cat.key)
  );

  const timeCategories = WALLPAPER_CATEGORIES.filter(cat =>
    ["dawn", "morning", "midday", "afternoon", "dusk", "evening", "night", "late_night"].includes(
      cat.key
    )
  ).sort((a, b) => {
    const timeOrder = [
      "dawn",
      "morning",
      "midday",
      "afternoon",
      "dusk",
      "evening",
      "night",
      "late_night",
    ];
    return timeOrder.indexOf(a.key) - timeOrder.indexOf(b.key);
  });

  const defaultCategories = WALLPAPER_CATEGORIES.filter(cat => cat.key === "default");

  return (
    <div className="p-4 space-y-6 bg-bg-primary backdrop-blur-sm h-screen overflow-y-scroll">
      <div className="flex items-center space-x-4 mb-6">
        <IconButton
          onClick={() => setCurrentPage("home")}
          variant="ghost"
          title="Back to Home"
          className="hover:bg-white/10 hover:text-primary transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </IconButton>
        <h1 className="text-2xl font-bold text-text-primary">Collections</h1>
      </div>

      <CollectionSelector />

      {message && (
        <div className="animate-in slide-in-from-top duration-300">
          <Alert
            variant={message.includes("Error") ? "danger" : "success"}
            dismissible={true}
            onDismiss={() => setMessage("")}
            className="shadow-sm border-l-4"
          >
            {message}
          </Alert>
        </div>
      )}

      {hasSettings && activeCollection ? (
        <div className="space-y-6">
          <div className="transition-all duration-200">
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
              onTabChange={tabId => setActiveTab(tabId as "weather" | "time" | "default")}
            />
          </div>

          <div className="space-y-3 transition-all duration-300 ease-in-out pb-10">
            {activeTab === "weather" &&
              weatherCategories.map(categoryInfo => {
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
              timeCategories.map(categoryInfo => {
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
              defaultCategories.map(categoryInfo => {
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
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-lg bg-primary/10">
              {!activeCollection ? (
                <Icon name="palette" size={48} className="text-primary/60" />
              ) : (
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-text-primary">
                {!activeCollection ? "No Collection Selected" : "Loading Collection"}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
                {!activeCollection
                  ? "Select or create a collection above to start configuring wallpapers."
                  : "Loading collection settings..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
