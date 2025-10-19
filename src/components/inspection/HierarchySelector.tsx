/**
 * HierarchySelector Component
 *
 * Dropdown selector for CSV hierarchy levels (Section, System, Location, Component, Material).
 * Used in inspection workflow to navigate the 6-level hierarchy.
 *
 * Features:
 * - Dropdown list of options
 * - Search/filter capability
 * - Theme-aware styling
 * - Touch-friendly design
 * - Placeholder text
 *
 * @component
 */

import { Card, TextInput, ThemedText, ThemedView } from '@/components/common';
import { useTheme } from '@/theme';
import type React from 'react';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export interface HierarchyOption {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Optional value (if different from label)
   */
  value?: string;
}

export interface HierarchySelectorProps {
  /**
   * Label for the selector
   */
  label: string;

  /**
   * Placeholder text when nothing is selected
   */
  placeholder?: string;

  /**
   * Array of options to display
   */
  options: HierarchyOption[];

  /**
   * Currently selected option ID
   */
  selectedId?: string;

  /**
   * Callback when option is selected
   */
  onSelect: (option: HierarchyOption) => void;

  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;

  /**
   * Enable search/filter
   * @default true
   */
  searchEnabled?: boolean;

  /**
   * Custom style for container
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

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  selectedId,
  onSelect,
  disabled = false,
  searchEnabled = true,
  style,
  accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(opt => opt.id === selectedId);

  const filteredOptions = searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelect = (option: HierarchyOption) => {
    onSelect(option);
    handleClose();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <ThemedText variant="body2" color="textSecondary" style={styles.label}>
        {label}
      </ThemedText>

      {/* Selector Button */}
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel || `Select ${label}`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        <Card
          elevation="small"
          padding="md"
          style={[
            styles.selectorButton,
            disabled && styles.disabled,
            { borderColor: theme.colors.border },
          ]}
        >
          <ThemedText
            variant="body1"
            color={selectedOption ? 'text' : 'textSecondary'}
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </ThemedText>
          <ThemedText variant="h4" color="textSecondary">
            ▼
          </ThemedText>
        </Card>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modalContent}>
            <ThemedView
              variant="surface"
              style={[
                styles.dropdownContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              {/* Header */}
              <View style={styles.dropdownHeader}>
                <ThemedText variant="h4">{label}</ThemedText>
                <TouchableOpacity
                  onPress={handleClose}
                  accessibilityLabel="Close selector"
                  accessibilityRole="button"
                >
                  <ThemedText variant="h3" color="primary">
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Search */}
              {searchEnabled && (
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                  style={styles.searchInput}
                  autoFocus
                />
              )}

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.option,
                      item.id === selectedId && {
                        backgroundColor: theme.colors.primaryLight,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.label}`}
                  >
                    <ThemedText
                      variant="body1"
                      color={item.id === selectedId ? 'primary' : 'text'}
                    >
                      {item.label}
                    </ThemedText>
                    {item.id === selectedId && (
                      <ThemedText variant="h4" color="primary">
                        ✓
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <ThemedText variant="body2" color="textSecondary">
                      No options found
                    </ThemedText>
                  </View>
                }
                style={styles.optionsList}
              />
            </ThemedView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
  },
  dropdownContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    margin: 12,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
});
