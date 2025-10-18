/**
 * Dark Theme Configuration
 * 
 * Defines the dark mode theme for Smart Inspector Pro.
 * Colors chosen for comfortable viewing in low-light conditions
 * while maintaining professional appearance and WCAG AA compliance.
 * 
 * @module theme/darkTheme
 */

import type { Theme } from './types';

export const darkTheme: Theme = {
  mode: 'dark',
  
  colors: {
    // Primary brand colors (Lighter blue for dark mode readability)
    primary: '#5C8BFF',
    primaryDark: '#2E5BBA',
    primaryLight: '#90B4FF',
    
    // Secondary colors (Lighter gray-blue)
    secondary: '#90A4AE',
    secondaryDark: '#607D8B',
    secondaryLight: '#B0BEC5',
    
    // Background colors (from requirements: #121212 for dark)
    background: '#121212',    // Material dark background
    surface: '#1E1E1E',      // Elevated surfaces
    card: '#2C2C2C',         // Card backgrounds
    
    // Text colors
    text: '#FFFFFF',         // White primary text
    textSecondary: '#AAAAAA', // Light gray secondary text
    textDisabled: '#666666',  // Disabled text
    
    // Status colors (slightly lighter for dark mode)
    success: '#6BCF73',      // Lighter green
    warning: '#FFB84D',      // Lighter orange
    error: '#FF6B6B',        // Lighter red
    info: '#5C8BFF',         // Lighter blue
    
    // Border colors
    border: '#333333',       // Dark gray borders
    divider: '#333333',      // Divider lines
    
    // Inspection condition colors (adjusted for dark mode)
    acceptable: '#6BCF73',   // Lighter green
    monitor: '#FFB84D',      // Lighter orange
    repair: '#FF8A65',       // Lighter deep orange
    safetyHazard: '#FF6B6B', // Lighter red
    accessRestricted: '#BDBDBD', // Lighter gray
    
    // Overlay and interaction
    overlay: 'rgba(0, 0, 0, 0.7)',     // Darker overlay for dark mode
    ripple: 'rgba(92, 139, 255, 0.24)', // Lighter blue ripple
    disabled: '#2C2C2C',               // Disabled background
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
      color: '#FFFFFF',
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      color: '#FFFFFF',
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      color: '#FFFFFF',
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: '#FFFFFF',
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: '#FFFFFF',
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
      color: '#FFFFFF',
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: '#FFFFFF',
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: '#AAAAAA',
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
      color: '#AAAAAA',
    },
    overline: {
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 16,
      color: '#AAAAAA',
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
      shadowOpacity: 0.30,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.40,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.50,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};
