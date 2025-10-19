/**
 * Card Component
 *
 * A themed card container with elevation, padding, and optional touch interaction.
 * Created in P6-T02 as part of themed UI components.
 *
 * @component
 * @example
 * ```tsx
 * <Card elevation="md" padding="lg">
 *   <ThemedText variant="h3">Card Title</ThemedText>
 *   <ThemedText variant="body1">Card content goes here</ThemedText>
 * </Card>
 *
 * <Card onPress={() => navigate('Detail')} elevation="lg">
 *   <ThemedText>Tappable card</ThemedText>
 * </Card>
 * ```
 */

import type React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewProps,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@/theme';

export type CardElevation = 'none' | 'small' | 'medium' | 'large';
export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface CardProps extends Omit<ViewProps, 'children'> {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * On press handler (makes card tappable)
   */
  onPress?: () => void;

  /**
   * Card elevation
   * @default 'medium'
   */
  elevation?: CardElevation;

  /**
   * Card padding
   * @default 'md'
   */
  padding?: CardPadding;

  /**
   * Override background color
   */
  backgroundColor?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 'medium',
  padding = 'md',
  backgroundColor,
  style,
  accessibilityLabel,
  testID = 'card',
  ...props
}) => {
  const { theme } = useTheme();

  // Map elevation to shadow styles
  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return theme.shadows.small;
      case 'large':
        return theme.shadows.large;
      case 'medium':
      default:
        return theme.shadows.medium;
    }
  };

  // Map padding to theme spacing
  const getPaddingValue = () => {
    if (padding === 'none') return 0;
    return theme.spacing[padding];
  };

  const baseStyle = [
    styles.base,
    getShadowStyle(),
    {
      backgroundColor: backgroundColor || theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: getPaddingValue(),
      marginBottom: theme.spacing.md,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={baseStyle}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={baseStyle}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default Card;
