# Smart Inspector Pro - Code Standards

**Version**: 1.0.0
**Last Updated**: October 17, 2025
**Enforcement**: ESLint + Prettier + TypeScript
**Compliance**: Mandatory for all pull requests

---

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [File & Folder Naming](#file--folder-naming)
4. [React Component Standards](#react-component-standards)
5. [State Management (Redux)](#state-management-redux)
6. [API & Service Layer](#api--service-layer)
7. [Error Handling](#error-handling)
8. [Testing Standards](#testing-standards)
9. [Import Order](#import-order)
10. [Comments & Documentation](#comments--documentation)
11. [Git Commit Standards](#git-commit-standards)
12. [Code Review Checklist](#code-review-checklist)

---

## General Principles

### Core Values

1. **Readability over Cleverness** - Code is read 10x more than written
2. **Consistency over Personal Preference** - Follow team standards
3. **Explicit over Implicit** - Make intentions clear
4. **Fail Fast** - Catch errors early with strict typing and validation
5. **DRY (Don't Repeat Yourself)** - But avoid premature abstraction

### Code Quality Metrics

- **Line Length**: Max 100 characters (enforced by Prettier)
- **File Length**: Max 300 lines (split if larger)
- **Function Length**: Max 50 lines (extract smaller functions)
- **Function Parameters**: Max 5 parameters (use object parameter for more)
- **Cyclomatic Complexity**: Max 10 per function
- **Test Coverage**: Min 80% overall, 95% for critical paths

---

## TypeScript Standards

### TypeScript Configuration

**tsconfig.json** (strict mode enabled):

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "lib": ["ES2021"],
    "jsx": "react-native",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@redux/*": ["src/redux/*"]
    }
  }
}
```

### Type Definitions

#### Use Interfaces for Object Shapes

```typescript
// ✅ Good: Interface for object shape
interface Inspection {
  id: string;
  userId: string;
  propertyAddress: string;
  scheduledDate: Date;
  status: InspectionStatus;
  records: InspectionRecord[];
}

// ❌ Bad: Type alias for object shape (unless needed)
type Inspection = {
  id: string;
  // ...
};
```

#### Use Type Aliases for Unions, Primitives, Tuples

```typescript
// ✅ Good: Type alias for union
type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// ✅ Good: Type alias for function signature
type OnInspectionComplete = (inspectionId: string) => void;

// ✅ Good: Type alias for complex union
type ConditionType =
  | 'Acceptable'
  | 'Monitor'
  | 'Repair/Replace'
  | 'Safety Hazard'
  | 'Access Restricted';
```

#### Always Export Types/Interfaces

```typescript
// ✅ Good: Export for reuse
export interface User {
  id: string;
  email: string;
  membershipTier: MembershipTier;
}

// ❌ Bad: Not exported (can't reuse)
interface User {
  id: string;
  // ...
}
```

#### Avoid `any` - Use `unknown` if Type is Truly Unknown

```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.value; // No type safety
}

// ✅ Good: Using unknown with type guard
function processData(data: unknown): string {
  if (isValidData(data)) {
    return data.value; // Type-safe after validation
  }
  throw new Error('Invalid data');
}

function isValidData(data: unknown): data is { value: string } {
  return typeof data === 'object' && data !== null && 'value' in data;
}
```

#### Use Enums Sparingly - Prefer String Literal Unions

```typescript
// ❌ Avoid: Enum (adds runtime code)
enum InspectionStatus {
  Scheduled = 'SCHEDULED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

// ✅ Good: String literal union (zero runtime cost)
type InspectionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// ✅ Good: Const object for mapping (when needed)
export const INSPECTION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

type InspectionStatus =
  (typeof INSPECTION_STATUS)[keyof typeof INSPECTION_STATUS];
```

#### Use Utility Types

```typescript
// Partial<T> - Make all properties optional
type PartialInspection = Partial<Inspection>;

// Required<T> - Make all properties required
type RequiredInspection = Required<Partial<Inspection>>;

// Pick<T, K> - Select specific properties
type InspectionPreview = Pick<
  Inspection,
  'id' | 'propertyAddress' | 'scheduledDate'
>;

// Omit<T, K> - Exclude specific properties
type InspectionWithoutRecords = Omit<Inspection, 'records'>;

// Record<K, T> - Object with specific key-value types
type InspectionsByStatus = Record<InspectionStatus, Inspection[]>;

// ReturnType<T> - Extract return type of function
type ApiResponse = ReturnType<typeof fetchInspection>;
```

---

## File & Folder Naming

### General Rules

- **React Components**: PascalCase (e.g., `InspectionCard.tsx`)
- **Non-component files**: camelCase (e.g., `csvParser.ts`)
- **Test files**: Match source file with `.test.ts(x)` suffix
- **Type definition files**: Match source file with `.types.ts` suffix
- **Folders**: kebab-case (e.g., `inspection-list/`)
- **Constants files**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### File Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/             # Generic components
│   │   ├── Button/
│   │   │   ├── Button.tsx          (component)
│   │   │   ├── Button.test.tsx     (tests)
│   │   │   ├── Button.types.ts     (type definitions)
│   │   │   ├── Button.styles.ts    (styles)
│   │   │   └── index.ts            (barrel export)
│   │   ├── Card/
│   │   └── Modal/
│   ├── inspection/         # Inspection-specific components
│   │   ├── InspectionCard/
│   │   ├── InspectionList/
│   │   └── PhotoCapture/
│   └── data/              # Data-related components
│       ├── CSVViewer/
│       └── FilterPanel/
├── screens/               # Full-screen views
│   ├── HomeScreen/
│   ├── LoginScreen/
│   └── InspectionScreen/
├── navigation/            # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── navigation.types.ts
├── redux/                 # State management
│   ├── slices/
│   │   ├── auth.slice.ts
│   │   ├── inspections.slice.ts
│   │   └── marketplace.slice.ts
│   ├── store.ts
│   └── hooks.ts
├── services/              # API clients
│   ├── api/
│   │   ├── inspections.api.ts
│   │   ├── marketplace.api.ts
│   │   └── users.api.ts
│   ├── aws/
│   │   ├── s3.service.ts
│   │   ├── cognito.service.ts
│   │   └── lambda.service.ts
│   └── openai/
│       └── gpt.service.ts
├── utils/                 # Utility functions
│   ├── csvParser.ts
│   ├── dateFormatter.ts
│   ├── validators.ts
│   └── constants.ts
├── types/                 # TypeScript type definitions
│   ├── inspection.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── hooks/                 # Custom React hooks
│   ├── useInspection.ts
│   ├── useAuth.ts
│   └── useOfflineQueue.ts
├── data/                  # Static data files
│   ├── single_family.csv
│   └── single_family_sample.csv
└── App.tsx               # Root component
```

### Component Folder Structure (Recommended)

```
Button/
├── Button.tsx           # Component implementation
├── Button.test.tsx      # Unit tests
├── Button.types.ts      # TypeScript interfaces/types
├── Button.styles.ts     # StyleSheet or styled-components
└── index.ts             # Barrel export
```

**index.ts** (Barrel Export):

```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

---

## React Component Standards

### Functional Components Only

```typescript
// ✅ Good: Functional component with TypeScript
interface ProfileProps {
  userId: string;
  onUpdate: (data: UserData) => void;
}

export const Profile: React.FC<ProfileProps> = ({ userId, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  return <View>{/* Component content */}</View>;
};

// ❌ Bad: Class component (avoid)
export class Profile extends React.Component<ProfileProps> {
  // ...
}
```

### Props Interface Pattern

```typescript
// ✅ Good: Descriptive props interface
interface InspectionCardProps {
  inspection: Inspection;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  testID?: string;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({
  inspection,
  onPress,
  onDelete,
  showActions = true,
  testID = 'inspection-card',
}) => {
  // Component logic
};

// ❌ Bad: Inline props (hard to reuse)
export const InspectionCard: React.FC<{
  inspection: Inspection;
  onPress?: () => void;
}> = ({ inspection, onPress }) => {
  // ...
};
```

### Destructure Props

```typescript
// ✅ Good: Destructure in function signature
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  onDelete,
}) => {
  return <View>{user.name}</View>;
};

// ❌ Bad: Using props object
export const UserProfile: React.FC<UserProfileProps> = props => {
  return <View>{props.user.name}</View>;
};
```

### Theming Standards

**Always use theme colors - never hardcode**:

```typescript
// ✅ Good: Use theme hook
import { useTheme } from '@/theme';

export const MyComponent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <ThemedText variant="body1">Hello</ThemedText>
    </View>
  );
};

// ❌ Bad: Hardcoded colors
export const MyComponent: React.FC = () => {
  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <Text style={{ color: '#000000' }}>Hello</Text>
    </View>
  );
};
```

**Use ThemedText and ThemedView components**:

```typescript
// ✅ Good: Use themed components
import ThemedText from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';

export const MyScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="h1">Title</ThemedText>
      <ThemedText variant="body1">Description text</ThemedText>
    </ThemedView>
  );
};

// ❌ Bad: Manual styling with hardcoded colors
export const MyScreen: React.FC = () => {
  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, color: '#000000' }}>Title</Text>
      <Text style={{ fontSize: 16, color: '#666666' }}>Description</Text>
    </View>
  );
};
```

### MenuCard Pattern (Navigation Lists)

**CRITICAL**: Use MenuCard pattern for all navigation menus across the app.

**Implementation**: See `src/screens/home/HomeScreen.tsx` for reference implementation.

```typescript
// ✅ Good: MenuCard pattern with accent stripe
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/theme';
import ThemedText from '@/components/common/ThemedText';

