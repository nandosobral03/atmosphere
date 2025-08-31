import { CurrentConditions, WallpaperSettings } from "../types";

export const getCurrentActiveWallpaper = (
  currentConditions: CurrentConditions | null, 
  settings: WallpaperSettings
) => {
  if (!currentConditions || !settings) return null;
  
  // Get all enabled settings with images that match current conditions
  const activeSettings = currentConditions.active_categories
    .map(category => ({ category, setting: settings[category] }))
    .filter(({ setting }) => setting?.enabled && setting.imagePath);
  
  // If no matching settings, return null
  if (activeSettings.length === 0) return null;
  
  // Sort by priority (highest first) and return the top one
  const sortedByPriority = activeSettings.sort((a, b) => b.setting.priority - a.setting.priority);
  return sortedByPriority[0];
};