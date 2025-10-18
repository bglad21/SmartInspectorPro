/**
 * Theme System Entry Point
 * 
 * Central export for all theme-related functionality.
 * 
 * @module theme
 */

// Types
export type {
  Theme,
  ThemeMode,
  ActiveTheme,
  ColorPalette,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  ThemeContextValue,
} from './types';

// Theme objects
export { lightTheme } from './lightTheme';
export { darkTheme } from './darkTheme';

// Context and hook
export { ThemeProvider, useTheme } from './ThemeContext';
