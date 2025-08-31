import { useCollectionStore } from '../store/collectionStore';
import { WallpaperSettings } from '../types';

export const useActiveCollectionSettings = (): WallpaperSettings => {
  const { getActiveCollection } = useCollectionStore();
  const activeCollection = getActiveCollection();
  
  // Return the settings from the active collection, or empty object if none
  return activeCollection?.settings || {};
};