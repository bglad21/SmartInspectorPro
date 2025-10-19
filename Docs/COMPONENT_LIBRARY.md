# Smart Inspector Pro - Component Library

**Version**: 1.0.0
**Last Updated**: October 17, 2025
**Design System**: Smart Inspector Pro Design Language
**Target Platforms**: iOS 15+, Android 10+

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Theming System](#theming-system)
3. [Typography](#typography)
4. [Color Palette](#color-palette)
5. [Spacing & Layout](#spacing--layout)
6. [Core Components](#core-components)
7. [Form Components](#form-components)
8. [Navigation Components](#navigation-components)
9. [Data Display Components](#data-display-components)
10. [Feedback Components](#feedback-components)
11. [Inspection-Specific Components](#inspection-specific-components)
12. [Accessibility Guidelines](#accessibility-guidelines)

---

## Design Principles

### Design Principles

1. **Clarity**: Information should be immediately comprehensible
2. **Efficiency**: Minimize steps to complete inspection workflows
3. **Consistency**: Same patterns across all screens
4. **Accessibility**: WCAG 2.1 AA compliance (minimum)
5. **Performance**: 60 FPS scrolling, <100ms touch response

### Component Philosophy

- **Atomic Design**: Build from atoms → molecules → organisms
- **Composition over Configuration**: Simple props, compose complex UIs
- **Accessibility First**: Every component supports screen readers
- **Platform Aware**: Respect iOS/Android design guidelines where appropriate

---

## Theming System

Smart Inspector Pro supports **Light** and **Dark** modes with automatic system preference detection. The theming system is built on React Native's `useColorScheme` hook and a centralized theme context.

### Theme Architecture

```typescript
// src/theme/types.ts
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export interface ColorPalette {
  // Background colors
  background: {
    primary: string; // Main background
    secondary: string; // Cards, modals
    tertiary: string; // Input fields, disabled
    overlay: string; // Modal backdrop
  };

  // Text colors
  text: {
    primary: string; // Main text
    secondary: string; // Subtitles, captions
    tertiary: string; // Disabled text
    inverse: string; // Text on colored backgrounds
    link: string; // Links, interactive text
  };

  // Border colors
  border: {
    default: string; // Default borders
    focus: string; // Focused inputs
    error: string; // Error states
  };

  // Brand colors (consistent across themes)
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string; // Text on primary color
  };

  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  // Semantic colors (theme-aware)
  success: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  warning: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  error: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  info: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  // Condition-specific colors (theme-aware)
  condition: {
    acceptable: {
      main: string;
      light: string;
      contrast: string;
    };
    monitor: {
      main: string;
      light: string;
      contrast: string;
    };
    repair: {
      main: string;
      light: string;
      contrast: string;
    };
    safetyHazard: {
      main: string;
      light: string;
      contrast: string;
    };
    accessRestricted: {
      main: string;
      light: string;
      contrast: string;
    };
  };
}
```

### Theme Provider Implementation

```typescript
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './themes';
import type { Theme, ThemeMode } from './types';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

  // Determine actual theme based on mode and system preference
  const actualTheme =
    themeMode === 'auto'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  const theme = actualTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = actualTheme === 'dark';

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('@theme_mode');
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Light Theme Definition

```typescript
// src/theme/themes/light.ts
import type { Theme } from '../types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#E0E0E0',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#BDBDBD',
      inverse: '#FFFFFF',
      link: '#2196F3',
    },
    border: {
      default: '#E0E0E0',
      focus: '#2196F3',
      error: '#F44336',
    },
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrast: '#FFFFFF',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
      contrast: '#000000',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
      contrast: '#FFFFFF',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
      contrast: '#000000',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F',
      contrast: '#FFFFFF',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
      contrast: '#FFFFFF',
    },
    condition: {
      acceptable: {
        main: '#4CAF50',
        light: '#E8F5E9',
        contrast: '#FFFFFF',
      },
      monitor: {
        main: '#FF9800',
        light: '#FFF3E0',
        contrast: '#000000',
      },
      repair: {
        main: '#F44336',
        light: '#FFEBEE',
        contrast: '#FFFFFF',
      },
      safetyHazard: {
        main: '#B71C1C',
        light: '#FFCDD2',
        contrast: '#FFFFFF',
      },
      accessRestricted: {
        main: '#9E9E9E',
        light: '#F5F5F5',
        contrast: '#FFFFFF',
      },
    },
  },
  // Typography, spacing, etc. defined separately
};
```

### Dark Theme Definition

```typescript
// src/theme/themes/dark.ts
import type { Theme } from '../types';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2C2C2C',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#757575',
      inverse: '#000000',
      link: '#64B5F6',
    },
    border: {
      default: '#2C2C2C',
      focus: '#64B5F6',
      error: '#E57373',
    },
    primary: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
      contrast: '#000000',
    },
    secondary: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FFA726',
      contrast: '#000000',
    },
    success: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#66BB6A',
      contrast: '#000000',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FFA726',
      contrast: '#000000',
    },
    error: {
      main: '#E57373',
      light: '#EF9A9A',
      dark: '#EF5350',
      contrast: '#000000',
    },
    info: {
      main: '#64B5F6',
      light: '#90CAF9',
      dark: '#42A5F5',
      contrast: '#000000',
    },
    condition: {
      acceptable: {
        main: '#81C784',
        light: '#1B5E20',
        contrast: '#000000',
      },
      monitor: {
        main: '#FFB74D',
        light: '#E65100',
        contrast: '#000000',
      },
      repair: {
        main: '#E57373',
        light: '#B71C1C',
        contrast: '#000000',
      },
      safetyHazard: {
        main: '#EF5350',
        light: '#C62828',
        contrast: '#FFFFFF',
      },
      accessRestricted: {
        main: '#BDBDBD',
        light: '#424242',
        contrast: '#000000',
      },
    },
  },
  // Typography, spacing, etc. defined separately
};
```

### Using Theme in Components

```typescript
// Example: Themed Button Component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      height: 44,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      backgroundColor:
        variant === 'primary'
          ? theme.colors.primary.main
          : variant === 'secondary'
          ? theme.colors.secondary.main
          : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: theme.colors.border.default,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
      color:
        variant === 'outline'
          ? theme.colors.text.primary
          : theme.colors.primary.contrast,
    },
  });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
