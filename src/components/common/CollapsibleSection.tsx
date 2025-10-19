/**
 * CollapsibleSection Component
 *
 * Expandable/collapsible container for organizing content on the home screen
 * and throughout the app. Features smooth animations and state persistence.
 *
 * Created: Phase 7, Task P7-T03
 *
 * Features:
 * - Smooth expand/collapse animations (spring/ease-out)
 * - AsyncStorage persistence of expanded state
 * - Custom header colors and icons
 * - Works with any child content
 * - Touch-friendly design (44px minimum)
 * - Theme-aware styling
 * - Accessibility support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import ThemedText from './ThemedText';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * CollapsibleSection Props
 */
export interface CollapsibleSectionProps {
  /**
   * Section title displayed in the header
   */
  title: string;

  /**
   * Initial expanded state (default: true)
   * Only used on first render if no persisted state exists
   */
  defaultExpanded?: boolean;

  /**
   * Child components to display when expanded
   */
  children: React.ReactNode;

  /**
   * Optional icon name (emoji or text)
   * Displayed to the left of the title
   */
  icon?: string;

  /**
   * Custom header background color
   * Defaults to theme surface color
   */
  headerColor?: string;

  /**
   * Custom header text color
   * Defaults to theme text color
   */
  headerTextColor?: string;

  /**
   * Unique identifier for AsyncStorage persistence
   * If not provided, state won't be persisted
   * Format: "section-{screenName}-{sectionName}"
   */
  storageKey?: string;

  /**
   * Disable expand/collapse functionality
   * Useful for always-expanded sections
   */
  disabled?: boolean;

  /**
   * Callback when expanded state changes
   */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * Custom container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom header style
   */
  headerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom content style
   */
  contentStyle?: StyleProp<ViewStyle>;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * CollapsibleSection Component
 *
 * @example
 * ```tsx
 * <CollapsibleSection
 *   title="Smart Inspector"
 *   icon="📸"
 *   defaultExpanded={true}
 *   storageKey="section-home-smart-inspector"
 * >
 *   <NavigationCard icon="camera" label="Start Inspection" />
 *   <NavigationCard icon="list" label="Continue Inspection" />
 * </CollapsibleSection>
 * ```
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultExpanded = true,
  children,
  icon,
  headerColor,
  headerTextColor,
  storageKey,
  disabled = false,
  onExpandedChange,
  containerStyle,
  headerStyle,
  contentStyle,
  testID = 'collapsible-section',
}) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(!!storageKey);
  const rotateAnimation = useRef(
    new Animated.Value(defaultExpanded ? 1 : 0),
  ).current;

  // Load persisted state from AsyncStorage
  useEffect(() => {
    const loadExpandedState = async () => {
      if (!storageKey) {
        setIsLoading(false);
        return;
      }

      try {
        const storedValue = await AsyncStorage.getItem(storageKey);
        if (storedValue !== null) {
          const isExpanded = storedValue === 'true';
          setExpanded(isExpanded);
          rotateAnimation.setValue(isExpanded ? 1 : 0);
        }
      } catch (error) {
        console.warn(
          `[CollapsibleSection] Failed to load state for ${storageKey}:`,
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadExpandedState();
  }, [storageKey, rotateAnimation]);

  // Save expanded state to AsyncStorage
  const saveExpandedState = useCallback(
    async (isExpanded: boolean) => {
      if (!storageKey) return;

      try {
        await AsyncStorage.setItem(storageKey, String(isExpanded));
      } catch (error) {
        console.warn(
          `[CollapsibleSection] Failed to save state for ${storageKey}:`,
          error,
        );
      }
    },
    [storageKey],
  );

  // Toggle expanded state with animation
  const toggleExpanded = useCallback(() => {
    if (disabled) return;

    // Configure smooth animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    // Animate chevron rotation
    Animated.timing(rotateAnimation, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Save to AsyncStorage
    saveExpandedState(newExpandedState);

    // Notify parent component
    if (onExpandedChange) {
      onExpandedChange(newExpandedState);
    }
  }, [
    disabled,
    expanded,
    rotateAnimation,
    saveExpandedState,
    onExpandedChange,
  ]);

  // Chevron rotation interpolation
  const rotateInterpolation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Don't render until AsyncStorage state is loaded
  if (isLoading) {
    return null; // Or return a loading skeleton if preferred
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        containerStyle,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${title} section, ${
        expanded ? 'expanded' : 'collapsed'
      }`}
    >
      {/* Header */}
      <TouchableOpacity
        style={[
          styles.header,
          {
            backgroundColor: headerColor || theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
          expanded ? styles.headerExpanded : styles.headerCollapsed,
          headerStyle,
        ]}
        onPress={toggleExpanded}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
        testID={`${testID}-header`}
        accessibilityRole="button"
        accessibilityHint={
          disabled
            ? 'Section is always expanded'
            : `${expanded ? 'Collapse' : 'Expand'} ${title} section`
        }
      >
        {/* Icon (optional) */}
        {icon && (
          <View style={styles.iconContainer}>
            <ThemedText variant="h5" testID={`${testID}-icon`}>
              {icon}
            </ThemedText>
          </View>
        )}

        {/* Title */}
        <View style={styles.titleContainer}>
          <ThemedText
            variant="h5"
            style={headerTextColor ? { color: headerTextColor } : undefined}
            testID={`${testID}-title`}
          >
            {title}
          </ThemedText>
        </View>

        {/* Chevron indicator */}
        {!disabled && (
          <Animated.View
            style={[
              styles.chevronContainer,
              { transform: [{ rotate: rotateInterpolation }] },
            ]}
          >
            <ThemedText
              variant="h5"
              style={{ color: theme.colors.textSecondary }}
              testID={`${testID}-chevron`}
            >
              ⌄
            </ThemedText>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View
          style={[styles.content, contentStyle]}
          testID={`${testID}-content`}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56, // Touch-friendly minimum height
  },
  headerExpanded: {
    borderBottomWidth: 1,
  },
  headerCollapsed: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  chevronContainer: {
    marginLeft: 12,
    width: 24,
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
});

export default CollapsibleSection;
