/**
 * Light Theme Configuration
 * 
 * Defines the light mode theme for Smart Inspector Pro.
 * Colors chosen for professional inspection app with excellent readability
 * and accessibility (WCAG AA compliant).
 * 
 * @module theme/lightTheme
 */

import type { Theme } from './types';

export const lightTheme: Theme = {
  mode: 'light',
  
  colors: {
    // Primary brand colors (Blue from requirements)
    primary: '#2E5BBA',
    primaryDark: '#1E4080',
    primaryLight: '#5C8BFF',
    
    // Secondary colors (Professional gray-blue)
    secondary: '#607D8B',
    secondaryDark: '#455A64',
    secondaryLight: '#90A4AE',
    
    // Background colors
    background: '#F8F9FA',     // Light gray background
    surface: '#FFFFFF',        // White surfaces
    card: '#FFFFFF',          // Card backgrounds
    
    // Text colors
    text: '#212121',          // Primary text (dark gray, not pure black)
    textSecondary: '#757575', // Secondary text
    textDisabled: '#BDBDBD',  // Disabled text
    
    // Status colors (from requirements)
    success: '#4CAF50',       // Green for success
    warning: '#FF9800',       // Orange for warnings
    error: '#F44336',         // Red for errors
    info: '#2196F3',          // Blue for info
    
    // Border colors
    border: '#E0E0E0',        // Light gray borders
    divider: '#E0E0E0',       // Divider lines
    
    // Inspection condition colors (matching CSV data model)
    acceptable: '#4CAF50',    // Green - no issues
    monitor: '#FF9800',       // Orange - minor issues
    repair: '#FF5722',        // Deep orange - needs repair
    safetyHazard: '#F44336',  // Red - safety concern
    accessRestricted: '#9E9E9E', // Gray - couldn't inspect
    
    // Overlay and interaction
    overlay: 'rgba(0, 0, 0, 0.5)',     // Semi-transparent black
    ripple: 'rgba(33, 150, 243, 0.12)', // Light blue ripple
    disabled: '#F5F5F5',               // Disabled background
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      color: '#212121',
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      color: '#212121',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      color: '#212121',
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: '#212121',
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: '#212121',
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      color: '#212121',
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: '#212121',
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: '#757575',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      color: '#757575',
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 16,
      color: '#757575',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};
