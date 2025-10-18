# Screens Directory

Full-screen views for the Smart Inspector Pro app. Each screen is a route in the navigation system.

## Structure

### `home/` - Home Dashboard

Main landing screen after login with navigation to all features.

**Screens:**

- `HomeScreen.tsx` - Dashboard with feature cards and quick actions

### `auth/` - Authentication

Login, registration, and password management.

**Screens:**

- `LoginScreen.tsx` - Email/password login
- `RegisterScreen.tsx` - New user registration
- `ForgotPasswordScreen.tsx` - Password reset
- `VerifyEmailScreen.tsx` - Email verification (Cognito)

### `inspection/` - Smart Inspector Workflow

Core inspection functionality with AI-powered photo analysis.

**Screens:**

- `InspectionListScreen.tsx` - List of all inspections (active, completed, scheduled)
- `CreateInspectionScreen.tsx` - New inspection form
- `SmartInspectorScreen.tsx` - 6-step hierarchical workflow (photo → AI → manual)
- `InspectionDetailScreen.tsx` - View/edit inspection records
- `PhotoGalleryScreen.tsx` - All photos for an inspection

### `workflow/` - Workflow Management

Create and edit custom inspection workflows.

**Screens:**

- `WorkflowEditorScreen.tsx` - Drag-and-drop CSV filtering interface
- `WorkflowListScreen.tsx` - Saved workflows (default + custom)
- `WorkflowShareScreen.tsx` - Share workflow via code/QR

### `business/` - Business Tools

Tools for managing inspection business operations.

**Screens:**

- `SchedulingScreen.tsx` - Calendar and appointment management
- `ContactsScreen.tsx` - Client contact database
- `AccountingScreen.tsx` - Revenue tracking and expense management
- `ReportsScreen.tsx` - Generate and view PDF reports
- `FormsScreen.tsx` - Digital forms and signature capture

### `settings/` - App Settings

User preferences, account management, and app configuration.

**Screens:**

- `SettingsScreen.tsx` - Main settings menu
- `ProfileScreen.tsx` - Edit user profile
- `SubscriptionScreen.tsx` - Manage membership tier
- `DataManagementScreen.tsx` - Cloud sync, storage, backups
- `ThemeScreen.tsx` - Light/dark mode and color preferences

## Screen Standards

### File Structure

```typescript
// HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Navigation Types

Define route params in `navigation/types.ts`:

```typescript
export type RootStackParamList = {
  Home: undefined;
  InspectionDetail: { inspectionId: string };
  SmartInspector: { inspectionId: string; workflowId: string };
};
```

### Export Pattern

Use named exports:

```typescript
export { HomeScreen } from './HomeScreen';
```

## Screen Organization

For complex screens with multiple components:

```
inspection/
├── InspectionDetailScreen.tsx
├── components/
│   ├── RecordCard.tsx
│   ├── PhotoThumbnail.tsx
│   └── StatusBadge.tsx
└── index.ts
```

## Best Practices

1. **Separation of Concerns** - Screens handle navigation, components handle UI
2. **State Management** - Use Redux for global state, local state for UI-only state
3. **Navigation** - Use typed navigation props for type safety
4. **Loading States** - Show loading indicators while fetching data
5. **Error Handling** - Display error messages and retry mechanisms
6. **Offline Support** - Handle network errors gracefully
