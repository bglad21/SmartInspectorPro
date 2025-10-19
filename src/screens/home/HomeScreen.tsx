/**
 * Home Screen
 *
 * Main landing screen displayed after user authentication.
 * Features collapsible sections with navigation cards organized by feature area.
 *
 * Created: Phase 8, Task P8-T02
 *
 * Layout:
 * - Header: User greeting + notifications icon
 * - Smart Inspector: 4 inspection workflow cards
 * - Business Management: 5 business tool cards
 * - Inspection Management: 5 inspection asset cards
 * - App Management: 5 app settings cards
 *
 * Features:
 * - Collapsible sections with persistence
 * - Theme-aware styling
 * - Type-safe navigation
 * - Responsive grid layout
 * - Smooth scrolling
 */

import type React from 'react';
import { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@/theme';
import { useAppSelector } from '@/redux/hooks';
import type { MainStackParamList } from '@/navigation/types';
import ThemedView from '@/components/common/ThemedView';
import ThemedText from '@/components/common/ThemedText';
import CollapsibleSection from '@/components/common/CollapsibleSection';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARDS_PER_ROW = SCREEN_WIDTH > 768 ? 3 : 2; // 3 columns on tablet, 2 on phone
const CARD_WIDTH = (SCREEN_WIDTH - (CARD_PADDING * 2) - (CARD_GAP * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

/**
 * Navigation Card Props
 */
interface NavigationCardProps {
  /**
   * Card title
   */
  title: string;

  /**
   * Icon name from MaterialCommunityIcons
   */
  icon: string;

  /**
   * Icon color (optional, defaults to primary)
   */
  iconColor?: string;

  /**
   * Card subtitle/description (optional)
   */
  subtitle?: string;

  /**
   * Navigation handler
   */
  onPress: () => void;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Navigation Card Component
 * Displays an actionable card with icon, title, and optional subtitle
 */
const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  icon,
  iconColor,
  subtitle,
  onPress,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          width: CARD_WIDTH,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.cardContent}>
        <Icon
          name={icon}
          size={32}
          color={iconColor || theme.colors.primary}
          style={styles.cardIcon}
        />
        <ThemedText variant="body1" style={styles.cardTitle} numberOfLines={2}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            variant="caption"
            style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Home Screen Component
 */
const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAppSelector((state) => state.auth);

  // Extract first name from user profile for greeting
  // Username is typically an email, so extract the part before @
  const firstName = user?.businessName || user?.username?.split('@')[0] || 'Inspector';

  // Navigation handlers for each card
  const handleNavigation = useCallback(
    <T extends keyof MainStackParamList>(screen: T) => {
      // @ts-expect-error - Navigation with keyof requires runtime screen name
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {/* User Greeting */}
          <View style={styles.greetingContainer}>
            <ThemedText variant="h4" style={styles.greeting}>
              Hello, {firstName}
            </ThemedText>
            <ThemedText
              variant="body2"
              style={[styles.subGreeting, { color: theme.colors.textSecondary }]}
            >
              Ready to inspect today?
            </ThemedText>
          </View>

          {/* Notifications Icon */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => handleNavigation('Notifications')}
            accessibilityRole="button"
            accessibilityLabel="View notifications"
          >
            <Icon name="bell-outline" size={28} color={theme.colors.text} />
            {/* Notification badge (placeholder) */}
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: theme.colors.error },
              ]}
            >
              <ThemedText variant="caption" style={styles.badgeText}>
                3
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Scrollable Sections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== SMART INSPECTOR SECTION ===== */}
        <CollapsibleSection
          title="Smart Inspector"
          icon="clipboard-check-outline"
          defaultExpanded={true}
          storageKey="home_smart_inspector_expanded"
          headerColor={theme.colors.primary}
          headerTextColor={theme.colors.surface}
        >
          <View style={styles.cardsContainer}>
            <NavigationCard
              title="Schedule Inspection"
              icon="calendar-plus"
              subtitle="Create new appointment"
              onPress={() => handleNavigation('ScheduleInspection')}
            />
            <NavigationCard
              title="Continue Inspection"
              icon="progress-clock"
              subtitle="Resume in progress"
              onPress={() => handleNavigation('ContinueInspection')}
            />
            <NavigationCard
              title="Join Team Inspection"
              icon="account-multiple-plus"
              subtitle="Enter team code"
              onPress={() => handleNavigation('JoinTeamInspection')}
            />
            <NavigationCard
              title="New Inspection"
              icon="home-plus-outline"
              subtitle="Start from scratch"
              onPress={() => handleNavigation('NewInspection')}
            />
          </View>
        </CollapsibleSection>

        {/* ===== BUSINESS MANAGEMENT SECTION ===== */}
        <CollapsibleSection
          title="Business Management"
          icon="briefcase-outline"
          defaultExpanded={false}
          storageKey="home_business_expanded"
        >
          <View style={styles.cardsContainer}>
            <NavigationCard
              title="Calendar"
              icon="calendar-month"
              subtitle="View schedule"
              onPress={() => handleNavigation('Calendar')}
            />
            <NavigationCard
              title="Contacts"
              icon="account-multiple-outline"
              subtitle="Manage clients"
              onPress={() => handleNavigation('Contacts')}
            />
            <NavigationCard
              title="Notifications"
              icon="bell-outline"
              subtitle="View alerts"
              onPress={() => handleNavigation('Notifications')}
            />
            <NavigationCard
              title="Team Management"
              icon="account-group"
              subtitle="Manage team"
              onPress={() => handleNavigation('TeamManagement')}
            />
            <NavigationCard
              title="Accounting"
              icon="calculator"
              subtitle="Track finances"
              onPress={() => handleNavigation('Accounting')}
            />
          </View>
        </CollapsibleSection>

        {/* ===== INSPECTION MANAGEMENT SECTION ===== */}
        <CollapsibleSection
          title="Inspection Management"
          icon="file-document-multiple-outline"
          defaultExpanded={false}
          storageKey="home_inspection_expanded"
        >
          <View style={styles.cardsContainer}>
            <NavigationCard
              title="Workflow Editor"
              icon="file-tree-outline"
              subtitle="Create workflows"
              onPress={() => handleNavigation('WorkflowEditor')}
            />
            <NavigationCard
              title="My Inspections"
              icon="clipboard-list-outline"
              subtitle="View history"
              onPress={() => handleNavigation('MyInspections')}
            />
            <NavigationCard
              title="Report Templates"
              icon="file-document-edit-outline"
              subtitle="Customize reports"
              onPress={() => handleNavigation('ReportTemplates')}
            />
            <NavigationCard
              title="Inspection Forms"
              icon="form-select"
              subtitle="Digital forms"
              onPress={() => handleNavigation('InspectionForms')}
            />
            <NavigationCard
              title="Inspection Data"
              icon="database-outline"
              subtitle="Manage data"
              onPress={() => handleNavigation('InspectionData')}
            />
          </View>
        </CollapsibleSection>

        {/* ===== APP MANAGEMENT SECTION ===== */}
        <CollapsibleSection
          title="App Management"
          icon="cog-outline"
          defaultExpanded={false}
          storageKey="home_app_expanded"
        >
          <View style={styles.cardsContainer}>
            <NavigationCard
              title="Data Management"
              icon="cloud-sync-outline"
              subtitle="Sync & backup"
              onPress={() => handleNavigation('DataManagement')}
            />
            <NavigationCard
              title="Membership Details"
              icon="card-account-details-outline"
              subtitle="View plan"
              onPress={() => handleNavigation('MembershipDetails')}
            />
            <NavigationCard
              title="Store"
              icon="store-outline"
              subtitle="Browse add-ons"
              onPress={() => handleNavigation('Store')}
            />
            <NavigationCard
              title="Settings"
              icon="cog"
              subtitle="App preferences"
              onPress={() => handleNavigation('Settings')}
            />
            <NavigationCard
              title="Help & Support"
              icon="help-circle-outline"
              subtitle="Get assistance"
              onPress={() => handleNavigation('HelpSupport')}
            />
          </View>
        </CollapsibleSection>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    marginBottom: 4,
  },
  subGreeting: {
    marginTop: 0,
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default HomeScreen;
