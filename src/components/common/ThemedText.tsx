/**
 * ThemedText Component
 *
 * A Text component with theme-aware colors and typography variants.
 * This is a minimal implementation to unblock P4-T03.
 * Full theme system with complete typography will be implemented in P6-T01.
 *
 * @component
 * @example
 * ```tsx
 * <ThemedText variant="h1">Heading</ThemedText>
 * <ThemedText variant="body">Body text</ThemedText>
 * <ThemedText color="error">Error message</ThemedText>
 * ```
 */

import type React from 'react';
import { StyleSheet, Text, type TextProps, useColorScheme } from 'react-native';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'caption'
  | 'button';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'default';

export interface ThemedTextProps extends TextProps {
  /**
   * Typography variant
   */
  variant?: TextVariant;

  /**
   * Text color variant
   */
  color?: TextColor;

  /**
   * Use dark text even in light mode
   */
  darkMode?: boolean;

  /**
   * Use light text even in dark mode
   */
  lightMode?: boolean;
}

/**
 * Temporary theme colors until P6-T01 theme system is implemented
 */
const COLORS = {
  light: {
    text: '#000000',
    textSecondary: '#666666',
    primary: '#2E5BBA',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    primary: '#5C8BFF',
    error: '#FF6B6B',
    success: '#6BCF73',
    warning: '#FFB84D',
  },
};

/**
 * Typography variants
 */
const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'body',
  color = 'default',
  darkMode,
  lightMode,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = darkMode || (colorScheme === 'dark' && !lightMode);

  const theme = isDark ? COLORS.dark : COLORS.light;

  // Determine text color
  let textColor: string;
  switch (color) {
    case 'primary':
      textColor = theme.primary;
      break;
    case 'secondary':
      textColor = theme.textSecondary;
      break;
    case 'error':
      textColor = theme.error;
      break;
    case 'success':
      textColor = theme.success;
      break;
    case 'warning':
      textColor = theme.warning;
      break;
    default:
      textColor = theme.text;
  }

  const typography = TYPOGRAPHY[variant];

  return (
    <Text
      style={[styles.base, typography, { color: textColor }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    // Base text style
  },
});

export default ThemedText;
