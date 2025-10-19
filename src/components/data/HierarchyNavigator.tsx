/**
 * HierarchyNavigator Component
 *
 * A breadcrumb navigation component for CSV hierarchy levels (Section → System → Location → Component → Material).
 * Displays the current path and allows navigation to parent levels.
 *
 * Created in P7-T02 as part of data display components.
 *
 * @component
 * @example
 * ```tsx
 * <HierarchyNavigator
 *   path={[
 *     { id: '1', label: 'Exterior Grounds' },
 *     { id: '2', label: 'Drainage' },
 *     { id: '3', label: 'Area Drain' },
 *   ]}
 *   onNavigate={(index) => navigateToLevel(index)}
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import ThemedText from '../common/ThemedText';

export interface BreadcrumbItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;
}

export interface HierarchyNavigatorProps {
  /**
   * Array of breadcrumb items representing the current path
   */
  path: BreadcrumbItem[];

  /**
   * Callback when a breadcrumb is pressed (receives the index)
   */
  onNavigate: (index: number) => void;

  /**
   * Separator between breadcrumbs
   * @default '›'
   */
  separator?: string;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const HierarchyNavigator: React.FC<HierarchyNavigatorProps> = ({
  path,
  onNavigate,
  separator = '›',
  containerStyle,
  testID = 'hierarchy-navigator',
}) => {
  const { theme } = useTheme();

  if (path.length === 0) {
    return null;
  }

  const renderBreadcrumb = ({
    item,
    index,
  }: {
    item: BreadcrumbItem;
    index: number;
  }) => {
    const isLast = index === path.length - 1;

    return (
      <View style={styles.breadcrumbContainer} key={item.id}>
        <TouchableOpacity
          onPress={() => onNavigate(index)}
          disabled={isLast}
          style={[
            styles.breadcrumb,
            {
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: theme.spacing.xs,
            },
          ]}
          testID={`${testID}-item-${index}`}
          accessibilityLabel={`Navigate to ${item.label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLast }}
        >
          <ThemedText
            variant="body2"
            style={[
              styles.breadcrumbText,
              {
                color: isLast
                  ? theme.colors.text
                  : theme.colors.primary,
              },
            ]}
          >
            {item.label}
          </ThemedText>
        </TouchableOpacity>

        {!isLast && (
          <ThemedText
            style={[
              styles.separator,
              {
                color: theme.colors.textSecondary,
                marginHorizontal: theme.spacing.xs,
              },
            ]}
          >
            {separator}
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      <FlatList
        data={path}
        renderItem={renderBreadcrumb}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.breadcrumbsList}
        testID={`${testID}-list`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 44,
    borderBottomWidth: 1,
  },
  breadcrumbsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumb: {
    minHeight: 28,
    justifyContent: 'center',
  },
  breadcrumbText: {
    fontWeight: '500',
  },
  separator: {
    fontSize: 16,
    fontWeight: '300',
  },
});

export default HierarchyNavigator;
