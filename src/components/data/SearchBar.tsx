/**
 * SearchBar Component
 *
 * A search input component with debouncing for efficient filtering of large datasets.
 * Features 300ms debounce, clear button, and theme integration.
 *
 * Created in P7-T02 as part of data display components.
 *
 * @component
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search inspections..."
 *   debounceMs={300}
 * />
 * ```
 */

import { useTheme } from '@/theme';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import ThemedText from '../common/ThemedText';

export interface SearchBarProps extends Omit<TextInputProps, 'onChangeText'> {
  /**
   * Current search value
   */
  value: string;

  /**
   * Callback when search text changes (debounced)
   */
  onChangeText: (text: string) => void;

  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Placeholder text
   * @default "Search..."
   */
  placeholder?: string;

  /**
   * Show clear button when text is present
   * @default true
   */
  showClearButton?: boolean;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  debounceMs = 300,
  placeholder = 'Search...',
  showClearButton = true,
  containerStyle,
  testID = 'search-bar',
  ...props
}) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState(value);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced change handler
  const handleChangeText = useCallback(
    (text: string) => {
      setLocalValue(text);

      // Clear existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Set new timeout
      debounceTimeout.current = setTimeout(() => {
        onChangeText(text);
      }, debounceMs);
    },
    [onChangeText, debounceMs]
  );

  // Clear search
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
  }, [onChangeText]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      {/* Search Icon */}
      <ThemedText
        style={[
          styles.icon,
          {
            color: theme.colors.textSecondary,
          },
        ]}
        testID={`${testID}-icon`}
      >
        🔍
      </ThemedText>

      {/* Input */}
      <TextInput
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
        ]}
        testID={`${testID}-input`}
        {...props}
      />

      {/* Clear Button */}
      {showClearButton && localValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={[
            styles.clearButton,
            {
              padding: theme.spacing.xs,
            },
          ]}
          testID={`${testID}-clear`}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <ThemedText
            style={[
              styles.clearIcon,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            ✕
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44, // Touch-friendly minimum
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    marginLeft: 8,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SearchBar;
