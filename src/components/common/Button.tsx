/**
 * Button Component
 *
 * A themed button component with loading states and variants.
 * Enhanced in P6-T02 with full theme system integration.
 *
 * @component
 * @example
 * ```tsx
 * <Button title="Sign In" onPress={handleSignIn} loading={isLoading} />
 * <Button title="Cancel" variant="secondary" onPress={handleCancel} />
 * <Button title="Delete" variant="outline" color="error" />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import ThemedText from './ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  /**
   * Button text
   */
  title: string;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Button color
   * @default 'primary'
   */
  color?: ButtonColor;

  /**
   * Show loading indicator
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  color = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  accessibilityLabel,
  testID = 'button',
  ...props
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  // Determine button colors based on variant and color
  const getBackgroundColor = (): string => {
    if (isDisabled) {
      return variant === 'outline' || variant === 'text'
        ? 'transparent'
        : theme.colors.border;
    }

    if (variant === 'outline' || variant === 'text') {
      return 'transparent';
    }

    // Map color prop to theme colors
    switch (color) {
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
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return theme.colors.textDisabled;
    }

    if (variant === 'outline' || variant === 'text') {
      switch (color) {
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
        default:
          return theme.colors.primary;
      }
    }

    // For solid buttons, use white text on dark backgrounds
    return '#FFFFFF';
  };

  const getBorderColor = (): string | undefined => {
    if (variant !== 'outline') return undefined;

    if (isDisabled) {
      return theme.colors.border;
    }

    switch (color) {
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
      default:
        return theme.colors.primary;
    }
  };

  // Size-based styling
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          minHeight: 56,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 48,
        };
    }
  };

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const borderColor = getBorderColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor,
          borderRadius: theme.borderRadius.md,
          ...(variant === 'outline' && {
            borderColor,
            borderWidth: 2,
          }),
        },
        fullWidth && styles.fullWidth,
        // Add shadow for primary solid buttons
        variant === 'primary' && !isDisabled && theme.shadows.small,
        style,
      ]}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} testID={`${testID}-spinner`} />
      ) : (
        <ThemedText
          style={[styles.text, { color: textColor }]}
          variant="button"
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    // Text style handled by ThemedText
  },
});

export default Button;
