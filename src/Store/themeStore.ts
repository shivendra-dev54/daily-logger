import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'ocean-light' | 'ocean-dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'ocean-dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'ocean-light' ? 'ocean-dark' : 'ocean-light',
        })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Ocean Light Theme
export const oceanLightTheme = {
  name: 'Ocean Light',
  colors: {
    // Background colors
    bg: {
      primary: '#F0F9FF', // sky-50
      secondary: '#E0F2FE', // sky-100
      tertiary: '#FFFFFF',
      card: '#FFFFFF',
      elevated: '#FAFBFC',
    },
    // Text colors
    text: {
      primary: '#0C4A6E', // sky-900
      secondary: '#075985', // sky-800
      tertiary: '#0369A1', // sky-700
      muted: '#0284C7', // sky-600
      accent: '#0EA5E9', // sky-500
    },
    // Accent colors (ocean theme)
    accent: {
      primary: '#0EA5E9', // sky-500
      secondary: '#38BDF8', // sky-400
      hover: '#0284C7', // sky-600
      light: '#BAE6FD', // sky-200
    },
    // Border colors
    border: {
      primary: '#BAE6FD', // sky-200
      secondary: '#7DD3FC', // sky-300
      focus: '#0EA5E9', // sky-500
    },
    // Status colors
    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
  },
};

export const oceanDarkTheme = {
  name: 'Ocean Dark',
  colors: {
    bg: {
      primary: '#0A1929',
      secondary: '#0F2942',
      tertiary: '#1A3A52',
      card: '#1E4A67',
      elevated: '#234E6B',
    },
    // Text colors
    text: {
      primary: '#E0F2FE',
      secondary: '#BAE6FD',
      tertiary: '#7DD3FC',
      muted: '#38BDF8',
      accent: '#0EA5E9',
    },
    // Accent colors (ocean glow)
    accent: {
      primary: '#06B6D4',
      secondary: '#22D3EE',
      hover: '#0891B2',
      light: '#164E63',
    },
    // Border colors
    border: {
      primary: '#1E3A52',
      secondary: '#2A4A62',
      focus: '#06B6D4',
    },
    // Status colors
    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
  },
};

// Helper to get current theme colors
export const getThemeColors = (theme: Theme) => {
  return theme === 'ocean-light' ? oceanLightTheme : oceanDarkTheme;
};