interface MenuCardProps {
  title: string;
  icon: string;
  iconColor?: string;
  badge?: string;
  onPress: () => void;
  fullWidth?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  title,
  icon,
  iconColor,
  badge,
  onPress,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const accentColor = iconColor || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.menuCard,
        {
          backgroundColor: pressed
            ? theme.colors.background
            : theme.colors.surface,
          borderColor: theme.colors.border,
          width: fullWidth ? '100%' : '48.5%',
        },
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* Accent Stripe - 4px colored left edge */}
      <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />

      {/* Icon with tinted background circle */}
      <View style={styles.iconColumn}>
        <View
          style={[
            styles.menuIconCircle,
            { backgroundColor: `${accentColor}22` }, // 13% opacity
          ]}
        >
          <Icon name={icon} size={24} color={accentColor} />
        </View>
      </View>

      {/* Title content */}
      <View style={styles.menuCardContent}>
        <ThemedText variant="body1" style={styles.menuCardTitle}>
          {title}
        </ThemedText>
      </View>

      {/* Optional badge */}
      {badge && (
        <View
          style={[styles.menuBadge, { backgroundColor: theme.colors.error }]}
        >
          <ThemedText variant="caption" style={styles.menuBadgeText}>
            {badge}
          </ThemedText>
        </View>
      )}

      {/* Chevron indicator */}
      <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingRight: 14,
    paddingLeft: 18,
    borderRadius: 12,
    borderWidth: 1,
    shadowOpacity: 0,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconColumn: {
    width: 44,
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardContent: {
    flex: 1,
    paddingRight: 4,
  },
  menuCardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
```

**Color Coding System** (use consistently):

```typescript
// Standard color palette for MenuCard icons
const MENU_COLORS = {
  success: '#4CAF50', // Green: workflow, calendar, membership
  primary: '#2196F3', // Blue: inspections, contacts, help
  inProgress: '#FF9800', // Orange: continue inspection, accounting
  team: '#9C27B0', // Purple: team features, store
  alert: '#F44336', // Red: notifications, urgent
  template: '#FF5722', // Orange-red: report templates
  data: '#00BCD4', // Cyan: forms, data management
  system: '#607D8B', // Gray: settings, system tools
};

// Usage
<MenuCard
  title="My Inspections"
  icon="clipboard-list-outline"
  iconColor={MENU_COLORS.primary}
  onPress={() => navigation.navigate('MyInspections')}
  fullWidth
/>;
```

**MenuCard Rules**:

1. **Always use 4px accent stripe** on left edge
2. **Icon circle**: 34x34px with 13% opacity background (`${color}22`)
3. **Icon size**: 24px Material Community Icons
4. **Title font**: 16px (larger than standard 14px), fontWeight 600
5. **Full width default**: Use `fullWidth` prop for navigation menus
6. **Pressed state**: Background changes to theme.colors.background
7. **No shadow**: shadowOpacity: 0 for cleaner look
8. **Badge placement**: Right side before chevron
9. **Color consistency**: Use color coding system above

**When to Use MenuCard**:

- ✅ Navigation menus (Home, Settings, etc.)
- ✅ Feature dashboards
- ✅ Action lists with icons
- ❌ Data tables (use CSVDataTable)
- ❌ Inspection records (use InspectionCard)
- ❌ Photo galleries (use PhotoThumbnail)

**Create styles inside component for dynamic theming**:

```typescript
// ✅ Good: Dynamic styles with theme
export const Card: React.FC<CardProps> = ({ children }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderColor: theme.colors.border.default,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
    },
  });

  return <View style={styles.card}>{children}</View>;
};

