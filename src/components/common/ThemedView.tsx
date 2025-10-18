/**
 * ThemedView Component
 *
 * A View component that automatically applies theme-aware background colors.
 * This is a minimal implementation to unblock P4-T03.
 * Full theme system will be implemented in P6-T01.
 *
 * @component
 * @example
 * ```tsx
 * <ThemedView style={styles.container}>
 *   <Text>Content</Text>
 * </ThemedView>
 * ```
 */

import type React from 'react';
import { StyleSheet, useColorScheme, View, type ViewProps } from 'react-native';

export interface ThemedViewProps extends ViewProps {
  /**
   * Use dark background even in light mode
   */
  darkMode?: boolean;

  /**
   * Use light background even in dark mode
   */
  lightMode?: boolean;
}

/**
 * Temporary theme colors until P6-T01 theme system is implemented
 */
const COLORS = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
  },
};

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  darkMode,
  lightMode,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = darkMode || (colorScheme === 'dark' && !lightMode);

  const backgroundColor = isDark
    ? COLORS.dark.background
    : COLORS.light.background;

  return (
    <View style={[styles.container, { backgroundColor }, style]} {...props} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemedView;
