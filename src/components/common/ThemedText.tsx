/**
 * ThemedText Component
 *
 * A Text component with theme-aware colors and typography variants.
 * Uses the comprehensive theme system implemented in P6-T01.
 *
 * @component
 * @example
 * ```tsx
 * <ThemedText variant="h1">Heading</ThemedText>
 * <ThemedText variant="body1">Body text</ThemedText>
 * <ThemedText color="error">Error message</ThemedText>
 * <ThemedText color="primary" variant="h3">Primary Heading</ThemedText>
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline'
  | 'body'; // Alias for body1 (backward compatibility)

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'text'
  | 'textSecondary'
  | 'textDisabled'
  | 'default'
  | 'acceptable'
  | 'monitor'
  | 'repair'
  | 'safetyHazard'
  | 'accessRestricted';

export interface ThemedTextProps extends TextProps {
  /**
   * Typography variant
   * @default 'body1'
   */
  variant?: TextVariant;

  /**
   * Text color variant
   * @default 'text'
   */
  color?: TextColor;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'body1',
  color = 'text',
  ...props
}) => {
  const { theme } = useTheme();

  // Map 'body' to 'body1' for backward compatibility
  const mappedVariant = variant === 'body' ? 'body1' : variant;

  // Get typography style
  const typography = theme.typography[mappedVariant];

  // Determine text color
  let textColor: string;
  switch (color) {
    case 'primary':
      textColor = theme.colors.primary;
      break;
    case 'secondary':
      textColor = theme.colors.textSecondary;
      break;
    case 'error':
      textColor = theme.colors.error;
      break;
    case 'success':
      textColor = theme.colors.success;
      break;
    case 'warning':
      textColor = theme.colors.warning;
      break;
    case 'info':
      textColor = theme.colors.info;
      break;
    case 'textSecondary':
      textColor = theme.colors.textSecondary;
      break;
    case 'textDisabled':
      textColor = theme.colors.textDisabled;
      break;
    case 'acceptable':
      textColor = theme.colors.acceptable;
      break;
    case 'monitor':
      textColor = theme.colors.monitor;
      break;
    case 'repair':
      textColor = theme.colors.repair;
      break;
    case 'safetyHazard':
      textColor = theme.colors.safetyHazard;
      break;
    case 'accessRestricted':
      textColor = theme.colors.accessRestricted;
      break;
    case 'text':
      textColor = theme.colors.text;
      break;
    default:
      textColor = theme.colors.text;
  }

  // Override typography color with selected color
  const finalTypography = {
    ...typography,
    color: textColor,
  };

  return <Text style={[styles.base, finalTypography, style]} {...props} />;
};

const styles = StyleSheet.create({
  base: {
    // Base text style
  },
});

export default ThemedText;
