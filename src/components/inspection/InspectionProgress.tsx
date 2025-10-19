/**
 * InspectionProgress Component
 *
 * Displays progress indicator for inspection completion.
 * Shows percentage complete and visual progress bar/circle.
 *
 * Features:
 * - Linear or circular progress display
 * - Percentage text
 * - Color coding based on progress
 * - Theme-aware styling
 *
 * @component
 */

import { ThemedText } from '@/components/common';
import { useTheme } from '@/theme';
import type React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

export interface InspectionProgressProps {
  /**
   * Current progress (0-100)
   */
  progress: number;

  /**
   * Total number of items
   */
  total: number;

  /**
   * Number of completed items
   */
  completed: number;

  /**
   * Display type
   * @default 'linear'
   */
  type?: 'linear' | 'circular';

  /**
   * Show percentage text
   * @default true
   */
  showPercentage?: boolean;

  /**
   * Show count (e.g., "5 of 20")
   * @default true
   */
  showCount?: boolean;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Gets progress color based on percentage
 */
const getProgressColor = (
  progress: number,
  theme: { colors: { success: string; warning: string; primary: string } },
): string => {
  if (progress === 100) {
    return theme.colors.success;
  } else if (progress >= 50) {
    return theme.colors.warning;
  } else {
    return theme.colors.primary;
  }
};

export const InspectionProgress: React.FC<InspectionProgressProps> = ({
  progress,
  total,
  completed,
  type = 'linear',
  showPercentage = true,
  showCount = true,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();

  // Clamp progress between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressColor = getProgressColor(clampedProgress, theme);

  if (type === 'circular') {
    // Simplified circular progress (could use react-native-svg for better circles)
    // Note: Full SVG implementation would calculate circumference and strokeDashoffset
    // const radius = 40;
    // const circumference = 2 * Math.PI * radius;
    // const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <View
        style={[styles.circularContainer, style]}
        accessibilityLabel={
          accessibilityLabel ||
          `Inspection ${clampedProgress}% complete, ${completed} of ${total} items`
        }
        accessibilityRole="progressbar"
        testID={testID}
      >
        <View style={styles.circularProgress}>
          {/* Placeholder for circular SVG - using text for now */}
          <View
            style={[styles.circularOuter, { borderColor: theme.colors.border }]}
          >
            <View style={styles.circularInner}>
              {showPercentage && (
                <ThemedText variant="h2" color="primary">
                  {Math.round(clampedProgress)}%
                </ThemedText>
              )}
              {showCount && (
                <ThemedText variant="caption" color="textSecondary">
                  {completed} of {total}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Linear progress
  return (
    <View
      style={[styles.linearContainer, style]}
      accessibilityLabel={
        accessibilityLabel ||
        `Inspection ${clampedProgress}% complete, ${completed} of ${total} items`
      }
      accessibilityRole="progressbar"
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        {showCount && (
          <ThemedText variant="body2" color="textSecondary">
            {completed} of {total} items
          </ThemedText>
        )}
        {showPercentage && (
          <ThemedText variant="body2" color="primary">
            {Math.round(clampedProgress)}%
          </ThemedText>
        )}
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  linearContainer: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  circularContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  circularProgress: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularInner: {
    alignItems: 'center',
  },
});
