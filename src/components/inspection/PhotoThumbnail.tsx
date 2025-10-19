/**
 * PhotoThumbnail Component
 *
 * Displays a photo thumbnail with loading and error states.
 * Used in inspection records to show captured photos.
 *
 * Features:
 * - Image loading with placeholder
 * - Error state handling
 * - Touch interaction for full view
 * - Theme-aware styling
 * - Loading spinner
 *
 * @component
 */

import { LoadingSpinner, ThemedText, ThemedView } from '@/components/common';
import { useTheme } from '@/theme';
import type React from 'react';
import { useState } from 'react';
import {
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export interface PhotoThumbnailProps {
  /**
   * Photo URI (local file path or remote URL)
   */
  uri: string;

  /**
   * Callback when thumbnail is pressed
   */
  onPress?: (uri: string) => void;

  /**
   * Size of the thumbnail
   * @default 100
   */
  size?: number;

  /**
   * Border radius
   * @default 8
   */
  borderRadius?: number;

  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Custom style for the image
   */
  imageStyle?: StyleProp<ImageStyle>;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID
   */
  testID?: string;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  uri,
  onPress,
  size = 100,
  borderRadius = 8,
  style,
  imageStyle,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handlePress = () => {
    if (!error) {
      onPress?.(uri);
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={error}
      style={[containerStyle, style]}
      accessibilityLabel={
        accessibilityLabel ||
        (error ? 'Failed to load photo' : 'Photo thumbnail')
      }
      accessibilityRole="image"
      testID={testID}
    >
      {/* Image */}
      {!error && (
        <Image
          source={{ uri }}
          style={[styles.image, imageStyle]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode="cover"
        />
      )}

      {/* Loading State */}
      {loading && !error && (
        <View style={styles.overlay}>
          <LoadingSpinner size="small" />
        </View>
      )}

      {/* Error State */}
      {error && (
        <ThemedView variant="surface" style={styles.errorContainer}>
          <ThemedText variant="caption" color="error" style={styles.errorText}>
            Failed to load
          </ThemedText>
        </ThemedView>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 10,
  },
});
