/**
 * OnboardingScreen Component
 *
 * Welcome screen for new users after email verification.
 * Provides three onboarding options:
 * 1. Sign up for a membership plan
 * 2. Join an existing team
 * 3. Preview the app as a guest
 *
 * Features:
 * - Clean, welcoming UI with user's name
 * - Three clear action cards
 * - Theme-aware styling
 * - Navigation to appropriate flows
 *
 * @screen
 */

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { completeOnboarding } from '@/redux/slices/auth.slice';
import { useTheme } from '@/theme';
import type React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ThemedText, ThemedView } from '../../components/common';

interface OnboardingScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Get user's first name for personalized greeting
  const firstName = user?.firstName || 'there';

  /**
   * Handle sign up for membership
   * Marks onboarding as complete before navigation
   */
  const handleSignUpMembership = async () => {
    await dispatch(completeOnboarding()).unwrap();
    navigation.navigate('MembershipDetails');
  };

  /**
   * Handle join team
   * Marks onboarding as complete before navigation
   */
  const handleJoinTeam = async () => {
    await dispatch(completeOnboarding()).unwrap();
    navigation.navigate('JoinTeamInspection');
  };

  /**
   * Handle preview app
   * Marks onboarding as complete before navigation
   */
  const handlePreviewApp = async () => {
    await dispatch(completeOnboarding()).unwrap();
    navigation.navigate('Home');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h1" style={styles.title}>
            Welcome, {firstName}! 👋
          </ThemedText>
          <ThemedText variant="body1" color="secondary" style={styles.subtitle}>
            Let's get you started with Smart Inspector Pro
          </ThemedText>
        </View>

        {/* Onboarding Options */}
        <View style={styles.optionsContainer}>
          {/* Option 1: Sign Up for Membership */}
          <Card style={styles.optionCard} elevation="medium">
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary + '20' },
                ]}
              >
                <ThemedText variant="h2" style={styles.icon}>
                  💼
                </ThemedText>
              </View>
              <ThemedText variant="h3" style={styles.optionTitle}>
                Get a Membership
              </ThemedText>
            </View>
            <ThemedText
              variant="body2"
              color="secondary"
              style={styles.optionDescription}
            >
              Choose a subscription plan that fits your needs. Professional or
              Enterprise with full access to all features.
            </ThemedText>
            <Button
              title="View Plans"
              onPress={handleSignUpMembership}
              variant="primary"
              fullWidth
              style={styles.optionButton}
            />
          </Card>

          {/* Option 2: Join a Team */}
          <Card style={styles.optionCard} elevation="medium">
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.secondary + '20' },
                ]}
              >
                <ThemedText variant="h2" style={styles.icon}>
                  👥
                </ThemedText>
              </View>
              <ThemedText variant="h3" style={styles.optionTitle}>
                Join a Team
              </ThemedText>
            </View>
            <ThemedText
              variant="body2"
              color="secondary"
              style={styles.optionDescription}
            >
              Have a team invitation code? Join your team to collaborate on
              inspections together.
            </ThemedText>
            <Button
              title="Join Team"
              onPress={handleJoinTeam}
              variant="secondary"
              fullWidth
              style={styles.optionButton}
            />
          </Card>

          {/* Option 3: Preview App */}
          <Card style={styles.optionCard} elevation="medium">
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.info + '20' },
                ]}
              >
                <ThemedText variant="h2" style={styles.icon}>
                  👀
                </ThemedText>
              </View>
              <ThemedText variant="h3" style={styles.optionTitle}>
                Preview the App
              </ThemedText>
            </View>
            <ThemedText
              variant="body2"
              color="secondary"
              style={styles.optionDescription}
            >
              Take a look around and explore the features before committing to a
              plan. Full access with limited functionality.
            </ThemedText>
            <Button
              title="Preview Now"
              onPress={handlePreviewApp}
              variant="outline"
              fullWidth
              style={styles.optionButton}
            />
          </Card>
        </View>

        {/* Footer Help Text */}
        <View style={styles.footer}>
          <ThemedText
            variant="caption"
            color="secondary"
            style={styles.footerText}
          >
            You can change these settings anytime in your account settings
          </ThemedText>
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    padding: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  optionTitle: {
    flex: 1,
  },
  optionDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  optionButton: {
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});

export default OnboardingScreen;
