import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WallpaperCollection, CollectionStore, WALLPAPER_CATEGORIES } from '../types';

interface CollectionStoreActions {
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Omit<WallpaperCollection, 'id'>>) => void;
  setActiveCollection: (id: string) => void;
  getActiveCollection: () => WallpaperCollection | null;
  validateCollection: (collection: WallpaperCollection) => { isValid: boolean; error?: string };
}

const createDefaultCollection = (name: string, id: string): WallpaperCollection => {
  const defaultSettings = Object.fromEntries(
    WALLPAPER_CATEGORIES.map(category => [
      category.key,
      {
        category: category.key,
        imagePath: null,
        priority: category.defaultPriority,
        enabled: true,
      }
    ])
  );

  return {
    id,
    name,
    settings: defaultSettings,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
};

export const useCollectionStore = create<CollectionStore & CollectionStoreActions>()(
  persist(
    (set, get) => ({
      collections: {},
      activeCollectionId: null,

      createCollection: (name: string) => {
        const id = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCollection = createDefaultCollection(name, id);
        
        set((state) => ({
          collections: {
            ...state.collections,
            [id]: newCollection,
          },
          activeCollectionId: state.activeCollectionId || id, // Set as active if no active collection
        }));
        
        return id;
      },

      deleteCollection: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...remainingCollections } = state.collections;
          const collectionIds = Object.keys(remainingCollections);
          
          return {
            collections: remainingCollections,
            activeCollectionId: state.activeCollectionId === id 
              ? (collectionIds.length > 0 ? collectionIds[0] : null)
              : state.activeCollectionId,
          };
        });
      },

      updateCollection: (id: string, updates: Partial<Omit<WallpaperCollection, 'id'>>) => {
        set((state) => {
          const collection = state.collections[id];
          if (!collection) return state;

          return {
            collections: {
              ...state.collections,
              [id]: {
                ...collection,
                ...updates,
                lastModified: new Date().toISOString(),
              },
            },
          };
        });
      },

      setActiveCollection: (id: string) => {
        set((state) => {
          if (!state.collections[id]) return state;
          return { activeCollectionId: id };
        });
      },

      getActiveCollection: () => {
        const state = get();
        return state.activeCollectionId ? state.collections[state.activeCollectionId] || null : null;
      },

      validateCollection: (collection: WallpaperCollection) => {
        // Check if name exists and is not empty
        if (!collection.name.trim()) {
          return { isValid: false, error: 'Collection name is required' };
        }

        // Check if at least the 'default' (fallback) wallpaper has an image
        const fallbackSetting = collection.settings['default'];
        if (!fallbackSetting?.imagePath) {
          return { isValid: false, error: 'A fallback image is required for the collection' };
        }

        return { isValid: true };
      },
    }),
    {
      name: 'wallpaper-collections',
      version: 1,
    }
  )
);