import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, lightTheme, darkTheme, ThemeMode } from '@/constants/theme';

interface ThemeState {
  themeMode: ThemeMode;
  theme: Theme;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  initialize: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

const getTheme = (mode: ThemeMode): Theme => {
  if (mode === 'system') {
    return getSystemTheme() === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      theme: getTheme('system'),

      setThemeMode: (mode: ThemeMode) => {
        set({
          themeMode: mode,
          theme: getTheme(mode),
        });
      },

      initialize: () => {
        const { themeMode } = get();
        set({ theme: getTheme(themeMode) });

        // Listen for system theme changes
        Appearance.addChangeListener(({ colorScheme }) => {
          const currentMode = get().themeMode;
          if (currentMode === 'system') {
            set({
              theme: colorScheme === 'dark' ? darkTheme : lightTheme,
            });
          }
        });
      },
    }),
    {
      name: 'kadur-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
);
