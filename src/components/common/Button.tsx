/**
 * Button Component
 *
 * A themed button component with loading states and variants.
 * This is a minimal implementation to unblock P4-T03.
 * Full button system will be enhanced in P6-T02.
 *
 * @component
 * @example
 * ```tsx
 * <Button title="Sign In" onPress={handleSignIn} loading={isLoading} />
 * <Button title="Cancel" variant="secondary" onPress={handleCancel} />
 * ```
 */

import type React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
  useColorScheme,
} from 'react-native';
import ThemedText from './ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  /**
   * Button text
   */
  title: string;

  /**
   * Button variant
   */
  variant?: ButtonVariant;

  /**
   * Show loading indicator
   */
  loading?: boolean;

  /**
   * Full width button
   */
  fullWidth?: boolean;
}

/**
 * Temporary theme colors until P6-T01 theme system is implemented
 */
const COLORS = {
  light: {
    primary: '#2E5BBA',
    primaryText: '#FFFFFF',
    secondary: '#E0E0E0',
    secondaryText: '#000000',
    outline: '#2E5BBA',
    outlineText: '#2E5BBA',
    disabled: '#CCCCCC',
    disabledText: '#666666',
  },
  dark: {
    primary: '#5C8BFF',
    primaryText: '#FFFFFF',
    secondary: '#333333',
    secondaryText: '#FFFFFF',
    outline: '#5C8BFF',
    outlineText: '#5C8BFF',
    disabled: '#444444',
    disabledText: '#888888',
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const isDisabled = disabled || loading;

  // Determine button colors
  let backgroundColor: string;
  let textColor: string;
  let borderColor: string | undefined;

  if (isDisabled) {
    backgroundColor =
      variant === 'outline' || variant === 'text'
        ? 'transparent'
        : theme.disabled;
    textColor = theme.disabledText;
    borderColor = variant === 'outline' ? theme.disabled : undefined;
  } else {
    switch (variant) {
      case 'primary':
        backgroundColor = theme.primary;
        textColor = theme.primaryText;
        break;
      case 'secondary':
        backgroundColor = theme.secondary;
        textColor = theme.secondaryText;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        textColor = theme.outlineText;
        borderColor = theme.outline;
        break;
      case 'text':
        backgroundColor = 'transparent';
        textColor = theme.primary;
        break;
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          ...(variant === 'outline' && {
            borderColor,
            borderWidth: 2,
          }),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText
          style={[styles.text, { color: textColor }]}
          variant="button"
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
