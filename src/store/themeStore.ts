import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'wallpaper-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on app load
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);