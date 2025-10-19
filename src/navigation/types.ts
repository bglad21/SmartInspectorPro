/**
 * Navigation Type Definitions
 *
 * TypeScript types for type-safe navigation throughout the app.
 * Use these types with useNavigation hook for compile-time navigation safety.
 *
 * Created: Phase 8, Task P8-T01
 *
 * @example
 * ```tsx
 * import { NavigationProp } from '@react-navigation/native';
 * import { MainStackParamList } from '@/navigation/types';
 *
 * type Props = {
 *   navigation: NavigationProp<MainStackParamList, 'Home'>;
 * };
 * ```
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============================================================================
// Auth Stack Parameter List
// ============================================================================

/**
 * Auth Stack Parameter List
 *
 * Defines all screens in the authentication flow and their parameters.
 */
export type AuthStackParamList = {
  /**
   * Login Screen
   * User signs in with email and password
   */
  Login: undefined;

  /**
   * Register Screen
   * New user creates an account
   */
  Register: undefined;

  /**
   * Forgot Password Screen
   * User requests password reset email
   */
  ForgotPassword: undefined;

  /**
   * Verify Email Screen
   * User enters verification code sent to email
   * @param email - Email address to verify
   * @param username - Username (email) for verification
   */
  VerifyEmail: {
    email: string;
    username: string;
  };
};

// ============================================================================
// Main Stack Parameter List
// ============================================================================

/**
 * Main Stack Parameter List
 *
 * Defines all screens in the main app and their parameters.
 * Organized by feature sections matching home screen.
 */
export type MainStackParamList = {
  /**
   * Home Screen
   * Main dashboard with collapsible sections and navigation cards
   */
  Home: undefined;

  // ========================================
  // Smart Inspector Section
  // ========================================

  /**
   * Schedule Inspection Screen
   * Create a new inspection appointment
   */
  ScheduleInspection: undefined;

  /**
   * Continue Inspection Screen
   * Resume an in-progress inspection
   */
  ContinueInspection: undefined;

  /**
   * Join Team Inspection Screen
   * Join a team inspection via code or invitation
   */
  JoinTeamInspection: undefined;

  /**
   * New Inspection Screen
   * Start a brand new inspection
   */
  NewInspection: undefined;

  /**
   * Smart Inspector Workflow Screen
   * Main inspection workflow with 6-step hierarchy
   * @param inspectionId - ID of the inspection to work on
   */
  SmartInspectorWorkflow: {
    inspectionId: string;
  };

  // ========================================
  // Business Management Section
  // ========================================

  /**
   * Calendar Screen
   * View and manage inspection schedule
   */
  Calendar: undefined;

  /**
   * Contacts Screen
   * Manage clients and contacts
   */
  Contacts: undefined;

  /**
   * Notifications Screen
   * View app notifications and alerts
   */
  Notifications: undefined;

  /**
   * Team Management Screen
   * Manage team members and permissions
   */
  TeamManagement: undefined;

  /**
   * Accounting Screen
   * Track income, expenses, and financial reports
   */
  Accounting: undefined;

  // ========================================
  // Inspection Management Section
  // ========================================

  /**
   * Workflow Editor Screen
   * Create and edit custom inspection workflows
   */
  WorkflowEditor: undefined;

  /**
   * My Inspections Screen
   * View all inspections (completed, in-progress, scheduled)
   */
  MyInspections: undefined;

  /**
   * Report Templates Screen
   * Manage report templates
   */
  ReportTemplates: undefined;

  /**
   * Inspection Forms Screen
   * Digital forms and signatures
   */
  InspectionForms: undefined;

  /**
   * Inspection Data Screen
   * View and filter CSV data (Single_Family.csv)
   */
  InspectionData: undefined;

  /**
   * Inspection Details Screen
   * View detailed information about a specific inspection
   * @param inspectionId - ID of the inspection to view
   */
  InspectionDetails: {
    inspectionId: string;
  };

  // ========================================
  // App Management Section
  // ========================================

  /**
   * Data Management Screen
   * Manage local/cloud data sync and storage
   */
  DataManagement: undefined;

  /**
   * Membership Details Screen
   * View current subscription tier and usage
   */
  MembershipDetails: undefined;

  /**
   * Store Screen
   * Browse and purchase marketplace items
   */
  Store: undefined;

  /**
   * Settings Screen
   * App settings and preferences
   */
  Settings: undefined;

  /**
   * Help & Support Screen
   * Access help documentation and support
   */
  HelpSupport: undefined;
};

// ============================================================================
// Root Stack Parameter List
// ============================================================================

/**
 * Root Stack Parameter List
 *
 * Top-level navigator that switches between Auth and Main stacks
 * based on authentication state.
 */
export type RootStackParamList = {
  /**
   * Auth Stack
   * Contains all authentication screens (Login, Register, etc.)
   */
  Auth: NavigatorScreenParams<AuthStackParamList>;

  /**
   * Main Stack
   * Contains all main app screens (Home, Inspections, etc.)
   */
  Main: NavigatorScreenParams<MainStackParamList>;
};

// ============================================================================
// Navigation Prop Types (for convenience)
// ============================================================================

/**
 * Auth Navigation Prop
 * Use this type in auth screen components
 */
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

/**
 * Main Navigation Prop
 * Use this type in main app screen components
 */
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Root Navigation Prop
 * Use this type for root-level navigation
 */
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a route belongs to Auth stack
 */
export const isAuthRoute = (
  routeName: string,
): routeName is keyof AuthStackParamList => {
  return ['Login', 'Register', 'ForgotPassword', 'VerifyEmail'].includes(
    routeName,
  );
};

/**
 * Type guard to check if a route belongs to Main stack
 */
export const isMainRoute = (
  routeName: string,
): routeName is keyof MainStackParamList => {
  return [
    'Home',
    'ScheduleInspection',
    'ContinueInspection',
    'JoinTeamInspection',
    'NewInspection',
    'SmartInspectorWorkflow',
    'Calendar',
    'Contacts',
    'Notifications',
    'TeamManagement',
    'Accounting',
    'WorkflowEditor',
    'MyInspections',
    'ReportTemplates',
    'InspectionForms',
    'InspectionData',
    'InspectionDetails',
    'DataManagement',
    'MembershipDetails',
    'Store',
    'Settings',
    'HelpSupport',
  ].includes(routeName);
};
