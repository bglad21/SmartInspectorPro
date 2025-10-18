/**
 * Theme Context and Provider
 * 
 * Provides theme state management with React Context.
 * Supports light/dark/system modes with AsyncStorage persistence.
 * 
 * @module theme/ThemeContext
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';
import type { ActiveTheme, Theme, ThemeContextValue, ThemeMode } from './types';

/**
 * AsyncStorage key for theme preference
 */
const THEME_STORAGE_KEY = '@smart_inspector_pro:theme_mode';

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * 
 * Wraps the app to provide theme context.
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load theme preference from storage on mount
   */
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
          setThemeModeState(storedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  /**
   * Determine active theme based on mode and system preference
   */
  const activeTheme: ActiveTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  /**
   * Get theme object based on active theme
   */
  const theme: Theme = useMemo(() => {
    return activeTheme === 'dark' ? darkTheme : lightTheme;
  }, [activeTheme]);

  /**
   * Check if dark mode is active
   */
  const isDark: boolean = useMemo(() => {
    return activeTheme === 'dark';
  }, [activeTheme]);

  /**
   * Set theme mode and persist to storage
   */
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Still update state even if storage fails
      setThemeModeState(mode);
    }
  }, []);

  /**
   * Toggle between light and dark modes
   * (Does not affect system mode)
   */
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [activeTheme, setThemeMode]);

  /**
   * Context value
   */
  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeMode,
      toggleTheme,
      setThemeMode,
      isDark,
    }),
    [theme, themeMode, toggleTheme, setThemeMode, isDark]
  );

  // Don't render children until theme is loaded from storage
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * 
 * Access theme context in components.
 * 
 * @throws {Error} If used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <View style={{ backgroundColor: theme.colors.background }}>
 *     <Text style={theme.typography.h1}>Hello</Text>
 *     <Button onPress={toggleTheme}>Toggle Theme</Button>
 *   </View>
 * );
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
