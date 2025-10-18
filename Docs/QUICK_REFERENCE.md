# Smart Inspector Pro - Quick Reference

**Version**: 1.0.0
**Last Updated**: October 17, 2025
**Purpose**: Fast lookup for common development tasks

---

## Table of Contents

1. [Common CLI Commands](#common-cli-commands)
2. [Code Snippets](#code-snippets)
3. [AWS Amplify Quick Commands](#aws-amplify-quick-commands)
4. [Database Queries](#database-queries)
5. [API Call Patterns](#api-call-patterns)
6. [Redux Patterns](#redux-patterns)
7. [Testing Commands](#testing-commands)
8. [Debugging Commands](#debugging-commands)
9. [Git Workflows](#git-workflows)
10. [VS Code Shortcuts](#vs-code-shortcuts)

---

## Common CLI Commands

### Project Management

```bash
# Install dependencies
npm install

# Clean install (removes node_modules first)
rm -rf node_modules && npm install

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit
npm audit fix
```

### Building & Running

```bash
# Start Metro bundler
npm start

# Start with cache reset
npm start -- --reset-cache

# Run on iOS simulator
npm run ios

# Run on specific iOS simulator
npm run ios -- --simulator="iPhone 15 Pro"

# Run on physical iOS device
npm run ios -- --device "Your iPhone Name"

# Run on Android emulator
npm run android

# Run on specific Android device
npm run android -- --deviceId=emulator-5554

# Build iOS for production
npm run build:ios

# Build Android for production
npm run build:android
```

### Development Tools

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check with TypeScript
npm run typecheck

# Run all checks (lint + typecheck + tests)
npm run validate
```

### iOS Specific

```bash
# Clean iOS build
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..

# Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Open Xcode
open ios/SmartInspectorPro.xcworkspace

# List available simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15 Pro"

# Open Simulator app
open -a Simulator

# Reset simulator
xcrun simctl erase all
```

### Android Specific

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# List connected devices
adb devices

# List emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_6_Pro_API_34

# Reverse port (for API access from emulator)
adb reverse tcp:3000 tcp:3000

# Clear app data
adb shell pm clear com.smartinspectorpro

# View logs
adb logcat | grep "ReactNative"

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## Code Snippets

### New React Component (with Theme)

```typescript
// src/components/[folder]/[ComponentName]/[ComponentName].tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { [ComponentName]Props } from './[ComponentName].types';

export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  // props
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Component content</Text>
    </View>
  );
};
```

### Theme-Aware Screen Component

```typescript
// src/screens/[ScreenName].tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export const [ScreenName]: React.FC = () => {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
  });

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Screen Title</Text>
        </View>
      </View>
    </>
  );
};
```

### Component Props Interface

```typescript
// [ComponentName].types.ts
export interface [ComponentName]Props {
  id: string;
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}
```

### Custom Hook

```typescript
// src/hooks/use[HookName].ts
import { useState, useEffect, useCallback } from 'react';

export function use[HookName]() {
  const [state, setState] = useState();

  useEffect(() => {
    // Effect logic
  }, []);

  const handler = useCallback(() => {
    // Handler logic
  }, []);

  return { state, handler };
}

// Usage
const { state, handler } = use[HookName]();
```

### Redux Slice Template

```typescript
// src/redux/slices/[name].slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface [Name]State {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: [Name]State = {
  items: [],
  loading: false,
  error: null,
};

export const fetch[Name] = createAsyncThunk(
  '[name]/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.[name].getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const [name]Slice = createSlice({
  name: '[name]',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetch[Name].pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetch[Name].fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetch[Name].rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { reset } = [name]Slice.actions;
export default [name]Slice.reducer;
```

### API Service Template

```typescript
// src/services/[name].service.ts
import { apiClient } from './api/client';
import type { [Type], Create[Type]Dto } from '@types/[name].types';

class [Name]Service {
  private readonly basePath = '/[path]';

  async getAll(): Promise<[Type][]> {
    return apiClient.get<[Type][]>(this.basePath);
  }

  async getById(id: string): Promise<[Type]> {
    return apiClient.get<[Type]>(`${this.basePath}/${id}`);
  }

  async create(data: Create[Type]Dto): Promise<[Type]> {
    return apiClient.post<[Type]>(this.basePath, data);
  }

  async update(id: string, data: Partial<[Type]>): Promise<[Type]> {
    return apiClient.put<[Type]>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const [name]Service = new [Name]Service();
```

### Unit Test Template

```typescript
// [ComponentName].test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { [ComponentName] } from './[ComponentName]';

describe('[ComponentName]', () => {
  it('renders correctly', () => {
    const { getByText } = render(<[ComponentName] title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('handles user interaction', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <[ComponentName] onPress={onPress} testID="component" />
    );

    fireEvent.press(getByTestId('component'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('handles async operations', async () => {
    const { getByText } = render(<[ComponentName] />);

    await waitFor(() => {
      expect(getByText('Loaded')).toBeTruthy();
    });
  });
});
```

---

## AWS Amplify Quick Commands

### Setup & Configuration

```bash
# Configure Amplify
amplify configure

# Initialize Amplify in project
amplify init

# Pull existing Amplify environment
amplify pull --appId YOUR_APP_ID --envName dev

# Check Amplify status
amplify status

# List Amplify environments
amplify env list

# Checkout different environment
amplify env checkout staging
```

### Authentication (Cognito)

```bash
# Add authentication
amplify add auth

# Update authentication
amplify update auth

# Push auth changes
amplify push

# Remove authentication
amplify remove auth
```

### Storage (S3)

```bash
# Add storage
amplify add storage

# Update storage
amplify update storage

# Push storage changes
amplify push
```

### Functions (Lambda)

```bash
# Add Lambda function
amplify add function

# Update Lambda function
amplify update function

# Invoke function locally
amplify mock function [functionName]

# View function logs
amplify function log [functionName]
```

### Deployment

```bash
# Push all changes to cloud
amplify push

# Push with no confirmation prompts
amplify push --yes

# Publish (push + hosting)
amplify publish

# Delete all resources
amplify delete
```

---

## Database Queries

### PostgreSQL Connection

```bash
# Connect to local database
psql -d smart_inspector_dev

# Connect to remote database
psql -h your-rds-endpoint.region.rds.amazonaws.com -U postgres -d smart_inspector

# Execute SQL file
psql -d smart_inspector_dev -f schema.sql

# Dump database
pg_dump smart_inspector_dev > backup.sql

# Restore database
psql smart_inspector_dev < backup.sql
```

### Common Queries

```sql
-- List all tables
\dt

-- Describe table structure
\d inspections

-- Count records
SELECT COUNT(*) FROM inspections;

-- Recent inspections
SELECT id, property_address, scheduled_date, status
FROM inspections
ORDER BY scheduled_date DESC
LIMIT 10;

-- Inspections by user
SELECT * FROM inspections
WHERE user_id = 'user-123'
ORDER BY created_at DESC;

-- Inspection with records
SELECT
  i.id,
  i.property_address,
  COUNT(ir.id) as record_count
FROM inspections i
LEFT JOIN inspection_records ir ON i.id = ir.inspection_id
GROUP BY i.id, i.property_address;

-- Condition distribution
SELECT
  condition,
  COUNT(*) as count
FROM inspection_records
WHERE inspection_id = 'inspection-123'
GROUP BY condition;

-- Delete old inspections
DELETE FROM inspections
WHERE status = 'cancelled'
AND updated_at < NOW() - INTERVAL '90 days';
```

### Database Migrations

```bash
# Create migration
npm run migration:create add_workflow_table

# Run migrations
npm run migration:run

# Rollback last migration
npm run migration:rollback

# Check migration status
npm run migration:status
```

---

## API Call Patterns

### Basic GET Request

```typescript
// Using apiClient
const inspections = await apiClient.get<Inspection[]>('/inspections');

// Using RTK Query
const { data, loading, error } = useGetInspectionsQuery();
```

### POST Request with Body

```typescript
// Create inspection
const newInspection = await apiClient.post<Inspection>('/inspections', {
  propertyAddress: '123 Main St',
  scheduledDate: new Date(),
  workflowId: 'workflow-123',
});

// Using RTK Query mutation
const [createInspection] = useCreateInspectionMutation();
await createInspection({
  propertyAddress: '123 Main St',
  scheduledDate: new Date(),
});
```

### File Upload (S3)

```typescript
import { Storage } from 'aws-amplify';

// Upload photo to S3
const uploadPhoto = async (file: File, inspectionId: string) => {
  try {
    const key = `inspections/${inspectionId}/photos/${Date.now()}-${file.name}`;

    const result = await Storage.put(key, file, {
      contentType: file.type,
      level: 'private',
      progressCallback: (progress) => {
        const percentage = (progress.loaded / progress.total) * 100;
        console.log(`Upload progress: ${percentage}%`);
      },
    });

    // Get public URL
    const url = await Storage.get(result.key, { level: 'private' });
    return url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### OpenAI API Call

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze photo with GPT-4 Vision
const analyzePhoto = async (photoUrl: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this home inspection photo and identify: 1) Component, 2) Material, 3) Condition',
          },
          {
            type: 'image_url',
            image_url: { url: photoUrl },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

// Generate report with GPT-4 Turbo
const generateReport = async (inspection: Inspection) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a professional home inspector writing inspection reports.',
      },
      {
        role: 'user',
        content: `Generate a professional inspection report for: ${JSON.stringify(inspection)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
};
```

---

## Redux Patterns

### Access Redux State

```typescript
import { useAppSelector } from '@redux/hooks';

// Select data
const inspections = useAppSelector(state => state.inspections.items);
const loading = useAppSelector(state => state.inspections.loading);
const user = useAppSelector(state => state.auth.user);

// Memoized selector
import { createSelector } from '@reduxjs/toolkit';

const selectCompletedInspections = createSelector(
  [(state: RootState) => state.inspections.items],
  (inspections) => inspections.filter(i => i.status === 'completed')
);

const completedInspections = useAppSelector(selectCompletedInspections);
```

### Dispatch Actions

```typescript
import { useAppDispatch } from '@redux/hooks';
import { fetchInspections, selectInspection } from '@redux/slices/inspections.slice';

const dispatch = useAppDispatch();

// Dispatch async thunk
await dispatch(fetchInspections(userId));

// Dispatch sync action
dispatch(selectInspection('inspection-123'));
```

### RTK Query Patterns

```typescript
// Basic query
const { data, error, isLoading, refetch } = useGetInspectionsQuery();

// Query with parameters
const { data } = useGetInspectionQuery(inspectionId);

// Skip query conditionally
const { data } = useGetInspectionQuery(inspectionId, {
  skip: !inspectionId,
});

// Mutation
const [createInspection, { isLoading, error }] = useCreateInspectionMutation();

const handleCreate = async () => {
  try {
    const result = await createInspection({ ...data }).unwrap();
    console.log('Created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Testing Commands

### Jest (Unit & Integration Tests)

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Button"

# Run with coverage
npm test -- --coverage

# Update snapshots
npm test -- -u

# Run tests in CI mode (no watch)
npm test -- --ci

# Clear Jest cache
npm test -- --clearCache
```

### Detox (E2E Tests)

```bash
# Build iOS app for testing
npm run detox:build:ios

# Build Android app for testing
npm run detox:build:android

# Run iOS E2E tests
npm run detox:test:ios

# Run Android E2E tests
npm run detox:test:android

# Run specific test file
npm run detox:test:ios -- e2e/login.test.ts

# Run with debug output
npm run detox:test:ios -- --loglevel verbose

# Clean Detox
npm run detox:clean
```

### Test Coverage

```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/services/**/*.ts"
```

---

## Debugging Commands

### React Native Debugger

```bash
# Enable debug mode (shake device or press Cmd+D in simulator)
# Select "Debug" from menu

# View logs
# iOS: Cmd+D → Toggle Inspector
# Android: Cmd+M → Toggle Inspector

# Reload app
# iOS: Cmd+R
# Android: RR (double tap R)
```

### Console Logging

```typescript
// Basic logging
console.log('Value:', value);
console.error('Error:', error);
console.warn('Warning:', warning);

// Object logging
console.log('User:', JSON.stringify(user, null, 2));

// Table logging (Node.js/Chrome)
console.table(inspections);

// Performance measurement
console.time('API Call');
await apiClient.get('/inspections');
console.timeEnd('API Call');
```

### Network Debugging

```bash
# Inspect network requests (React Native Debugger)
# Open React Native Debugger → Network tab

# Or use Reactotron
npm install --save-dev reactotron-react-native

# Flipper Network Plugin
# Open Flipper → Network → View all requests
```

### Memory Profiling

```bash
# iOS - Xcode Instruments
# 1. Open Xcode
# 2. Product → Profile (Cmd+I)
# 3. Select "Leaks" or "Allocations"

# Android - Android Profiler
# 1. Open Android Studio
# 2. View → Tool Windows → Profiler
# 3. Select Memory profiler
```

---

## Git Workflows

### Daily Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/SMART-123-description

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(inspections): add photo carousel"

# Push branch
git push origin feature/SMART-123-description

# Create PR on GitHub
# (Use GitHub CLI or web interface)
gh pr create --title "feat: add photo carousel" --body "Adds photo carousel to inspection detail screen"
```

### Useful Git Commands

```bash
# View status
git status

# View commit history
git log --oneline --graph --all

# View changes
git diff

# View staged changes
git diff --staged

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Rebase on main
git rebase main

# Interactive rebase (squash commits)
git rebase -i HEAD~3

# Resolve merge conflicts
git mergetool

# Abort merge
git merge --abort
```

### Branch Management

```bash
# List branches
git branch -a

# Delete local branch
git branch -d feature/old-branch

# Delete remote branch
git push origin --delete feature/old-branch

# Rename branch
git branch -m old-name new-name

# Switch branches
git checkout main
git checkout -b new-branch  # Create and switch
```

---

## VS Code Shortcuts

### General

- **Command Palette**: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Win)
- **Quick Open**: `Cmd+P` / `Ctrl+P`
- **Settings**: `Cmd+,` / `Ctrl+,`
- **Toggle Terminal**: `Ctrl+` ` (backtick)
- **Toggle Sidebar**: `Cmd+B` / `Ctrl+B`

### Editing

- **Find**: `Cmd+F` / `Ctrl+F`
- **Find & Replace**: `Cmd+Option+F` / `Ctrl+H`
- **Go to Line**: `Ctrl+G`
- **Multi-cursor**: `Cmd+D` / `Ctrl+D` (select next occurrence)
- **Comment Line**: `Cmd+/` / `Ctrl+/`
- **Format Document**: `Shift+Option+F` / `Shift+Alt+F`
- **Rename Symbol**: `F2`

### Navigation

- **Go to Definition**: `F12`
- **Peek Definition**: `Option+F12` / `Alt+F12`
- **Go to References**: `Shift+F12`
- **Go Back**: `Ctrl+-`
- **Go Forward**: `Ctrl+Shift+-`

### Debugging

- **Start Debugging**: `F5`
- **Step Over**: `F10`
- **Step Into**: `F11`
- **Step Out**: `Shift+F11`
- **Toggle Breakpoint**: `F9`

---

## Environment Variables Quick Reference

### Development (.env.development)

```bash
# App
APP_ENV=development
API_BASE_URL=http://localhost:3000/api

# AWS
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_S3_BUCKET=smart-inspector-dev

# OpenAI
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_inspector_dev
```

### Accessing in Code

```typescript
// React Native
import Config from 'react-native-config';

const apiUrl = Config.API_BASE_URL;
const awsRegion = Config.AWS_REGION;

// Node.js (backend)
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
```

---

## Performance Optimization Snippets

### Memoization

```typescript
// useMemo - Memoize expensive computations
const filteredInspections = useMemo(() => {
  return inspections.filter(i => i.status === 'completed');
}, [inspections]);

// useCallback - Memoize functions
const handlePress = useCallback((id: string) => {
  navigation.navigate('Detail', { id });
}, [navigation]);

// React.memo - Memoize component
export const InspectionCard = React.memo<InspectionCardProps>(
  ({ inspection }) => {
    return <View>{/* ... */}</View>;
  }
);
```

### FlatList Optimization

```typescript
<FlatList
  data={inspections}
  renderItem={({ item }) => <InspectionCard inspection={item} />}
  keyExtractor={item => item.id}
  // Performance optimizations
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## Useful NPM Scripts

```json
{
  "scripts": {
    "start": "react-native start",
    "ios": "react-native run-ios",
    "android": "react-native run-android",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json}\"",
    "typecheck": "tsc --noEmit",
    "validate": "npm run lint && npm run typecheck && npm run test",
    "clean": "rm -rf node_modules ios/Pods ios/build android/build",
    "reset": "npm run clean && npm install && cd ios && pod install"
  }
}
```

---

## Version History

### v1.0.0 (October 17, 2025)
- Initial quick reference guide
- CLI commands, code snippets, debugging
- AWS, database, API patterns

---

## Contributing

Found a useful command or snippet? Add it to this document!

**Maintainer**: Development Team
**Last Review**: October 17, 2025