// ❌ Bad: Static styles outside component
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5', // Won't change with theme
  },
});
```

**Use semantic colors for purpose**:

```typescript
// ✅ Good: Semantic color usage
const styles = StyleSheet.create({
  successText: {
    color: theme.colors.success.main,
  },
  errorText: {
    color: theme.colors.error.main,
  },
  warningBadge: {
    backgroundColor: theme.colors.warning.light,
  },
});

// ❌ Bad: Non-semantic color usage
const styles = StyleSheet.create({
  successText: {
    color: '#4CAF50', // Use semantic color instead
  },
});
```

**Status bar adjustments**:

```typescript
// ✅ Good: Theme-aware status bar
import { StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export const Screen: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* Screen content */}
    </>
  );
};
```

### Use Custom Hooks for Logic

```typescript
// ✅ Good: Extract logic to custom hook
function useInspectionForm(inspectionId?: string) {
  const [formData, setFormData] = useState<InspectionFormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = useCallback(() => {
    // Validation logic
  }, [formData]);

  const submitForm = useCallback(async () => {
    setLoading(true);
    try {
      // Submit logic
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return { formData, setFormData, errors, loading, validateForm, submitForm };
}

// Component uses hook
export const InspectionForm: React.FC<InspectionFormProps> = ({
  inspectionId,
}) => {
  const { formData, setFormData, errors, loading, submitForm } =
    useInspectionForm(inspectionId);

  return <View>{/* Form UI */}</View>;
};

// ❌ Bad: All logic in component
export const InspectionForm: React.FC<InspectionFormProps> = ({
  inspectionId,
}) => {
  const [formData, setFormData] = useState<InspectionFormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  // ... 100 lines of logic in component
};
```

### Memoization Guidelines

```typescript
// ✅ Good: Memoize expensive computations
const InspectionList: React.FC<InspectionListProps> = ({
  inspections,
  filters,
}) => {
  // Memoize filtered list (only recalculates when dependencies change)
  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      // Complex filtering logic
      return matchesFilters(inspection, filters);
    });
  }, [inspections, filters]);

  // Memoize callback (stable reference)
  const handleInspectionPress = useCallback(
    (id: string) => {
      navigation.navigate('InspectionDetail', { id });
    },
    [navigation],
  );

  return (
    <FlatList
      data={filteredInspections}
      renderItem={({ item }) => (
        <InspectionCard
          inspection={item}
          onPress={() => handleInspectionPress(item.id)}
        />
      )}
    />
  );
};

