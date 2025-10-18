# Components Directory

Reusable React Native components organized by feature domain.

## Structure

### `common/` - Generic UI Components

Reusable components used throughout the app. No business logic.

**Examples:**

- `Button.tsx` - Custom button with loading states
- `Card.tsx` - Container with shadow and borders
- `Modal.tsx` - Fullscreen/partial modal overlay
- `Input.tsx` - Text input with validation
- `LoadingSpinner.tsx` - Activity indicator
- `ErrorBoundary.tsx` - Error handling component

**Usage:**

```typescript
import { Button, Card, Modal } from '@/components/common';
```

### `inspection/` - Inspection Feature Components

Components specific to the inspection workflow.

**Examples:**

- `PhotoCapture.tsx` - Camera interface with photo preview
- `AIPredictor.tsx` - AI analysis results display
- `InspectionTracker.tsx` - Progress indicator for inspection steps
- `HierarchySelector.tsx` - Section → System → Component selector
- `ConditionPicker.tsx` - Condition type selection (Acceptable, Monitor, etc.)
- `CommentsList.tsx` - Pre-written comments selection

### `data/` - Data Visualization Components

Components for displaying and filtering CSV data.

**Examples:**

- `CSVViewer.tsx` - Table view of CSV data
- `FilterButtons.tsx` - Drag-and-drop filter controls
- `HierarchyNavigator.tsx` - Breadcrumb navigation for CSV hierarchy
- `WorkflowPreview.tsx` - Visual preview of custom workflow

## Component Standards

### File Structure

```typescript
// Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
}) => {
  // Component implementation
};

const styles = StyleSheet.create({
  // Styles
});
```

### Export Pattern

Use named exports for components:

```typescript
export { Button } from './Button';
export { Card } from './Card';
```

### Props Interface

Always define TypeScript interfaces for props:

```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  callback: (value: string) => void;
}
```

### Testing

Create test files next to components:

```
Button.tsx
Button.test.tsx
```

## Best Practices

1. **Single Responsibility** - Each component does one thing well
2. **Composition Over Inheritance** - Build complex UIs from simple components
3. **Props Over State** - Prefer props for data flow (controlled components)
4. **TypeScript First** - Always define prop types
5. **Accessibility** - Use `accessibilityLabel`, `accessibilityRole`
6. **Performance** - Use `React.memo` for expensive components
