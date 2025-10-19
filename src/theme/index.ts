/**
 * Theme System Entry Point
 *
 * Central export for all theme-related functionality.
 *
 * @module theme
 */

export { darkTheme } from './darkTheme';

// Theme objects
export { lightTheme } from './lightTheme';
// Context and hook
export { ThemeProvider, useTheme } from './ThemeContext';
// Types
export type {
  ActiveTheme,
  BorderRadius,
  ColorPalette,
  Shadows,
  Spacing,
  Theme,
  ThemeContextValue,
  ThemeMode,
  Typography,
} from './types';