// Use React.memo for expensive components
export const InspectionCard = React.memo<InspectionCardProps>(
  ({ inspection, onPress }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison (optional)
    return prevProps.inspection.id === nextProps.inspection.id;
  },
);
```

### Conditional Rendering

```typescript
// ✅ Good: Early return for loading/error states
export const InspectionDetail: React.FC<InspectionDetailProps> = ({
  inspectionId,
}) => {
  const { data: inspection, loading, error } = useInspection(inspectionId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!inspection) {
    return <NotFound />;
  }

  return <View>{/* Main content */}</View>;
};

// ❌ Bad: Nested ternaries
export const InspectionDetail: React.FC<InspectionDetailProps> = ({
  inspectionId,
}) => {
  const { data, loading, error } = useInspection(inspectionId);

  return (
    <View>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage />
      ) : data ? (
        <View>{/* content */}</View>
      ) : (
        <NotFound />
      )}
    </View>
  );
};
```

---

## State Management (Redux)

### Redux Toolkit Slice Pattern

```typescript
// src/redux/slices/inspections.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Inspection } from '@types/inspection.types';

// Define state interface
interface InspectionsState {
  items: Inspection[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: InspectionsState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchInspections = createAsyncThunk(
  'inspections/fetchAll',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.inspections.getAll(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Slice
const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    // Synchronous actions
    selectInspection: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
    clearSelectedInspection: state => {
      state.selectedId = null;
    },
    resetInspections: () => initialState,
  },
  extraReducers: builder => {
    // Async action handlers
    builder
      .addCase(fetchInspections.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectInspection, clearSelectedInspection, resetInspections } =
  inspectionsSlice.actions;
export default inspectionsSlice.reducer;
```

### Redux Store Configuration

```typescript
// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/auth.slice';
import inspectionsReducer from './slices/inspections.slice';
import marketplaceReducer from './slices/marketplace.slice';
import { api } from '@services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inspections: inspectionsReducer,
    marketplace: marketplaceReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Redux Hooks

```typescript
// src/redux/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### RTK Query API Definition

```typescript
// src/services/api/base.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@redux/store';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Inspection', 'User', 'MarketplaceProduct'],
  endpoints: builder => ({
    // Endpoints defined in separate files and injected
  }),
});

// src/services/api/inspections.api.ts
import { api } from './base.api';
import type { Inspection, CreateInspectionDto } from '@types/inspection.types';

export const inspectionsApi = api.injectEndpoints({
  endpoints: builder => ({
    getInspections: builder.query<Inspection[], void>({
      query: () => '/inspections',
      providesTags: ['Inspection'],
    }),
    getInspection: builder.query<Inspection, string>({
      query: id => `/inspections/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inspection', id }],
    }),
    createInspection: builder.mutation<Inspection, CreateInspectionDto>({
      query: body => ({
        url: '/inspections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inspection'],
    }),
  }),
});

export const {
  useGetInspectionsQuery,
  useGetInspectionQuery,
  useCreateInspectionMutation,
} = inspectionsApi;
```

---

## API & Service Layer

### API Client Structure

```typescript
// src/services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken } from '@utils/auth';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async config => {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient(process.env.API_BASE_URL!);
```

### Service Pattern

```typescript
// src/services/inspections.service.ts
import { apiClient } from './api/client';
import type {
  Inspection,
  CreateInspectionDto,
  UpdateInspectionDto,
} from '@types/inspection.types';

export class InspectionsService {
  private readonly basePath = '/inspections';

  async getAll(userId: string): Promise<Inspection[]> {
    return apiClient.get<Inspection[]>(`${this.basePath}?userId=${userId}`);
  }

  async getById(id: string): Promise<Inspection> {
    return apiClient.get<Inspection>(`${this.basePath}/${id}`);
  }

  async create(data: CreateInspectionDto): Promise<Inspection> {
    return apiClient.post<Inspection>(this.basePath, data);
  }

  async update(id: string, data: UpdateInspectionDto): Promise<Inspection> {
    return apiClient.put<Inspection>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const inspectionsService = new InspectionsService();
```

---

## Error Handling

### Error Types

```typescript
// src/types/error.types.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
```

### Error Handling Utility

```typescript
// src/utils/errorHandler.ts
import { AppError } from '@types/error.types';
import { Alert } from 'react-native';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

export function handleError(error: unknown): void {
  const message = getErrorMessage(error);

  // Log to error tracking service (e.g., Sentry)
  console.error('Error:', error);

  // Show user-friendly message
  Alert.alert('Error', message, [{ text: 'OK' }]);
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('Network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED'))
  );
}
```

### Try-Catch Pattern

```typescript
// ✅ Good: Proper error handling
async function loadInspection(id: string): Promise<Inspection | null> {
  try {
    const inspection = await inspectionsService.getById(id);
    return inspection;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('Inspection not found');
      return null;
    }

    if (isNetworkError(error)) {
      // Try loading from local cache
      return await loadFromCache(id);
    }

    handleError(error);
    throw error; // Re-throw if can't recover
  }
}

// ❌ Bad: Silent error swallowing
async function loadInspection(id: string): Promise<Inspection | null> {
  try {
    return await inspectionsService.getById(id);
  } catch (error) {
    return null; // Lost error context!
  }
}
```

---

## Testing Standards

See `TESTING_GUIDELINES.md` for comprehensive testing standards. Key highlights:

### Unit Test Pattern

```typescript
// InspectionCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InspectionCard } from './InspectionCard';
import { mockInspection } from '@test/fixtures/inspections';

describe('InspectionCard', () => {
  it('renders inspection details correctly', () => {
    const { getByText } = render(
      <InspectionCard inspection={mockInspection} />,
    );

    expect(getByText(mockInspection.propertyAddress)).toBeTruthy();
    expect(getByText('Scheduled')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <InspectionCard inspection={mockInspection} onPress={onPress} />,
    );

    fireEvent.press(getByTestId('inspection-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows action buttons when showActions is true', () => {
    const { getByText } = render(
      <InspectionCard inspection={mockInspection} showActions={true} />,
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });
});
```

### Coverage Requirements

- **Overall**: 80%+ code coverage
- **Critical paths** (auth, payments, data sync): 95%+
- **Business logic**: 90%+
- **UI components**: 70%+

---

## Import Order

### Standard Import Order (Enforced by ESLint)

```typescript
// 1. External dependencies (React, React Native, libraries)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 2. Internal absolute imports (using @ aliases)
import { useAppSelector, useAppDispatch } from '@redux/hooks';
import { selectInspection } from '@redux/slices/inspections.slice';
import { InspectionCard } from '@components/inspection/InspectionCard';
import { Button } from '@components/common/Button';
import { inspectionsService } from '@services/inspections.service';
import { formatDate } from '@utils/dateFormatter';

// 3. Type imports (keep separate)
import type { Inspection } from '@types/inspection.types';
import type { NavigationProps } from '@navigation/navigation.types';

// 4. Relative imports (./  or ../)
import { calculateTotal } from './utils';
import styles from './InspectionScreen.styles';

// 5. Assets (images, JSON)
import logo from '@assets/images/logo.png';
```

### ESLint Import Order Configuration

```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "type"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@redux/**",
            "group": "internal"
          },
          {
            "pattern": "@components/**",
            "group": "internal"
          },
          {
            "pattern": "@services/**",
            "group": "internal"
          },
          {
            "pattern": "@utils/**",
            "group": "internal"
          },
          {
            "pattern": "@types/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  }
}
```

---

## Comments & Documentation

### When to Comment

```typescript
// ✅ Good: Explain WHY, not WHAT
// We use a 5-second debounce to prevent excessive API calls
// when user is typing in search field
const debouncedSearch = useDebouncedCallback(handleSearch, 5000);

// ✅ Good: Document complex business logic
/**
 * Calculates inspection score based on condition distribution.
 *
 * Score formula:
 * - Acceptable: +10 points
 * - Monitor: +5 points
 * - Repair/Replace: -5 points
 * - Safety Hazard: -15 points
 * - Access Restricted: 0 points (not counted)
 *
 * @param records - Array of inspection records
 * @returns Score from -100 to 100
 */
function calculateInspectionScore(records: InspectionRecord[]): number {
  // Implementation
}

// ✅ Good: TODO comments with ticket reference
// TODO(SMART-123): Optimize this query for large datasets

// ❌ Bad: Obvious comment
// Set loading to true
setLoading(true);

// ❌ Bad: Commented-out code (delete instead)
// const oldFunction = () => {
//   // Old implementation
// };
```

### JSDoc for Public APIs

````typescript
/**
 * Custom hook for managing inspection form state and validation.
 *
 * @param inspectionId - Optional ID for editing existing inspection
 * @returns Form state, handlers, and validation status
 *
 * @example
 * ```tsx
 * const { formData, errors, submitForm } = useInspectionForm('inspection-123');
 * ```
 */
export function useInspectionForm(inspectionId?: string) {
  // Implementation
}
````

---

## Git Commit Standards

### Conventional Commits

Format: `<type>(<scope>): <subject>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)
- `ci`: CI/CD changes

**Examples**:

```bash
feat(inspections): add photo carousel to inspection detail screen
fix(auth): resolve token refresh infinite loop
docs(readme): update installation instructions for M1 Macs
refactor(csv-parser): extract parsing logic to separate utility
test(inspections): add unit tests for inspection service
perf(list): implement virtualization for large inspection lists
chore(deps): upgrade React Native to 0.73
```

### Commit Message Best Practices

```bash
# ✅ Good: Clear, concise, imperative mood
feat(marketplace): add product filtering by category

# ✅ Good: Multi-line with context
fix(auth): prevent logout on token refresh

Previously, the app would log out users when attempting to
refresh expired tokens. This adds proper error handling and
retries with exponential backoff.

Fixes #456

# ❌ Bad: Vague message
fix: bug fix

# ❌ Bad: Not imperative mood
feat: added new feature

# ❌ Bad: Too generic
update code
```

### Branch Naming

```bash
# Feature branches
feature/SMART-123-marketplace-product-filtering
feature/photo-upload-progress-indicator

# Bug fix branches
fix/SMART-456-login-crash-on-ios
fix/csv-parser-unicode-handling

# Refactor branches
refactor/redux-store-structure
refactor/extract-api-client

# Release branches
release/v1.0.0
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows all style standards
- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets minimums (80%+)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] TypeScript compiles without errors
- [ ] No console.log statements (use logger utility)
- [ ] Commit messages follow conventional commits
- [ ] PR description includes:
  - What changed
  - Why it changed
  - How to test
  - Screenshots (for UI changes)
  - Related issue/ticket number

### Reviewer Checklist

- [ ] Code is readable and maintainable
- [ ] Logic is sound and efficient
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Tests adequately cover new code
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Documentation updated if needed
- [ ] Breaking changes clearly documented

---

## ESLint Configuration

```json
{
  "extends": [
    "@react-native-community",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react-hooks", "import"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/order": [
      "error",
      {
        /* config from Import Order section */
      }
    ],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## Version History

### v1.0.0 (October 17, 2025)

- Initial code standards document
- TypeScript, React, Redux standards
- Testing and commit standards
- ESLint and Prettier configuration

---

## Enforcement

All standards are enforced through:

1. **Automated Tools**: ESLint, Prettier, TypeScript compiler
2. **Pre-commit Hooks**: Husky + lint-staged
3. **CI/CD Pipeline**: Fails on linting errors or test failures
4. **Code Review**: Manual review for logic and best practices

**Non-negotiable**: PRs will not be merged if they violate these standards.

---

## Questions or Suggestions?

- Create GitHub Issue with label `code-standards`
- Discuss in #engineering Slack channel
- Propose changes via PR to this document

**Maintainer**: Engineering Team
**Last Review**: October 17, 2025