```

### Theme Switcher Component

```typescript
// src/components/ThemeSwitcher.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeMode } from '../theme/types';

export const ThemeSwitcher: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '⚙️' },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 8,
      padding: 4,
    },
    option: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    activeOption: {
      backgroundColor: theme.colors.primary.main,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    activeText: {
      color: theme.colors.primary.contrast,
    },
    icon: {
      fontSize: 18,
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      {modes.map(mode => (
        <TouchableOpacity
          key={mode.value}
          style={[
            styles.option,
            themeMode === mode.value && styles.activeOption,
          ]}
          onPress={() => setThemeMode(mode.value)}
        >
          <Text style={styles.icon}>{mode.icon}</Text>
          <Text
            style={[styles.text, themeMode === mode.value && styles.activeText]}
          >
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### Setup Instructions

1. **Wrap your app with ThemeProvider**:

```typescript
// App.tsx
import React from 'react';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
```

2. **Use theme in any component**:

```typescript
import { useTheme } from '../theme/ThemeProvider';

const MyComponent = () => {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background.primary }}>
      <Text style={{ color: theme.colors.text.primary }}>Hello</Text>
    </View>
  );
};
```

3. **Add theme switcher to Settings screen**:

```typescript
import { ThemeSwitcher } from '../components/ThemeSwitcher';

const SettingsScreen = () => {
  return (
    <View>
      <Text>Appearance</Text>
      <ThemeSwitcher />
    </View>
  );
};
```

### Best Practices

1. **Always use theme colors** - Never hardcode colors
2. **Test both themes** - Verify all screens look good in light and dark
3. **Use semantic colors** - Choose colors based on purpose (success, error, etc.)
4. **Consider contrast** - Ensure text is readable on all backgrounds
5. **Respect system preference** - Default to 'auto' mode
6. **Persist user choice** - Save theme preference to AsyncStorage
7. **Avoid pure black** - Use #121212 for dark mode background (better for OLED)
8. **Use theme-aware images** - Provide light/dark variants if needed

### Theme Testing Checklist

- [ ] All screens render correctly in light mode
- [ ] All screens render correctly in dark mode
- [ ] Text contrast meets WCAG 2.1 AA standards
- [ ] Images/icons have appropriate variants
- [ ] Status bar adjusts to theme
- [ ] Navigation bar adjusts to theme
- [ ] Modals and overlays have correct backdrop
- [ ] Input fields have visible borders in both themes
- [ ] Disabled states are distinguishable
- [ ] Loading states are visible
- [ ] Condition colors are distinguishable
- [ ] Theme switcher works in Settings
- [ ] Theme preference persists after app restart
- [ ] Auto mode responds to system preference changes

---

## Typography

### Font Family

```typescript
// src/styles/typography.ts
export const FONT_FAMILY = {
  regular: 'System', // iOS: SF Pro, Android: Roboto
  medium: 'System-Medium',
  semibold: 'System-Semibold',
  bold: 'System-Bold',
  monospace: 'Menlo-Regular', // For codes, IDs
};
```

### Font Sizes

```typescript
export const FONT_SIZE = {
  xs: 12, // Captions, helper text
  sm: 14, // Secondary text, labels
  base: 16, // Body text, default
  lg: 18, // Card titles, emphasized text
  xl: 20, // Screen titles
  '2xl': 24, // Section headers
  '3xl': 30, // Hero text
  '4xl': 36, // Large displays
};
```

### Line Heights

```typescript
export const LINE_HEIGHT = {
  tight: 1.2, // Headlines
  normal: 1.5, // Body text
  relaxed: 1.75, // Long-form text
};
```

### Text Styles (Presets)

```typescript
// Common text style combinations
export const TEXT_STYLES = {
  h1: {
    fontSize: FONT_SIZE['3xl'],
    fontFamily: FONT_FAMILY.bold,
    lineHeight: FONT_SIZE['3xl'] * LINE_HEIGHT.tight,
  },
  h2: {
    fontSize: FONT_SIZE['2xl'],
    fontFamily: FONT_FAMILY.bold,
    lineHeight: FONT_SIZE['2xl'] * LINE_HEIGHT.tight,
  },
  h3: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONT_FAMILY.semibold,
    lineHeight: FONT_SIZE.xl * LINE_HEIGHT.tight,
  },
  body: {
    fontSize: FONT_SIZE.base,
    fontFamily: FONT_FAMILY.regular,
    lineHeight: FONT_SIZE.base * LINE_HEIGHT.normal,
  },
  bodyBold: {
    fontSize: FONT_SIZE.base,
    fontFamily: FONT_FAMILY.bold,
    lineHeight: FONT_SIZE.base * LINE_HEIGHT.normal,
  },
  caption: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONT_FAMILY.regular,
    lineHeight: FONT_SIZE.xs * LINE_HEIGHT.normal,
  },
  button: {
    fontSize: FONT_SIZE.base,
    fontFamily: FONT_FAMILY.semibold,
    lineHeight: FONT_SIZE.base * 1.2,
  },
};
```

---

## Color Palette

### Primary Colors

```typescript
// src/styles/colors.ts
export const COLORS = {
  // Brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary/Accent
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Accent color
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Neutrals (Grayscale)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },
  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },
};
```

### Condition-Specific Colors

```typescript
// Colors for inspection conditions
export const CONDITION_COLORS = {
  Acceptable: COLORS.success.main, // Green
  Monitor: COLORS.warning.main, // Orange
  'Repair/Replace': COLORS.error.main, // Red
  'Safety Hazard': '#D32F2F', // Dark Red
  'Access Restricted': COLORS.neutral[500], // Gray
};
```

### Background Colors

```typescript
export const BACKGROUNDS = {
  primary: COLORS.neutral[0], // White
  secondary: COLORS.neutral[50], // Light gray
  tertiary: COLORS.neutral[100], // Lighter gray
  dark: COLORS.neutral[900], // Dark mode background
};
```

---

## Spacing & Layout

### Spacing Scale

```typescript
// src/styles/spacing.ts
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
```

### Border Radius

```typescript
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999, // Fully rounded
};
```

### Shadows (Elevation)

```typescript
// iOS-style shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
```

### Layout Constraints

```typescript
export const LAYOUT = {
  maxWidth: 1200, // Max content width for tablets
  screenPadding: SPACING.md, // Default screen edge padding
  cardGap: SPACING.md, // Gap between cards in lists
  sectionGap: SPACING.lg, // Gap between major sections
};
```

---

## Core Components

### Button Component

**File**: `src/components/common/Button/Button.tsx`

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  testID = 'button',
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : COLORS.primary[500]}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary[500],
  },
  secondary: {
    backgroundColor: COLORS.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error.main,
  },
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: SPACING.sm,
  },
  medium: {
    height: 44,
    paddingHorizontal: SPACING.md,
  },
  large: {
    height: 52,
    paddingHorizontal: SPACING.lg,
  },
  // Text styles
  text: {
    ...TEXT_STYLES.button,
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.neutral[0],
  },
  secondaryText: {
    color: COLORS.neutral[0],
  },
  outlineText: {
    color: COLORS.primary[500],
  },
  ghostText: {
    color: COLORS.primary[500],
  },
  dangerText: {
    color: COLORS.neutral[0],
  },
  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
```

**Props Interface**:

```typescript
// Button.types.ts
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

**Usage Examples**:

```typescript
// Primary button
<Button title="Create Inspection" onPress={handleCreate} />

// Secondary with icon
<Button
  title="Upload Photo"
  onPress={handleUpload}
  variant="secondary"
  leftIcon={<Icon name="camera" />}
/>

// Loading state
<Button title="Saving..." loading={true} disabled={true} />

// Danger button
<Button title="Delete" onPress={handleDelete} variant="danger" />

// Full width
<Button title="Continue" onPress={handleContinue} fullWidth />
```

---

### Card Component

**File**: `src/components/common/Card/Card.tsx`

```typescript
export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg';
  padding?: keyof typeof SPACING;
  backgroundColor?: string;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 'md',
  padding = 'md',
  backgroundColor = COLORS.neutral[0],
  testID = 'card',
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.base,
        SHADOWS[elevation],
        { padding: SPACING[padding], backgroundColor },
      ]}
      onPress={onPress}
      testID={testID}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
});
```

**Usage**:

```typescript
<Card elevation="lg" padding="lg">
  <Text style={TEXT_STYLES.h3}>Inspection Details</Text>
  <Text style={TEXT_STYLES.body}>123 Main St, Anytown USA</Text>
</Card>

<Card onPress={() => navigate('Detail')}>
  <Text>Tappable card</Text>
</Card>
```

---

### Modal Component

**File**: `src/components/common/Modal/Modal.tsx`

```typescript
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  animationType = 'slide',
  testID = 'modal',
}) => {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={size !== 'fullscreen'}
      onRequestClose={onClose}
      testID={testID}
    >
      <View
        style={[styles.overlay, size === 'fullscreen' && styles.fullscreen]}
      >
        <View style={[styles.content, styles[size]]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && <Text style={TEXT_STYLES.h3}>{title}</Text>}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} testID={`${testID}-close`}>
                  <Icon name="close" size={24} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Body */}
          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  fullscreen: {
    backgroundColor: COLORS.neutral[0],
    padding: 0,
  },
  content: {
    backgroundColor: COLORS.neutral[0],
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.xl,
  },
  small: {
    width: '80%',
    maxWidth: 400,
  },
  medium: {
    width: '90%',
    maxWidth: 600,
  },
  large: {
    width: '95%',
    maxWidth: 900,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  body: {
    padding: SPACING.md,
  },
});
```

---

## Form Components

### TextInput Component

```typescript
export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  testID?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  testID = 'text-input',
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral[400]}
          editable={!disabled}
          testID={testID}
          accessibilityLabel={label || placeholder}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.body,
    fontFamily: FONT_FAMILY.semibold,
    marginBottom: SPACING.xs,
    color: COLORS.neutral[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral[0],
    paddingHorizontal: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 44,
    ...TEXT_STYLES.body,
    color: COLORS.neutral[900],
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputError: {
    borderColor: COLORS.error.main,
  },
  disabled: {
    backgroundColor: COLORS.neutral[100],
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error.main,
    marginTop: SPACING.xs,
  },
  helperText: {
    ...TEXT_STYLES.caption,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
  },
});
```

### Dropdown/Select Component

```typescript
export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  label,
  placeholder = 'Select an option',
  error,
  disabled = false,
  testID = 'select',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        testID={testID}
      >
        <Text
          style={[styles.triggerText, !selectedOption && styles.placeholder]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color={COLORS.neutral[600]} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label || placeholder}
        size="small"
      >
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              option.value === value && styles.optionSelected,
            ]}
            onPress={() => {
              onValueChange(option.value);
              setModalVisible(false);
            }}
            testID={`${testID}-option-${option.value}`}
          >
            <Text
              style={[
                styles.optionText,
                option.value === value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {option.value === value && (
              <Icon name="check" size={20} color={COLORS.primary[500]} />
            )}
          </TouchableOpacity>
        ))}
      </Modal>
    </View>
  );
};
```

---

## Navigation Components

**Phase 7 - Task P7-T03** (October 18, 2025)

### CollapsibleSection Component

**Purpose**: Expandable/collapsible container for organizing content sections with smooth animations and state persistence

**Features**:

- Smooth expand/collapse animations (300ms spring with damping 0.7)
- AsyncStorage persistence of expanded state
- Custom header colors and icons
- Works with any child content (React.ReactNode)
- Chevron rotation animation (0° → 180°) with native driver
- Touch-friendly design (56px minimum header height)
- Accessibility support (roles, states, labels, hints)
- Theme-aware styling
- Optional disabled state (always expanded)

**Props**:

```typescript
export interface CollapsibleSectionProps {
  // Required
  title: string;
  children: React.ReactNode;

  // Optional - Behavior
  defaultExpanded?: boolean; // Default: true
  disabled?: boolean; // Default: false
  storageKey?: string; // For AsyncStorage persistence
  onExpandedChange?: (expanded: boolean) => void;

  // Optional - Styling
  icon?: string; // Emoji or text icon
  headerColor?: string; // Custom header background
  headerTextColor?: string; // Custom header text
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;

  // Optional - Testing
  testID?: string; // Default: 'collapsible-section'
}
```

**Usage Examples**:

**Example 1: Basic Usage**

```tsx
import { CollapsibleSection } from '@/components/common';

<CollapsibleSection title="My Section">
  <Text>Section content goes here</Text>
</CollapsibleSection>;
```

**Example 2: Home Screen with Persistence**

```tsx
<CollapsibleSection
  title="Smart Inspector"
  icon="📸"
  defaultExpanded={true}
  storageKey="section-home-smart-inspector"
>
  <NavigationCard icon="camera" label="Start Inspection" />
  <NavigationCard icon="list" label="Continue Inspection" />
  <NavigationCard icon="group" label="Join Team Inspection" />
</CollapsibleSection>
```

**Example 3: Custom Styling**

```tsx
<CollapsibleSection
  title="Business Management"
  icon="💼"
  headerColor="#007AFF"
  headerTextColor="#FFFFFF"
  containerStyle={{ marginHorizontal: 16 }}
  contentStyle={{ paddingHorizontal: 24 }}
  storageKey="section-home-business"
>
  <NavigationCard icon="schedule" label="Schedule Inspector" />
  <NavigationCard icon="contacts" label="Manage Contacts" />
</CollapsibleSection>
```

**Example 4: Always Expanded (Disabled)**

```tsx
<CollapsibleSection
  title="Important Section"
  disabled={true}
  headerStyle={{ backgroundColor: '#FFF3CD' }}
>
  <Text>This section cannot be collapsed</Text>
</CollapsibleSection>
```

**Example 5: With State Callback**

```tsx
<CollapsibleSection
  title="Analytics"
  onExpandedChange={expanded => {
    console.log('Analytics section expanded:', expanded);
    trackEvent('section_toggle', { section: 'analytics', expanded });
  }}
>
  <AnalyticsWidget />
</CollapsibleSection>
```

**Animation Details**:

- **LayoutAnimation**: 300ms spring (damping: 0.7) for smooth expansion
  - Create/delete: easeInEaseOut for opacity
  - Update: spring for content expansion
- **Chevron Rotation**: Animated.timing with native driver (hardware accelerated)
  - 0° when collapsed
  - 180° when expanded
  - 300ms duration

**AsyncStorage Persistence**:

- **Storage Key Format**: `"section-{screenName}-{sectionName}"`
  - Example: `"section-home-smart-inspector"`
- **Load on Mount**: Retrieves saved state from AsyncStorage
- **Save on Toggle**: Persists state changes automatically
- **Error Handling**: Graceful fallback with console warnings
- **Loading State**: Returns null while loading to prevent flicker
- **Optional**: Only persists if `storageKey` prop provided

**File**: `src/components/common/CollapsibleSection.tsx` (389 lines)

---

### Header Component

```typescript
export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    label?: string;
  }>;
  backgroundColor?: string;
  testID?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  backgroundColor = COLORS.primary[500],
  testID = 'header',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Left Action */}
      {leftAction && (
        <TouchableOpacity
          style={styles.action}
          onPress={leftAction.onPress}
          accessibilityLabel={leftAction.label || 'Back'}
          testID={`${testID}-left-action`}
        >
          <Icon name={leftAction.icon} size={24} color={COLORS.neutral[0]} />
        </TouchableOpacity>
      )}

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.action}
            onPress={action.onPress}
            accessibilityLabel={action.label}
            testID={`${testID}-right-action-${index}`}
          >
            <Icon name={action.icon} size={24} color={COLORS.neutral[0]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...TEXT_STYLES.h3,
    color: COLORS.neutral[0],
  },
  subtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.neutral[100],
  },
  action: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
  },
});
```

---

## Data Display Components

**Phase 7 - Task P7-T02** (October 18, 2025)

High-performance data display components for CSV data with FlatList virtualization, supporting 2,504+ rows smoothly. All components integrate with the theme system and use themed components from P6-T02.

### SearchBar Component

**Purpose**: Search input with 300ms debouncing for efficient filtering

**Features**:

- Configurable debounce delay (default: 300ms)
- Clear button when text is present
- Immediate UI feedback with local state
- Cleanup on unmount (prevents memory leaks)
- Theme-aware styling
- Touch-friendly sizing (44px minimum height)

**Props**:

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  debounceMs?: number; // default: 300
  placeholder?: string; // default: "Search..."
  showClearButton?: boolean; // default: true
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}
```

**Usage**:

```tsx
import { SearchBar } from '@/components/data';

<SearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search inspections..."
  debounceMs={300}
/>;
```

**File**: `src/components/data/SearchBar.tsx` (217 lines)

---

### FilterChips Component

**Purpose**: Multi-select chip component for hierarchy filtering

**Features**:

- Single or multiple selection modes
- Toggle functionality (select/deselect)
- Count display per chip (optional)
- Checkmark on selected chips (✓)
- Disabled state support
- Horizontal scrolling for many filters
- Theme-aware colors

**Props**:

```typescript
interface FilterChipsProps {
  filters: FilterChip[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean; // default: true
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

interface FilterChip {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}
```

**Usage**:

```tsx
import { FilterChips } from '@/components/data';

<FilterChips
  filters={[
    { id: '1', label: 'Exterior', count: 120 },
    { id: '2', label: 'Interior', count: 85 },
    { id: '3', label: 'Mechanical', count: 45 },
  ]}
  selectedIds={['1', '3']}
  onSelectionChange={setSelected}
  multiSelect={true}
  label="Filter by Section"
/>;
```

**File**: `src/components/data/FilterChips.tsx` (233 lines)

---

### HierarchyNavigator Component

**Purpose**: Breadcrumb navigation for CSV hierarchy (Section → System → Component → Material)

**Features**:

- Displays current path as breadcrumbs
- Click to navigate to parent levels
- Last item (current level) is disabled and styled differently
- Customizable separator (default: '›')
- Horizontal scrolling for long paths
- Theme-aware styling

**Props**:

```typescript
interface HierarchyNavigatorProps {
  path: BreadcrumbItem[];
  onNavigate: (index: number) => void;
  separator?: string; // default: '›'
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

interface BreadcrumbItem {
  id: string;
  label: string;
}
```

**Usage**:

```tsx
import { HierarchyNavigator } from '@/components/data';

<HierarchyNavigator
  path={[
    { id: '1', label: 'Exterior Grounds' },
    { id: '2', label: 'Drainage' },
    { id: '3', label: 'Area Drain' },
  ]}
  onNavigate={index => navigateToLevel(index)}
/>;
```

**File**: `src/components/data/HierarchyNavigator.tsx` (181 lines)

---

### SortableHeader Component

**Purpose**: Table header with sort indicators and column management

**Features**:

- Three-state sorting (asc → desc → null)
- Visual indicators (▲ ascending, ▼ descending, ⇅ sortable)
- Column-specific sortable configuration
- Active column highlighting with primary color
- Text alignment per column (left/center/right)
- Custom column widths (flex values)
- Touch-friendly header cells (44px minimum height)

**Props**:

```typescript
interface SortableHeaderProps {
  columns: TableColumn[];
  sortColumn?: string | null;
  sortDirection?: SortDirection;
  onSort: (columnId: string, direction: SortDirection) => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean; // default: true
  width?: number; // flex value
  align?: 'left' | 'center' | 'right'; // default: 'left'
}
```

**Usage**:

```tsx
import { SortableHeader } from '@/components/data';

<SortableHeader
  columns={[
    { id: 'section', label: 'Section', width: 2 },
    { id: 'system', label: 'System', width: 2 },
    { id: 'condition', label: 'Condition', width: 1, align: 'center' },
    { id: 'count', label: 'Count', width: 1, align: 'right' },
  ]}
  sortColumn="section"
  sortDirection="asc"
  onSort={(column, direction) => handleSort(column, direction)}
/>;
```

**File**: `src/components/data/SortableHeader.tsx` (243 lines)

---

### CSVDataTable Component

**Purpose**: High-performance virtualized table for CSV data

**Features**:

- FlatList virtualization (handles 2,504+ rows smoothly)
- Sortable headers (via SortableHeader integration)
- Row selection (via onRowPress callback)
- Alternating row colors for readability
- Empty state display (via EmptyState from P6-T02)
- Customizable columns
- Performance optimizations (getItemLayout, removeClippedSubviews)

**Performance Optimizations**:

- `initialNumToRender={20}` - Render first 20 items
- `maxToRenderPerBatch={20}` - Render 20 items per batch
- `windowSize={10}` - Render 10 screens worth of items
- `removeClippedSubviews={true}` - Remove off-screen views
- `getItemLayout` - Fixed 56px row height optimization

**Props**:

```typescript
interface CSVDataTableProps {
  columns: TableColumn[];
  data: TableRow[];
  onRowPress?: (row: TableRow) => void;
  sortColumn?: string | null;
  sortDirection?: SortDirection;
  onSort?: (columnId: string, direction: SortDirection) => void;
  emptyState?: {
    title: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

interface TableRow {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}
```

**Usage**:

```tsx
import { CSVDataTable } from '@/components/data';

<CSVDataTable
  columns={[
    { id: 'section', label: 'Section', width: 2 },
    { id: 'system', label: 'System', width: 2 },
    { id: 'component', label: 'Component', width: 2 },
    { id: 'condition', label: 'Condition', width: 1 },
  ]}
  data={csvData}
  onRowPress={row => navigate('Details', { id: row.id })}
  sortColumn="section"
  sortDirection="asc"
  onSort={handleSort}
  emptyState={{
    title: 'No Data Available',
    description: 'Load CSV data to view inspection items',
    icon: '📊',
    actionLabel: 'Load Data',
    onAction: loadCSVData,
  }}
/>;
```

**File**: `src/components/data/CSVDataTable.tsx` (256 lines)

---

### EmptyState Component

**Purpose**: Display when no data is available

**Status**: Created in P6-T02, reused in data components

**Features**:

- Icon or emoji display
- Title and description
- Optional action button
- Theme-aware styling
- Centered layout

**File**: `src/components/common/EmptyState.tsx` (162 lines, from P6-T02)

---

### InspectionCard Component

```typescript
export interface InspectionCardProps {
  inspection: Inspection;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  testID?: string;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({
  inspection,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  testID = 'inspection-card',
}) => {
  const statusColor =
    CONDITION_COLORS[inspection.status] || COLORS.neutral[500];

  return (
    <Card onPress={onPress} testID={testID}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{inspection.status}</Text>
      </View>

      {/* Property Address */}
      <Text style={styles.address} numberOfLines={2}>
        {inspection.propertyAddress}
      </Text>

      {/* Date */}
      <Text style={styles.date}>
        {formatDate(inspection.scheduledDate, 'MMM DD, YYYY')}
      </Text>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${inspection.completionPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {inspection.completionPercentage}%
        </Text>
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <Button
              title="Edit"
              onPress={onEdit}
              variant="outline"
              size="small"
              testID={`${testID}-edit`}
            />
          )}
          {onDelete && (
            <Button
              title="Delete"
              onPress={onDelete}
              variant="danger"
              size="small"
              testID={`${testID}-delete`}
            />
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  statusText: {
    ...TEXT_STYLES.caption,
    color: COLORS.neutral[0],
    fontFamily: FONT_FAMILY.semibold,
  },
  address: {
    ...TEXT_STYLES.body,
    fontFamily: FONT_FAMILY.semibold,
    marginBottom: SPACING.xs,
  },
  date: {
    ...TEXT_STYLES.caption,
    color: COLORS.neutral[600],
    marginBottom: SPACING.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
  },
  progressText: {
    ...TEXT_STYLES.caption,
    fontFamily: FONT_FAMILY.semibold,
    color: COLORS.neutral[700],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
```

---

## Feedback Components

### Loading Spinner

```typescript
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary[500],
  text,
  fullScreen = false,
  testID = 'loading-spinner',
}) => {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} testID={testID} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreenContainer}>{content}</View>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[0],
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    color: COLORS.neutral[600],
  },
});
```

### Toast/Snackbar

```typescript
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  visible: boolean;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  testID?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onDismiss,
  action,
  testID = 'toast',
}) => {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const backgroundColor = {
    success: COLORS.success.main,
    error: COLORS.error.main,
    warning: COLORS.warning.main,
    info: COLORS.info.main,
  }[type];

  return (
    <Animated.View
      style={[styles.container, { backgroundColor }]}
      testID={testID}
    >
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} testID={`${testID}-action`}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.lg,
  },
  message: {
    ...TEXT_STYLES.body,
    color: COLORS.neutral[0],
    flex: 1,
  },
  actionText: {
    ...TEXT_STYLES.button,
    color: COLORS.neutral[0],
    marginLeft: SPACING.md,
  },
});
```

---

## Inspection-Specific Components

### PhotoCapture Component

```typescript
export interface PhotoCaptureProps {
  onPhotoTaken: (photo: Photo) => void;
  maxPhotos?: number;
  currentPhotoCount?: number;
  disabled?: boolean;
  testID?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoTaken,
  maxPhotos = 10,
  currentPhotoCount = 0,
  disabled = false,
  testID = 'photo-capture',
}) => {
  const handleCameraPress = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      onPhotoTaken(result.assets[0]);
    }
  };

  const handleGalleryPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      onPhotoTaken(result.assets[0]);
    }
  };

  const reachedLimit = currentPhotoCount >= maxPhotos;

  return (
    <View style={styles.container}>
      <Button
        title="Take Photo"
        onPress={handleCameraPress}
        leftIcon={<Icon name="camera" size={20} color={COLORS.neutral[0]} />}
        disabled={disabled || reachedLimit}
        testID={`${testID}-camera`}
      />

      <Button
        title="Choose from Gallery"
        onPress={handleGalleryPress}
        variant="outline"
        leftIcon={<Icon name="image" size={20} color={COLORS.primary[500]} />}
        disabled={disabled || reachedLimit}
        testID={`${testID}-gallery`}
      />

      {reachedLimit && (
        <Text style={styles.limitText}>
          Maximum of {maxPhotos} photos reached
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  limitText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning.main,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
```

---

### InspectionCard Component (P7-T01)

**Purpose**: Display inspection summary in lists and overview screens

**Features**:

- Property address and type display
- Status badge with color coding (completed/in-progress/cancelled/scheduled)
- Client name and contact info
- Scheduled/completed dates with formatting
- Notes preview (2 lines max)
- Touch interaction for navigation
- Theme-aware styling

**Props**:

```typescript
interface InspectionCardProps {
  inspection: Inspection;
  onPress?: (inspection: Inspection) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
```

**Status Badge Mapping**:

- `completed` → success (green)
- `in-progress` → warning (orange)
- `cancelled` → error (red)
- `scheduled` → info (blue)

**Usage**:

```typescript
import { InspectionCard } from '@/components/inspection';

<InspectionCard
  inspection={inspectionData}
  onPress={inspection => navigate('InspectionDetail', { id: inspection.id })}
/>;
```

**File**: `src/components/inspection/InspectionCard.tsx` (218 lines)

---

### PhotoThumbnail Component (P7-T01)

**Purpose**: Display photo thumbnails with loading and error states

**Features**:

- Image loading with placeholder
- Loading spinner overlay
- Error state display ("Failed to load" message)
- Touch interaction for full view
- Configurable size and border radius
- Theme-aware styling

**Props**:

```typescript
interface PhotoThumbnailProps {
  uri: string;
  onPress?: (uri: string) => void;
  size?: number; // default: 100
  borderRadius?: number; // default: 8
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
```

**States**:

- **Loading**: Semi-transparent overlay with spinner
- **Loaded**: Full image display
- **Error**: "Failed to load" message

**Usage**:

```typescript
import { PhotoThumbnail } from '@/components/inspection';

<PhotoThumbnail
  uri="file:///path/to/photo.jpg"
  size={120}
  onPress={uri => openFullScreen(uri)}
/>;
```

**File**: `src/components/inspection/PhotoThumbnail.tsx` (184 lines)

---

### HierarchySelector Component (P7-T01)

**Purpose**: Dropdown selector for navigating CSV hierarchy (Section → System → Component → Material)

**Features**:

- Modal dropdown list with search
- Selected option display with Card wrapper
- Search/filter capability
- Empty state handling ("No options found")
- Touch-friendly design (44x44 minimum)
- Theme-aware styling
- Disabled state support

**Props**:

```typescript
interface HierarchySelectorProps {
  label: string;
  placeholder?: string;
  options: HierarchyOption[];
  selectedId?: string;
  onSelect: (option: HierarchyOption) => void;
  disabled?: boolean;
  searchEnabled?: boolean; // default: true
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

interface HierarchyOption {
  id: string;
  label: string;
  value?: string;
}
```

**Usage**:

```typescript
import { HierarchySelector } from '@/components/inspection';

<HierarchySelector
  label="Section"
  placeholder="Select a section"
  options={sectionOptions}
  selectedId={selectedSectionId}
  onSelect={option => setSelectedSection(option)}
/>;
```

**File**: `src/components/inspection/HierarchySelector.tsx` (313 lines)

---

### ConditionBadge Component (P7-T01)

**Purpose**: Color-coded badges for the 5 inspection condition types

**Features**:

- 5 condition types with specific colors
- Wrapper around Badge component from P6-T02
- Consistent sizing (small, medium, large)
- Theme-aware colors
- Accessibility support

**Props**:

```typescript
interface ConditionBadgeProps {
  condition: ConditionType;
  size?: BadgeSize; // default: 'medium'
  dot?: boolean; // default: false
  accessibilityLabel?: string;
  testID?: string;
}

type ConditionType =
  | 'Acceptable'
  | 'Monitor'
  | 'Repair/Replace'
  | 'Safety Hazard'
  | 'Access Restricted';
```

**Condition Mapping**:

- `Acceptable` → acceptable (green #4CAF50) - No issues
- `Monitor` → monitor (orange #FF9800) - Minor issues to watch
- `Repair/Replace` → repair (deep orange #FF5722) - Needs repair
- `Safety Hazard` → safetyHazard (red #F44336) - Safety concern
- `Access Restricted` → accessRestricted (gray #9E9E9E) - Couldn't inspect

**Usage**:

```typescript
import { ConditionBadge } from '@/components/inspection';

<ConditionBadge condition="Monitor" size="small" />
<ConditionBadge condition="Safety Hazard" size="large" />
```

**File**: `src/components/inspection/ConditionBadge.tsx` (92 lines)

---

### CommentsList Component (P7-T01)

**Purpose**: Display and select from pre-written comments with custom comment option

**Features**:

- Selectable comment list (single or multiple selection)
- Search/filter capability
- Add custom comment inline
- Category support for comments
- Selected highlighting with primary color and checkmark
- Theme-aware styling
- Empty state handling

**Props**:

```typescript
interface CommentsListProps {
  comments: Comment[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean; // default: false
  searchEnabled?: boolean; // default: true
  allowCustom?: boolean; // default: true
  onCustomCommentAdd?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

interface Comment {
  id: string;
  text: string;
  category?: string;
}
```

**Usage**:

```typescript
import { CommentsList } from '@/components/inspection';

<CommentsList
  comments={prewrittenComments}
  selectedIds={selectedCommentIds}
  onSelectionChange={setSelectedCommentIds}
  multiSelect={true}
  onCustomCommentAdd={text => addComment(text)}
/>;
```

**File**: `src/components/inspection/CommentsList.tsx` (322 lines)

---

### InspectionProgress Component (P7-T01)

**Purpose**: Display inspection completion progress

**Features**:

- Linear or circular progress display
- Percentage calculation and display
- Item count display ("X of Y items")
- Color coding based on progress (0-49%: primary, 50-99%: warning, 100%: success)
- Theme-aware styling

**Props**:

```typescript
interface InspectionProgressProps {
  progress: number; // 0-100
  total: number;
  completed: number;
  type?: 'linear' | 'circular'; // default: 'linear'
  showPercentage?: boolean; // default: true
  showCount?: boolean; // default: true
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}
```

**Display Types**:

- **Linear**: Progress bar with percentage and count text
- **Circular**: Circular display with center text (simplified, no SVG)

**Usage**:

```typescript
import { InspectionProgress } from '@/components/inspection';

<InspectionProgress progress={75} total={100} completed={75} type="linear" />;
```

**File**: `src/components/inspection/InspectionProgress.tsx` (243 lines)

---

### Inspection Components Summary (P7-T01)

**Total Components**: 6
**Total Lines**: 1,425
**Completed**: October 18, 2025
**Phase**: 7 - Core UI Components

**All Components**:

1. InspectionCard (218 lines) - Inspection summary card
2. PhotoThumbnail (184 lines) - Photo display with states
3. HierarchySelector (313 lines) - CSV hierarchy dropdown
4. ConditionBadge (92 lines) - Condition type badges
5. CommentsList (322 lines) - Comments selection
6. InspectionProgress (243 lines) - Progress indicator
7. index.ts (33 lines) - Component exports

**Integration**:

- All components use themed components from P6-T02 (Card, Badge, ThemedText, ThemedView, LoadingSpinner, TextInput)
- Full theme integration with `useTheme()` hook
- TypeScript type safety with 9 interfaces
- Accessibility support with ARIA labels
- Cross-platform compatible (iOS + Android)

**Documentation**: See `CompletedTaskEvidence/Phase_07/P7-T01_COMPLETION_SUMMARY.md` for detailed API reference and usage examples.

---

## Accessibility Guidelines

### Touch Target Sizes

- **Minimum touch target**: 44x44 points (iOS HIG, WCAG 2.1 AA)
- **Recommended touch target**: 48x48 points
- **Spacing between touch targets**: 8 points minimum

### Color Contrast

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text** (18pt+): 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio

### Screen Reader Support

Every interactive component must have:

- `accessibilityLabel`: Describes the element
- `accessibilityHint`: Describes what happens when activated
- `accessibilityRole`: Defines the element type (button, link, etc.)
- `accessibilityState`: Indicates state (selected, disabled, etc.)

**Example**:

```typescript
<TouchableOpacity
  accessibilityLabel="Delete inspection"
  accessibilityHint="Permanently removes this inspection"
  accessibilityRole="button"
  accessibilityState={{ disabled: false }}
  onPress={handleDelete}
>
  <Icon name="trash" />
</TouchableOpacity>
```

### Focus Management

- Tab order should follow logical reading order
- Focus should be visible (outline or highlight)
- Modal opening should move focus to modal
- Modal closing should return focus to trigger element

---

## Usage Examples

### Complete Form Example

```typescript
const InspectionForm: React.FC = () => {
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createInspection({ address, date, type });
      // Success toast
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Property Address"
        value={address}
        onChangeText={setAddress}
        placeholder="123 Main St, Anytown USA"
        error={errors.address}
        leftIcon={<Icon name="home" />}
      />

      <DatePicker
        label="Inspection Date"
        value={date}
        onChange={setDate}
        error={errors.date}
      />

      <Select
        label="Inspection Type"
        value={type}
        onValueChange={setType}
        options={[
          { label: 'Single Family', value: 'single_family' },
          { label: 'Multi-Family', value: 'multi_family' },
          { label: 'Commercial', value: 'commercial' },
        ]}
        error={errors.type}
      />

      <Button
        title="Create Inspection"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        fullWidth
      />
    </ScrollView>
  );
};
```

---

## Version History

### v1.0.0 (October 17, 2025)

- Initial component library specification
- Design system foundations
- Core, form, navigation, and data display components
- Inspection-specific components
- Accessibility guidelines

---

## Contributing

When adding new components:

1. Follow existing patterns and conventions
2. Include TypeScript interfaces for props
3. Add accessibility properties
4. Write unit tests (80%+ coverage)
5. Document with usage examples
6. Add to this document

**Maintainer**: Design & Engineering Team
**Last Review**: October 17, 2025
