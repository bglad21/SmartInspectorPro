/**
 * ComponentsDemo Screen
 *
 * Demonstrates all themed UI components from P6-T02.
 * This screen showcases Button, Card, Badge, Modal, LoadingSpinner, and EmptyState components.
 *
 * @screen
 */

import type React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import {
  ThemedView,
  ThemedText,
  Button,
  Card,
  Badge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '@/components/common';

export const ComponentsDemo: React.FC = () => {
  const { theme, toggleTheme, themeMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <ThemedView variant="surface" style={styles.header}>
          <ThemedText variant="h2">Components Demo</ThemedText>
          <ThemedText variant="body2" color="textSecondary">
            Current theme: {themeMode}
          </ThemedText>
          <Button
            title="Toggle Theme"
            onPress={toggleTheme}
            variant="outline"
            size="small"
            style={styles.themeButton}
          />
        </ThemedView>

        {/* Button Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Buttons
          </ThemedText>

          <View style={styles.buttonRow}>
            <Button title="Primary" variant="primary" size="medium" />
            <Button title="Secondary" variant="secondary" size="medium" />
          </View>

          <View style={styles.buttonRow}>
            <Button title="Outline" variant="outline" size="medium" />
            <Button title="Text" variant="text" size="medium" />
          </View>

          <View style={styles.buttonRow}>
            <Button title="Small" size="small" />
            <Button title="Medium" size="medium" />
            <Button title="Large" size="large" />
          </View>

          <View style={styles.buttonRow}>
            <Button title="Success" color="success" size="medium" />
            <Button title="Warning" color="warning" size="medium" />
            <Button title="Error" color="error" size="medium" />
          </View>

          <Button
            title="Loading"
            loading={loading}
            onPress={handleLoadingTest}
            fullWidth
          />

          <Button title="Disabled" disabled fullWidth style={styles.marginTop} />
        </Card>

        {/* Badge Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Badges
          </ThemedText>

          <View style={styles.badgeRow}>
            <Badge label="Primary" variant="primary" size="medium" />
            <Badge label="Secondary" variant="secondary" size="medium" />
            <Badge label="Info" variant="info" size="medium" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="Success" variant="success" size="medium" />
            <Badge label="Warning" variant="warning" size="medium" />
            <Badge label="Error" variant="error" size="medium" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="Small" variant="primary" size="small" />
            <Badge label="Medium" variant="primary" size="medium" />
            <Badge label="Large" variant="primary" size="large" />
          </View>

          <ThemedText variant="body2" style={styles.subsectionTitle}>
            Inspection Conditions
          </ThemedText>

          <View style={styles.badgeRow}>
            <Badge label="Acceptable" variant="acceptable" size="medium" />
            <Badge label="Monitor" variant="monitor" size="medium" />
            <Badge label="Repair" variant="repair" size="medium" />
          </View>

          <View style={styles.badgeRow}>
            <Badge label="Safety Hazard" variant="safetyHazard" size="medium" />
            <Badge label="Access Restricted" variant="accessRestricted" size="medium" />
          </View>
        </Card>

        {/* Card Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Cards
          </ThemedText>

          <Card elevation="small" padding="md" style={styles.nestedCard}>
            <ThemedText variant="h5">Small Elevation</ThemedText>
            <ThemedText variant="body2" color="textSecondary">
              This card has small elevation
            </ThemedText>
          </Card>

          <Card elevation="medium" padding="md" style={styles.nestedCard}>
            <ThemedText variant="h5">Medium Elevation</ThemedText>
            <ThemedText variant="body2" color="textSecondary">
              This card has medium elevation
            </ThemedText>
          </Card>

          <Card elevation="large" padding="md" style={styles.nestedCard}>
            <ThemedText variant="h5">Large Elevation</ThemedText>
            <ThemedText variant="body2" color="textSecondary">
              This card has large elevation
            </ThemedText>
          </Card>

          <Card
            elevation="medium"
            padding="md"
            onPress={() => console.log('Card tapped!')}
            style={styles.nestedCard}
          >
            <ThemedText variant="h5">Tappable Card</ThemedText>
            <ThemedText variant="body2" color="textSecondary">
              Tap me!
            </ThemedText>
          </Card>
        </Card>

        {/* Modal Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Modal
          </ThemedText>

          <Button
            title="Open Modal"
            onPress={() => setModalVisible(true)}
            fullWidth
          />

          <Modal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title="Sample Modal"
            size="medium"
            showCloseButton
          >
            <ThemedText variant="body1" style={styles.modalText}>
              This is a sample modal dialog. It can contain any content you need.
            </ThemedText>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                variant="primary"
                onPress={() => {
                  setModalVisible(false);
                  console.log('Confirmed!');
                }}
                style={styles.modalButton}
              />
            </View>
          </Modal>
        </Card>

        {/* LoadingSpinner Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Loading Spinner
          </ThemedText>

          <LoadingSpinner size="small" style={styles.spinner} />
          <LoadingSpinner size="large" style={styles.spinner} />
          <LoadingSpinner
            size="large"
            message="Loading data..."
            style={styles.spinner}
          />
        </Card>

        {/* EmptyState Showcase */}
        <Card elevation="medium" padding="lg">
          <ThemedText variant="h3" style={styles.sectionTitle}>
            Empty State
          </ThemedText>

          <EmptyState
            icon="📋"
            title="No Data Found"
            description="There are no items to display at this time."
          />

          <EmptyState
            icon="🔍"
            title="Search Results"
            description="We couldn't find any matching results."
            actionLabel="Clear Search"
            onAction={() => console.log('Search cleared!')}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeButton: {
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  marginTop: {
    marginTop: 12,
  },
  nestedCard: {
    marginBottom: 12,
  },
  modalText: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  spinner: {
    marginVertical: 16,
  },
});

export default ComponentsDemo;
