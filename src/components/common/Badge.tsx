/**
 * Badge Component
 *
 * A themed badge component for status indicators and labels.
 * Created in P6-T02 as part of themed UI components.
 *
 * @component
 * @example
 * ```tsx
 * <Badge label="New" variant="success" />
 * <Badge label="Draft" variant="warning" />
 * <Badge label="Error" variant="error" size="small" />
 * <Badge label="23" variant="primary" />
 * ```
 */

import type React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';
import ThemedText from './ThemedText';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'acceptable'
  | 'monitor'
  | 'repair'
  | 'safetyHazard'
  | 'accessRestricted';

export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps extends ViewProps {
  /**
   * Badge label text
   */
  label: string;

  /**
   * Badge variant (color scheme)
   * @default 'primary'
   */
  variant?: BadgeVariant;

  /**
   * Badge size
   * @default 'medium'
   */
  size?: BadgeSize;

  /**
   * Override text color
   */
  textColor?: string;

  /**
   * Override background color
   */
  backgroundColor?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  textColor,
  backgroundColor,
  style,
  testID = 'badge',
  ...props
}) => {
  const { theme } = useTheme();

  // Map variant to background color
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      case 'acceptable':
        return theme.colors.acceptable;
      case 'monitor':
        return theme.colors.monitor;
      case 'repair':
        return theme.colors.repair;
      case 'safetyHazard':
        return theme.colors.safetyHazard;
      case 'accessRestricted':
        return theme.colors.accessRestricted;
      default:
        return theme.colors.primary;
    }
  };

  // Text color is always white for contrast
  const getTextColor = (): string => {
    if (textColor) return textColor;
    return '#FFFFFF';
  };

  // Size-based styling
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 2,
          paddingHorizontal: theme.spacing.xs,
          fontSize: 10,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          fontSize: 14,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: theme.spacing.sm,
          fontSize: 12,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.borderRadius.full,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
      testID={testID}
      {...props}
    >
      <ThemedText
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: sizeStyles.fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
  },
});

export default Badge;
