# Source Code Directory (`src/`)

This directory contains all the React Native application source code for Smart Inspector Pro.

## Directory Structure

### 📱 User Interface

- **`components/`** - Reusable React components
  - `common/` - Generic UI components (Button, Card, Modal, Input, etc.)
  - `inspection/` - Inspection-specific components (PhotoCapture, AIPredictor, InspectionTracker)
  - `data/` - Data visualization components (CSVViewer, FilterButtons, HierarchyNavigator)

- **`screens/`** - Full-screen views (one per route)
  - `home/` - Home dashboard and main navigation
  - `inspection/` - Smart Inspector workflow screens
  - `workflow/` - Workflow editor and management
  - `business/` - Business tools (scheduling, contacts, accounting)
  - `settings/` - App settings and preferences
  - `auth/` - Login, register, password reset

- **`navigation/`** - React Navigation configuration
  - Stack navigators, tab navigators, route definitions

### 🧠 State & Logic

- **`redux/`** - Redux Toolkit state management
  - `slices/` - Redux slices (auth, inspections, workflows, user, etc.)
  - `store.ts` - Redux store configuration
  - `hooks.ts` - Typed useDispatch and useSelector hooks

- **`hooks/`** - Custom React hooks
  - Business logic hooks (`useInspectionWorkflow`, `useAIAnalysis`, `useOfflineSync`)

### 🔧 Services & Utilities

- **`services/`** - External API integrations
  - AWS S3 client, OpenAI integration, Amplify Auth, SQLite database

- **`utils/`** - Helper functions
  - CSV parsers, date formatters, validators, string helpers

- **`config/`** - App configuration
  - Environment variables, feature flags, constants

### 🎨 Design System

- **`theme/`** - Theme configuration
  - Colors, typography, spacing, light/dark mode

- **`types/`** - TypeScript type definitions
  - Domain models (Inspection, Workflow, User), API responses, component props

### 📊 Data

- **`data/`** - Static data files
  - CSV files (single_family.csv), seed data, mock data

## Import Conventions

Use path aliases configured in `tsconfig.json`:

```typescript
// ✅ Good - Use path aliases
import { Button } from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { formatDate } from '@/utils/dates';

// ❌ Bad - Avoid relative paths
import { Button } from '../../../components/common';
```

## File Naming Conventions

- **Components:** PascalCase (`Button.tsx`, `PhotoCapture.tsx`)
- **Screens:** PascalCase with "Screen" suffix (`HomeScreen.tsx`, `InspectionScreen.tsx`)
- **Hooks:** camelCase with "use" prefix (`useInspectionWorkflow.ts`)
- **Utils:** camelCase (`csvParser.ts`, `dateFormatter.ts`)
- **Types:** PascalCase (`Inspection.ts`, `User.ts`)

## Code Organization

Each feature-based directory should follow this pattern:

```
inspection/
├── InspectionScreen.tsx      # Main screen component
├── InspectionScreen.styles.ts # Styles (if using styled-components)
├── InspectionScreen.test.tsx  # Unit tests
├── components/                # Screen-specific components
└── index.ts                   # Public exports
```

## Testing

- Unit tests: `*.test.tsx` or `*.test.ts`
- Integration tests: `*.integration.test.tsx`
- Place tests next to the files they test

## Documentation

- Add JSDoc comments for public APIs
- Document complex business logic
- Keep README.md files updated in subdirectories
