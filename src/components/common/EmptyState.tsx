/**
 * EmptyState Component
 *
 * A themed empty state component with icon, title, description, and optional action button.
 * Created in P6-T02 as part of themed UI components.
 *
 * @component
 * @example
 * ```tsx
 * <EmptyState
 *   title="No Inspections"
 *   description="You haven't created any inspections yet."
 *   icon="📋"
 *   actionLabel="Create Inspection"
 *   onAction={() => navigate('CreateInspection')}
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Button from './Button';
import ThemedText from './ThemedText';

export interface EmptyStateProps extends ViewProps {
  /**
   * Empty state title
   */
  title: string;

  /**
   * Empty state description (optional)
   */
  description?: string;

  /**
   * Icon or emoji to display (optional)
   */
  icon?: string;

  /**
   * Action button label (optional)
   */
  actionLabel?: string;

  /**
   * Action button handler (optional)
   */
  onAction?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
  testID = 'empty-state',
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xxl,
        },
        style,
      ]}
      testID={testID}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <ThemedText style={styles.icon} testID={`${testID}-icon`}>
            {icon}
          </ThemedText>
        </View>
      )}

      {/* Title */}
      <ThemedText
        variant="h3"
        style={[
          styles.title,
          {
            marginBottom: theme.spacing.sm,
            color: theme.colors.text,
          },
        ]}
        testID={`${testID}-title`}
      >
        {title}
      </ThemedText>

      {/* Description */}
      {description && (
        <ThemedText
          variant="body1"
          style={[
            styles.description,
            {
              marginBottom: theme.spacing.lg,
              color: theme.colors.textSecondary,
            },
          ]}
          testID={`${testID}-description`}
        >
          {description}
        </ThemedText>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          testID={`${testID}-action`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 400,
  },
});

export default EmptyState;
