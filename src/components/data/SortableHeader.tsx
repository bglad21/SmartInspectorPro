/**
 * SortableHeader Component
 *
 * A table header component with sort indicators for ascending/descending order.
 * Supports multiple columns with independent sorting.
 *
 * Created in P7-T02 as part of data display components.
 *
 * @component
 * @example
 * ```tsx
 * <SortableHeader
 *   columns={tableColumns}
 *   sortColumn="address"
 *   sortDirection="asc"
 *   onSort={(column, direction) => handleSort(column, direction)}
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import ThemedText from '../common/ThemedText';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn {
  /**
   * Unique identifier for the column
   */
  id: string;

  /**
   * Display label for the column header
   */
  label: string;

  /**
   * Whether this column is sortable
   * @default true
   */
  sortable?: boolean;

  /**
   * Column width (flex value or fixed number)
   */
  width?: number;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
}

export interface SortableHeaderProps {
  /**
   * Array of table columns
   */
  columns: TableColumn[];

  /**
   * Currently sorted column ID
   */
  sortColumn?: string | null;

  /**
   * Current sort direction
   */
  sortDirection?: SortDirection;

  /**
   * Callback when column header is pressed
   */
  onSort: (columnId: string, direction: SortDirection) => void;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  columns,
  sortColumn = null,
  sortDirection = null,
  onSort,
  containerStyle,
  testID = 'sortable-header',
}) => {
  const { theme } = useTheme();

  const handleHeaderPress = (column: TableColumn) => {
    if (!column.sortable) return;

    let newDirection: SortDirection = 'asc';

    if (sortColumn === column.id) {
      // Toggle direction if same column
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null; // Remove sort
      } else {
        newDirection = 'asc';
      }
    }

    onSort(column.id, newDirection);
  };

  const getSortIcon = (column: TableColumn): string => {
    if (sortColumn !== column.id || !sortDirection) return '';

    return sortDirection === 'asc' ? '▲' : '▼';
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
      {columns.map(column => {
        const isSortable = column.sortable !== false;
        const isActive = sortColumn === column.id && sortDirection !== null;
        const alignStyle =
          column.align === 'center'
            ? styles.alignCenter
            : column.align === 'right'
              ? styles.alignRight
              : styles.alignLeft;

        return (
          <TouchableOpacity
            key={column.id}
            onPress={() => handleHeaderPress(column)}
            disabled={!isSortable}
            style={[
              styles.headerCell,
              {
                flex: column.width || 1,
              },
              alignStyle,
            ]}
            testID={`${testID}-${column.id}`}
            accessibilityLabel={`${column.label}${isActive ? `, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isSortable }}
          >
            <View style={styles.headerContent}>
              <ThemedText
                variant="body2"
                style={[
                  styles.headerText,
                  {
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {column.label}
              </ThemedText>

              {isSortable && (
                <ThemedText
                  style={[
                    styles.sortIcon,
                    {
                      color: isActive
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                      marginLeft: theme.spacing.xs,
                    },
                    !isActive && styles.inactiveSortIcon,
                  ]}
                >
                  {getSortIcon(column) || '⇅'}
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderBottomWidth: 2,
  },
  headerCell: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    minHeight: 44,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sortIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveSortIcon: {
    opacity: 0.4,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
});

export default SortableHeader;
