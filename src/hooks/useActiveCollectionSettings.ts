import { useCollectionStore } from '../store/collectionStore';
import { WallpaperSettings } from '../types';

export const useActiveCollectionSettings = (): WallpaperSettings => {
  const { collections, activeCollectionId } = useCollectionStore();
  const activeCollection = activeCollectionId ? collections[activeCollectionId] : null;

  // Return the settings from the active collection, or empty object if none
  return activeCollection?.settings || {};
};