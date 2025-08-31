import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageType = 'home' | 'collections' | 'settings';

interface NavigationStore {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  
  // Page metadata
  pages: {
    [K in PageType]: {
      title: string;
      icon: string;
      description: string;
    };
  };
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      currentPage: 'home',
      
      setCurrentPage: (page: PageType) => set({ currentPage: page }),
      
      pages: {
        home: {
          title: 'Home',
          icon: '🏠',
          description: 'Current status and overview'
        },
        collections: {
          title: 'Collections',
          icon: '🖼️',
          description: 'Wallpaper categories and settings'
        },
        settings: {
          title: 'Settings',
          icon: '⚙️',
          description: 'App preferences and configuration'
        }
      }
    }),
    {
      name: 'navigation-store',
      version: 1
    }
  )
);