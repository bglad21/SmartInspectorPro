/**
 * FilterChips Component
 *
 * A multi-select chip component for filtering by Section, System, Component, and Material.
 * Supports single and multiple selection modes with theme integration.
 *
 * Created in P7-T02 as part of data display components.
 *
 * @component
 * @example
 * ```tsx
 * <FilterChips
 *   filters={sectionFilters}
 *   selectedIds={selectedSections}
 *   onSelectionChange={setSelectedSections}
 *   multiSelect={true}
 *   label="Sections"
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import {
  FlatList,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import ThemedText from '../common/ThemedText';

export interface FilterChip {
  /**
   * Unique identifier for the chip
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Optional count to display
   */
  count?: number;

  /**
   * Whether the chip is disabled
   */
  disabled?: boolean;
}

export interface FilterChipsProps {
  /**
   * Array of filter chips
   */
  filters: FilterChip[];

  /**
   * Array of selected chip IDs
   */
  selectedIds: string[];

  /**
   * Callback when selection changes
   */
  onSelectionChange: (selectedIds: string[]) => void;

  /**
   * Allow multiple selections
   * @default true
   */
  multiSelect?: boolean;

  /**
   * Label for the filter group (optional)
   */
  label?: string;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  selectedIds,
  onSelectionChange,
  multiSelect = true,
  label,
  containerStyle,
  testID = 'filter-chips',
}) => {
  const { theme } = useTheme();

  const handleChipPress = (chipId: string) => {
    if (multiSelect) {
      // Multi-select: toggle chip
      if (selectedIds.includes(chipId)) {
        onSelectionChange(selectedIds.filter(id => id !== chipId));
      } else {
        onSelectionChange([...selectedIds, chipId]);
      }
    } else {
      // Single-select: replace selection
      if (selectedIds.includes(chipId)) {
        onSelectionChange([]); // Deselect if already selected
      } else {
        onSelectionChange([chipId]);
      }
    }
  };

  const renderChip = ({ item }: { item: FilterChip }) => {
    const isSelected = selectedIds.includes(item.id);
    const isDisabled = item.disabled || false;

    return (
      <TouchableOpacity
        onPress={() => handleChipPress(item.id)}
        disabled={isDisabled}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.border,
            borderRadius: theme.borderRadius.full,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            marginRight: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
          },
          isDisabled && styles.disabledChip,
        ]}
        testID={`${testID}-chip-${item.id}`}
        accessibilityLabel={`${item.label}${isSelected ? ', selected' : ''}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      >
        <ThemedText
          variant="body2"
          style={[
            styles.chipText,
            isSelected && styles.selectedChipText,
            !isSelected && { color: theme.colors.text },
          ]}
        >
          {item.label}
          {item.count !== undefined && ` (${item.count})`}
        </ThemedText>

        {isSelected && (
          <ThemedText
            style={[
              styles.checkmark,
              styles.checkmarkIcon,
              {
                marginLeft: theme.spacing.xs,
              },
            ]}
          >
            ✓
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Label */}
      {label && (
        <ThemedText
          variant="body2"
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.sm,
            },
          ]}
          testID={`${testID}-label`}
        >
          {label}
        </ThemedText>
      )}

      {/* Chips List */}
      <FlatList
        data={filters}
        renderItem={renderChip}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsList}
        testID={`${testID}-list`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
  },
  chipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 36,
  },
  chipText: {
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
  },
  disabledChip: {
    opacity: 0.5,
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  checkmarkIcon: {
    color: '#FFFFFF',
  },
});

export default FilterChips;
