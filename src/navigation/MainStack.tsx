/**
 * Main Stack Navigator
 *
 * Navigation stack for main authenticated app flow.
 * Contains all primary app screens organized by feature area.
 *
 * Created: Phase 8, Task P8-T01
 *
 * Screen Organization:
 * - Home: Landing screen with collapsible sections
 * - Smart Inspector: Inspection workflow screens (5 screens)
 * - Business Management: Calendar, contacts, team, accounting (5 screens)
 * - Inspection Management: Workflows, reports, forms, data (6 screens)
 * - App Management: Settings, membership, store, help (5 screens)
 *
 * Features:
 * - Theme-aware header styling
 * - Type-safe navigation with MainStackParamList
 * - Placeholder screens for screens not yet implemented
 * - Consistent header configuration across all screens
 *
 * Total Screens: 24
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';
import { useTheme } from '../theme';
import type { MainStackParamList } from './types';

// Import existing screens
import HomeScreen from '../screens/home/HomeScreen';

// Placeholder for screens not yet implemented
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Main Stack Navigator Component
 * Provides navigation structure for authenticated users
 *
 * @returns Main stack navigator with all app screens
 */
export const MainStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerShadowVisible: true,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      {/* ===== HOME SCREEN ===== */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Smart Inspector Pro',
          headerShown: true,
        }}
      />

      {/* ===== SMART INSPECTOR SECTION (5 screens) ===== */}
      <Stack.Screen
        name="ScheduleInspection"
        component={PlaceholderScreen}
        options={{
          title: 'Schedule Inspection',
        }}
      />
      <Stack.Screen
        name="ContinueInspection"
        component={PlaceholderScreen}
        options={{
          title: 'Continue Inspection',
        }}
      />
      <Stack.Screen
        name="JoinTeamInspection"
        component={PlaceholderScreen}
        options={{
          title: 'Join Team Inspection',
        }}
      />
      <Stack.Screen
        name="NewInspection"
        component={PlaceholderScreen}
        options={{
          title: 'New Inspection',
        }}
      />
      <Stack.Screen
        name="SmartInspectorWorkflow"
        component={PlaceholderScreen}
        options={{
          title: 'Smart Inspector',
        }}
      />

      {/* ===== BUSINESS MANAGEMENT SECTION (5 screens) ===== */}
      <Stack.Screen
        name="Calendar"
        component={PlaceholderScreen}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="Contacts"
        component={PlaceholderScreen}
        options={{
          title: 'Contacts',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={PlaceholderScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="TeamManagement"
        component={PlaceholderScreen}
        options={{
          title: 'Team Management',
        }}
      />
      <Stack.Screen
        name="Accounting"
        component={PlaceholderScreen}
        options={{
          title: 'Accounting',
        }}
      />

      {/* ===== INSPECTION MANAGEMENT SECTION (6 screens) ===== */}
      <Stack.Screen
        name="WorkflowEditor"
        component={PlaceholderScreen}
        options={{
          title: 'Workflow Editor',
        }}
      />
      <Stack.Screen
        name="MyInspections"
        component={PlaceholderScreen}
        options={{
          title: 'My Inspections',
        }}
      />
      <Stack.Screen
        name="ReportTemplates"
        component={PlaceholderScreen}
        options={{
          title: 'Report Templates',
        }}
      />
      <Stack.Screen
        name="InspectionForms"
        component={PlaceholderScreen}
        options={{
          title: 'Inspection Forms',
        }}
      />
      <Stack.Screen
        name="InspectionData"
        component={PlaceholderScreen}
        options={{
          title: 'Inspection Data',
        }}
      />
      <Stack.Screen
        name="InspectionDetails"
        component={PlaceholderScreen}
        options={{
          title: 'Inspection Details',
        }}
      />

      {/* ===== APP MANAGEMENT SECTION (5 screens) ===== */}
      <Stack.Screen
        name="DataManagement"
        component={PlaceholderScreen}
        options={{
          title: 'Data Management',
        }}
      />
      <Stack.Screen
        name="MembershipDetails"
        component={PlaceholderScreen}
        options={{
          title: 'Membership',
        }}
      />
      <Stack.Screen
        name="Store"
        component={PlaceholderScreen}
        options={{
          title: 'Store',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={PlaceholderScreen}
        options={{
          title: 'Help & Support',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
