/**
 * Theme Demo Component
 *
 * Demonstrates theme system functionality and all theme features.
 * Shows colors, typography, spacing, and theme switching.
 *
 * This is for testing P6-T01 completion.
 */

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { useTheme } from '@/theme';
import type React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export const ThemeDemo: React.FC = () => {
  const { theme, isDark, toggleTheme, themeMode } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.section}>
          <ThemedText variant="h1">Theme System Demo</ThemedText>
          <ThemedText variant="body2" color="textSecondary">
            Smart Inspector Pro - P6-T01 Complete
          </ThemedText>
        </View>

        {/* Theme Toggle */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Theme Controls</ThemedText>
          <View style={styles.themeInfo}>
            <ThemedText variant="body1">
              Current Mode: <ThemedText color="primary">{themeMode}</ThemedText>
            </ThemedText>
            <ThemedText variant="body1">
              Active Theme:{' '}
              <ThemedText color="primary">
                {isDark ? 'Dark' : 'Light'}
              </ThemedText>
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={toggleTheme}
          >
            <ThemedText variant="button" style={styles.buttonText}>
              Toggle Theme
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Typography Showcase */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Typography</ThemedText>
          <ThemedText variant="h1">Heading 1</ThemedText>
          <ThemedText variant="h2">Heading 2</ThemedText>
          <ThemedText variant="h3">Heading 3</ThemedText>
          <ThemedText variant="h4">Heading 4</ThemedText>
          <ThemedText variant="h5">Heading 5</ThemedText>
          <ThemedText variant="h6">Heading 6</ThemedText>
          <ThemedText variant="body1">Body 1 - Regular text</ThemedText>
          <ThemedText variant="body2">Body 2 - Secondary text</ThemedText>
          <ThemedText variant="caption">Caption text</ThemedText>
          <ThemedText variant="overline">OVERLINE TEXT</ThemedText>
        </View>

        {/* Color Palette */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Colors</ThemedText>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <ThemedText variant="body1">Primary</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.secondary },
              ]}
            />
            <ThemedText variant="body1">Secondary</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <ThemedText variant="body1">Success</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.warning },
              ]}
            />
            <ThemedText variant="body1">Warning</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.error },
              ]}
            />
            <ThemedText variant="body1">Error</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.info },
              ]}
            />
            <ThemedText variant="body1">Info</ThemedText>
          </View>
        </View>

        {/* Inspection Condition Colors */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Inspection Conditions</ThemedText>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.acceptable },
              ]}
            />
            <ThemedText variant="body1">Acceptable</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.monitor },
              ]}
            />
            <ThemedText variant="body1">Monitor</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.repair },
              ]}
            />
            <ThemedText variant="body1">Repair/Replace</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.safetyHazard },
              ]}
            />
            <ThemedText variant="body1">Safety Hazard</ThemedText>
          </View>
          <View style={styles.colorRow}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: theme.colors.accessRestricted },
              ]}
            />
            <ThemedText variant="body1">Access Restricted</ThemedText>
          </View>
        </View>

        {/* Spacing Demo */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Spacing Scale</ThemedText>
          <ThemedText variant="body2" color="textSecondary">
            xs: {theme.spacing.xs}px, sm: {theme.spacing.sm}px, md:{' '}
            {theme.spacing.md}px
          </ThemedText>
          <ThemedText variant="body2" color="textSecondary">
            lg: {theme.spacing.lg}px, xl: {theme.spacing.xl}px, xxl:{' '}
            {theme.spacing.xxl}px
          </ThemedText>
        </View>

        {/* Border Radius Demo */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Border Radius</ThemedText>
          <View style={styles.radiusRow}>
            <View
              style={[
                styles.radiusBox,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.sm,
                },
              ]}
            />
            <ThemedText variant="caption">
              sm ({theme.borderRadius.sm}px)
            </ThemedText>
          </View>
          <View style={styles.radiusRow}>
            <View
              style={[
                styles.radiusBox,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            />
            <ThemedText variant="caption">
              md ({theme.borderRadius.md}px)
            </ThemedText>
          </View>
          <View style={styles.radiusRow}>
            <View
              style={[
                styles.radiusBox,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.lg,
                },
              ]}
            />
            <ThemedText variant="caption">
              lg ({theme.borderRadius.lg}px)
            </ThemedText>
          </View>
          <View style={styles.radiusRow}>
            <View
              style={[
                styles.radiusBox,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xl,
                },
              ]}
            />
            <ThemedText variant="caption">
              xl ({theme.borderRadius.xl}px)
            </ThemedText>
          </View>
        </View>

        {/* Shadow Demo */}
        <View
          style={[
            styles.section,
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ThemedText variant="h3">Shadows</ThemedText>
          <View
            style={[
              styles.shadowBox,
              { backgroundColor: theme.colors.surface },
              theme.shadows.small,
            ]}
          >
            <ThemedText variant="body2">Small Shadow</ThemedText>
          </View>
          <View
            style={[
              styles.shadowBox,
              { backgroundColor: theme.colors.surface },
              theme.shadows.medium,
            ]}
          >
            <ThemedText variant="body2">Medium Shadow</ThemedText>
          </View>
          <View
            style={[
              styles.shadowBox,
              { backgroundColor: theme.colors.surface },
              theme.shadows.large,
            ]}
          >
            <ThemedText variant="body2">Large Shadow</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  themeInfo: {
    marginVertical: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radiusBox: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  shadowBox: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
});

export default ThemeDemo;
