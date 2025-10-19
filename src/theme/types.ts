/**
 * Theme Type Definitions
 *
 * Defines the structure and types for the Smart Inspector Pro theme system.
 * Supports light and dark modes with comprehensive color palettes, typography,
 * spacing, border radius, and shadow definitions.
 *
 * @module theme/types
 */

import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Active theme type (resolved from mode)
 */
export type ActiveTheme = 'light' | 'dark';

/**
 * Color palette interface
 */
export interface ColorPalette {
  // Primary brand colors
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Secondary colors
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;

  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border colors
  border: string;
  divider: string;

  // Inspection condition colors (from CSV data model)
  acceptable: string;
  monitor: string;
  repair: string;
  safetyHazard: string;
  accessRestricted: string;

  // Overlay and interaction
  overlay: string;
  ripple: string;
  disabled: string;
}

/**
 * Spacing scale for consistent layout
 */
export interface Spacing {
  xs: number; // 4px
  sm: number; // 8px
  md: number; // 16px
  lg: number; // 24px
  xl: number; // 32px
  xxl: number; // 48px
}

/**
 * Typography variants
 */
export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  h5: TextStyle;
  h6: TextStyle;
  body1: TextStyle;
  body2: TextStyle;
  button: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
}

/**
 * Border radius values
 */
export interface BorderRadius {
  sm: number; // 4px
  md: number; // 8px
  lg: number; // 16px
  xl: number; // 24px
  full: number; // 9999px (fully rounded)
}

/**
 * Shadow definitions for elevation
 */
export interface Shadows {
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
}

/**
 * Complete theme interface
 */
export interface Theme {
  mode: ActiveTheme;
  colors: ColorPalette;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

/**
 * Theme context value interface
 */
export interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}
