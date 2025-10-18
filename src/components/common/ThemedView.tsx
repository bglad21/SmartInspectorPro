/**
 * ThemedView Component
 *
 * A View component that automatically applies theme-aware background colors.
 * Uses the comprehensive theme system implemented in P6-T01.
 *
 * @component
 * @example
 * ```tsx
 * <ThemedView style={styles.container}>
 *   <Text>Content</Text>
 * </ThemedView>
 * 
 * <ThemedView variant="surface">
 *   <Text>Card content</Text>
 * </ThemedView>
 * ```
 */

import type React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';

export interface ThemedViewProps extends ViewProps {
  /**
   * Background color variant
   * @default 'background'
   */
  variant?: 'background' | 'surface' | 'card';
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  variant = 'background',
  ...props
}) => {
  const { theme } = useTheme();

  // Select background color based on variant
  const backgroundColor = theme.colors[variant];

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
