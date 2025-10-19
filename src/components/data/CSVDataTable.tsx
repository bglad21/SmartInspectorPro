/**
 * CSVDataTable Component
 *
 * A high-performance table component for displaying CSV data with virtualization.
 * Supports sorting, filtering, and handles large datasets (2,504+ rows) efficiently.
 *
 * Created in P7-T02 as part of data display components.
 *
 * @component
 * @example
 * ```tsx
 * <CSVDataTable
 *   columns={tableColumns}
 *   data={csvData}
 *   onRowPress={(row) => handleRowPress(row)}
 *   sortColumn="section"
 *   sortDirection="asc"
 *   onSort={(column, direction) => handleSort(column, direction)}
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
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import EmptyState from '../common/EmptyState';
import ThemedText from '../common/ThemedText';
import SortableHeader, {
  type SortDirection,
  type TableColumn,
} from './SortableHeader';

export interface TableRow {
  /**
   * Unique identifier for the row
   */
  id: string;

  /**
   * Data for each column (keyed by column ID)
   */
  [key: string]: string | number | boolean | null | undefined;
}

export interface CSVDataTableProps {
  /**
   * Table columns configuration
   */
  columns: TableColumn[];

  /**
   * Table data rows
   */
  data: TableRow[];

  /**
   * Callback when row is pressed
   */
  onRowPress?: (row: TableRow) => void;

  /**
   * Currently sorted column ID
   */
  sortColumn?: string | null;

  /**
   * Current sort direction
   */
  sortDirection?: SortDirection;

  /**
   * Callback when column header is pressed for sorting
   */
  onSort?: (columnId: string, direction: SortDirection) => void;

  /**
   * Empty state configuration
   */
  emptyState?: {
    title: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
  };

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const CSVDataTable: React.FC<CSVDataTableProps> = ({
  columns,
  data,
  onRowPress,
  sortColumn = null,
  sortDirection = null,
  onSort,
  emptyState,
  containerStyle,
  testID = 'csv-data-table',
}) => {
  const { theme } = useTheme();

  const renderRow: ListRenderItem<TableRow> = ({ item, index }) => {
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        onPress={() => onRowPress?.(item)}
        disabled={!onRowPress}
        style={[
          styles.row,
          {
            backgroundColor: isEven
              ? theme.colors.background
              : theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
        testID={`${testID}-row-${item.id}`}
        accessibilityRole={onRowPress ? 'button' : 'text'}
      >
        {columns.map(column => {
          const alignStyle =
            column.align === 'center'
              ? styles.alignCenter
              : column.align === 'right'
                ? styles.alignRight
                : styles.alignLeft;

          return (
            <View
              key={column.id}
              style={[
                styles.cell,
                {
                  flex: column.width || 1,
                },
                alignStyle,
              ]}
            >
              <ThemedText
                variant="body2"
                style={[
                  styles.cellText,
                  {
                    color: theme.colors.text,
                    textAlign: column.align || 'left',
                  },
                ]}
                numberOfLines={2}
              >
                {item[column.id]?.toString() || '-'}
              </ThemedText>
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!onSort) return null;

    return (
      <SortableHeader
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        testID={`${testID}-header`}
      />
    );
  };

  const renderEmpty = () => {
    if (!emptyState) {
      return (
        <EmptyState
          title="No Data"
          description="There are no items to display"
          icon="📊"
          testID={`${testID}-empty`}
        />
      );
    }

    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        icon={emptyState.icon}
        actionLabel={emptyState.actionLabel}
        onAction={emptyState.onAction}
        testID={`${testID}-empty`}
      />
    );
  };

  // Key extractor for FlatList
  const keyExtractor = (item: TableRow) => item.id;

  // Get item layout for optimization (assuming fixed height)
  const getItemLayout = (_data: ArrayLike<TableRow> | null | undefined, index: number) => ({
    length: 56, // Approximate row height
    offset: 56 * index,
    index,
  });

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <FlatList
        data={data}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
        testID={`${testID}-list`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderBottomWidth: 1,
  },
  cell: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
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

export default CSVDataTable;
