import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IconName } from "../components/ui/Icon";

export type PageType = "home" | "collections" | "settings";

interface NavigationStore {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;

  pages: {
    [K in PageType]: {
      title: string;
      icon: IconName;
      description: string;
    };
  };
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    set => ({
      currentPage: "home",

      setCurrentPage: (page: PageType) => set({ currentPage: page }),

      pages: {
        home: {
          title: "Home",
          icon: "home",
          description: "Current status and overview",
        },
        collections: {
          title: "Collections",
          icon: "gallery",
          description: "Wallpaper categories and settings",
        },
        settings: {
          title: "Settings",
          icon: "settings",
          description: "App preferences and configuration",
        },
      },
    }),
    {
      name: "navigation-store",
      version: 1,
    }
  )
);
