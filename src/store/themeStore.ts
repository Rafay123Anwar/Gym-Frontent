import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: localStorage.getItem('theme') !== 'light', // Default to dark
  toggleTheme: () => set((state) => {
    const nextTheme = !state.isDarkMode;
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    if (nextTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: nextTheme };
  }),
  setTheme: (isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: isDark });
  },
}));
