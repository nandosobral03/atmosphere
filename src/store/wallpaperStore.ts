import { create } from 'zustand';
import { WallpaperSetting, WallpaperCategory } from '../types';
import { useCollectionStore } from './collectionStore';

interface WallpaperStore {
  updateSetting: (category: WallpaperCategory, updates: Partial<WallpaperSetting>) => void;
  getSortedSettings: () => WallpaperSetting[];
  getActiveWallpaper: () => WallpaperSetting | null;
}

export const useWallpaperStore = create<WallpaperStore>()((set, get) => ({
  updateSetting: (category, updates) => {
    const { getActiveCollection, updateCollection } = useCollectionStore.getState();
    const activeCollection = getActiveCollection();
    
    if (!activeCollection) return;

    const updatedSettings = {
      ...activeCollection.settings,
      [category]: {
        ...activeCollection.settings[category],
        ...updates,
        // Always force fallback to priority 0 and always enabled
        ...(category === 'default' ? { 
          priority: 0,
          enabled: true  // Fallback can never be disabled
        } : {})
      }
    };

    updateCollection(activeCollection.id, { settings: updatedSettings });
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
    // This will later include logic for checking time/weather conditions
    // For now, just return the highest priority setting with an image
    const sortedSettings = get().getSortedSettings();
    return sortedSettings.find(setting => setting.imagePath !== null) || null;
  }
}));