/**
 * LoadingSpinner Component
 *
 * A themed loading spinner with customizable size and color.
 * Created in P6-T02 as part of themed UI components.
 *
 * @component
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="large" color="primary" />
 * <LoadingSpinner overlay message="Loading..." />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import ThemedText from './ThemedText';

export type LoadingSpinnerSize = 'small' | 'large';
export type LoadingSpinnerColor = 'primary' | 'secondary' | 'white';

export interface LoadingSpinnerProps extends ViewProps {
  /**
   * Spinner size
   * @default 'large'
   */
  size?: LoadingSpinnerSize;

  /**
   * Spinner color
   * @default 'primary'
   */
  color?: LoadingSpinnerColor;

  /**
   * Optional message to display below spinner
   */
  message?: string;

  /**
   * Show as overlay (covers entire screen)
   * @default false
   */
  overlay?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = 'primary',
  message,
  overlay = false,
  style,
  testID = 'loading-spinner',
  ...props
}) => {
  const { theme } = useTheme();

  // Map color prop to theme color
  const getSpinnerColor = (): string => {
    switch (color) {
      case 'secondary':
        return theme.colors.secondary;
      case 'white':
        return '#FFFFFF';
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  const content = (
    <View
      style={[
        styles.container,
        overlay && [
          styles.overlayContainer,
          {
            backgroundColor: theme.colors.overlay,
          },
        ],
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
      testID={testID}
      {...props}
    >
      <View
        style={[
          styles.spinnerWrapper,
          overlay && [
            styles.overlaySpinnerWrapper,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              ...theme.shadows.medium,
            },
          ],
        ]}
      >
        <ActivityIndicator
          size={size}
          color={getSpinnerColor()}
          testID={`${testID}-indicator`}
        />
        {message && (
          <ThemedText
            variant="body1"
            style={[
              styles.message,
              { marginTop: theme.spacing.md, color: theme.colors.text },
            ]}
            testID={`${testID}-message`}
          >
            {message}
          </ThemedText>
        )}
      </View>
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  spinnerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlaySpinnerWrapper: {
    minWidth: 150,
  },
  message: {
    textAlign: 'center',
  },
});

export default LoadingSpinner;
