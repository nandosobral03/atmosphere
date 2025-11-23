import { create } from "zustand";
import { WallpaperSetting, WallpaperCategory } from "../types";
import { useCollectionStore } from "./collectionStore";
import { invoke } from "@tauri-apps/api/core";

interface WallpaperStore {
  updateSetting: (category: WallpaperCategory, updates: Partial<WallpaperSetting>) => Promise<void>;
  getSortedSettings: () => WallpaperSetting[];
  getActiveWallpaper: () => WallpaperSetting | null;
}

export const useWallpaperStore = create<WallpaperStore>()((_set, get) => ({
  updateSetting: async (category, updates) => {
    const { getActiveCollection, updateCollection } = useCollectionStore.getState();
    const activeCollection = getActiveCollection();

    if (!activeCollection) return;

    const updatedSettings = {
      ...activeCollection.settings,
      [category]: {
        ...activeCollection.settings[category],
        ...updates,
        ...(category === "default"
          ? {
              priority: 0,
              enabled: true,
            }
          : {}),
      },
    };

    updateCollection(activeCollection.id, { settings: updatedSettings });

    // Force scheduler to run immediately to reflect changes
    try {
      await invoke("start_wallpaper_scheduler", { intervalMinutes: null });
    } catch (error) {
      console.error("Failed to trigger scheduler update:", error);
    }
  },

  getSortedSettings: () => {
    const { getActiveCollection } = useCollectionStore.getState();
    const activeCollection = getActiveCollection();

    if (!activeCollection) return [];

    return Object.values(activeCollection.settings)
      .filter(setting => setting.enabled)
      .sort((a, b) => b.priority - a.priority);
  },

  getActiveWallpaper: () => {
    const sortedSettings = get().getSortedSettings();
    return sortedSettings.find(setting => setting.imagePath !== null) || null;
  },
}));
