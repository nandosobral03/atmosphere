import { useMemo } from "react";
import { CurrentConditions, WallpaperSettings } from "../types";
import { WALLPAPER_CATEGORIES } from "../types";

export const useWallpaperPriority = (currentConditions: CurrentConditions | null, settings: WallpaperSettings) => {
  const potentialWallpapers = useMemo(() => {
    if (!currentConditions) return [];

    return currentConditions.active_categories
      .map((category) => ({
        category,
        setting: settings[category],
        info: WALLPAPER_CATEGORIES.find((c) => c.key === category),
      }))
      .filter(({ setting }) => setting?.enabled && setting?.imagePath)
      .sort((a, b) => b.setting.priority - a.setting.priority);
  }, [currentConditions, settings]);

  return { potentialWallpapers };
};