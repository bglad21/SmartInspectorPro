# Smart Inspector Pro - Design Patterns & Style Guide

**Version**: 1.0.0
**Last Updated**: October 19, 2025
**Based On**: Home Screen Implementation (Phase 8, Task P8-T02)
**Status**: ✅ Active Standard - Use for all new screens

---

## Table of Contents

1. [Overview](#overview)
2. [MenuCard Pattern](#menucard-pattern)
3. [Tab Navigation Pattern](#tab-navigation-pattern)
4. [Quick Actions Pattern](#quick-actions-pattern)
5. [Header Pattern](#header-pattern)
6. [Color Coding System](#color-coding-system)
7. [Typography Standards](#typography-standards)
8. [Spacing & Layout](#spacing--layout)
9. [Screen Structure Template](#screen-structure-template)

---

## Overview

This document defines the visual and interaction patterns established in the Home Screen implementation. These patterns create consistency across the app and should be followed for all new screen development.

### Design Philosophy

1. **Tab-Based Organization**: Group related features into logical tabs
2. **Priority-Focused**: Most important actions prominently displayed
3. **Visual Hierarchy**: Accent stripes and color coding guide attention
4. **Theme-Aware**: All patterns support light/dark mode
5. **Touch-Optimized**: 44px+ touch targets, instant visual feedback
6. **Accessible**: Screen reader support, high contrast, semantic roles

---

## MenuCard Pattern

**Purpose**: Primary navigation card for all menu/feature lists

### Visual Design

```
┌────────────────────────────────────────┐
│█ [○] Menu Card Title             [>] │ ← 4px accent stripe
└────────────────────────────────────────┘
```

### Key Features

- **4px Accent Stripe**: Colored left edge (position: absolute)
- **Icon Circle**: 34x34px with 13% opacity tinted background
- **Large Title**: 16px font (vs standard 14px)
- **Pressed State**: Background color change
- **Optional Badge**: Notification counter
- **Chevron**: Right-side indicator

### Technical Specifications

```typescript
interface MenuCardProps {
  title: string; // Card title
  icon: string; // Material Community Icon name
  iconColor?: string; // Accent color (defaults to theme.primary)
  badge?: string; // Optional badge text
  onPress: () => void; // Navigation callback
  fullWidth?: boolean; // Full width vs 48.5%
}
```

### Styling Specs

| Property          | Value                                | Notes                                  |
| ----------------- | ------------------------------------ | -------------------------------------- |
| **Accent Stripe** | 4px width, full height               | position: absolute, left: 0            |
| **Icon Circle**   | 34x34px, borderRadius 17px           | background: `${color}22` (13% opacity) |
| **Icon Size**     | 24px                                 | Material Community Icons               |
| **Card Padding**  | 11px vertical, 18px left, 14px right | Asymmetric for stripe                  |
| **Title Font**    | 16px, fontWeight 600                 | Larger, semi-bold                      |
| **Border**        | 1px solid theme.colors.border        | Rounded 12px                           |
| **Shadow**        | None (shadowOpacity: 0)              | Cleaner look                           |
| **Spacing**       | 10px marginBottom                    | Between cards                          |

### Implementation Example

```typescript
<MenuCard
  title="My Inspections"
  icon="clipboard-list-outline"
  iconColor="#2196F3"
  onPress={() => navigation.navigate('MyInspections')}
  fullWidth
/>

<MenuCard
  title="Notifications"
  icon="bell-outline"
  iconColor="#F44336"
  badge="3"
  onPress={() => navigation.navigate('Notifications')}
  fullWidth
/>
```

### When to Use

- ✅ Navigation menus (Home, Settings)
- ✅ Feature dashboards
- ✅ Action lists with icons
- ❌ Data tables (use CSVDataTable)
- ❌ Inspection records (use InspectionCard)

---

## Tab Navigation Pattern

**Purpose**: Organize features into logical groups

### Visual Design

```
┌────────────────────────────────────────────┐
│ [📋 Inspector] [💼 Business] [⚙️ Manage] │
└────────────────────────────────────────────┘
    ━━━━━━━━━━━━                              ← 3px bottom border on active
```

### Tab Structure

```typescript
interface Tab {
  id: string; // 'inspector' | 'business' | 'manage'
  label: string; // Display text
  icon: string; // Material Community Icon name
}
```

### Styling Specs

| Property           | Value                            | Notes                          |
| ------------------ | -------------------------------- | ------------------------------ |
| **Layout**         | flexDirection: 'row', equal flex | 3 equal-width tabs             |
| **Alignment**      | Centered icon + label            | Vertical flexbox               |
| **Icon Size**      | 22px                             | Slightly smaller than MenuCard |
| **Label Font**     | 13px, fontWeight 600             | Small but readable             |
| **Active Border**  | 3px bottom, theme.colors.primary | Visual indicator               |
| **Active Color**   | theme.colors.primary             | Icon + text                    |
| **Inactive Color** | theme.colors.textSecondary       | Muted appearance               |
| **Gap**            | 6px between icon and label       | Tight spacing                  |
| **Padding**        | 12px vertical                    | Touch-friendly height          |

### Implementation Example

```typescript
const [activeTab, setActiveTab] = useState<'inspector' | 'business' | 'manage'>(
  'inspector',
);

<View style={styles.tabBar}>
  <TouchableOpacity
    style={[styles.tab, activeTab === 'inspector' && styles.tabActive]}
    onPress={() => setActiveTab('inspector')}
  >
    <Icon name="clipboard-check-outline" size={22} />
    <ThemedText variant="body2" style={styles.tabLabel}>
      Inspector
    </ThemedText>
  </TouchableOpacity>
  {/* Repeat for other tabs */}
</View>;
```

### Tab Content Guidelines

1. **Section Headers**: Use h6 variant, fontWeight 700
2. **Card Grouping**: Group related features under sections
3. **Spacing**: 20px top padding, 16px horizontal padding
4. **ScrollView**: Vertical with 32px bottom padding

---

## Quick Actions Pattern

**Purpose**: Highlight 1-2 most important actions above tabs

### Visual Design

```
┌────────────────────────────────────────────┐
│ [🏠 New Inspection]  [📅 Schedule]        │
└────────────────────────────────────────────┘
```

### Styling Specs

| Property         | Value                                          | Notes                       |
| ---------------- | ---------------------------------------------- | --------------------------- |
| **Layout**       | flexDirection: 'row', gap: 12px                | Side-by-side                |
| **Button Style** | flex: 1, rounded 12px, elevation 3             | Equal width                 |
| **Padding**      | 16px vertical, 12px horizontal                 | Comfortable touch area      |
| **Icon Size**    | 28px                                           | Larger than MenuCard        |
| **Text Color**   | #FFFFFF                                        | White on colored background |
| **Font**         | fontWeight 600                                 | Semi-bold                   |
| **Colors**       | Green (#4CAF50), Blue (#2196F3)                | Primary actions             |
| **Container**    | 16px horizontal padding, 16px top, 12px bottom | Page-level spacing          |

### Implementation Example

```typescript
<View style={styles.quickActionsContainer}>
  <View style={styles.quickActionsGrid}>
    <QuickActionButton
      title="New Inspection"
      icon="home-plus-outline"
      color="#4CAF50"
      onPress={() => navigation.navigate('NewInspection')}
    />
    <QuickActionButton
      title="Schedule"
      icon="calendar-plus"
      color="#2196F3"
      onPress={() => navigation.navigate('ScheduleInspection')}
    />
  </View>
</View>
```

---

## Header Pattern

**Purpose**: Consistent top-of-screen branding and context

### Visual Design

```
┌────────────────────────────────────────────┐
│ Hello, Brandon                        🔔₃ │
│ Ready to inspect today?                   │
└────────────────────────────────────────────┘
```

### Styling Specs

| Property              | Value                                  | Notes                |
| --------------------- | -------------------------------------- | -------------------- |
| **Background**        | theme.colors.primary                   | Brand color          |
| **Text Color**        | #FFFFFF                                | White text           |
| **Padding**           | 12px top, 16px bottom, 20px horizontal | Compact but readable |
| **Greeting Font**     | h5 variant, fontWeight 700             | Prominent            |
| **Subtext Font**      | body2 variant, 90% opacity             | Softer               |
| **Notification Icon** | 28px, white, with badge                | Top right            |
| **Badge Style**       | 18x18px circle, error color            | Top-right of icon    |
| **Shadow**            | elevation 4, shadowOpacity 0.15        | Subtle depth         |

### Implementation Example

```typescript
<View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
  <View style={styles.headerContent}>
    <View style={styles.greetingContainer}>
      <ThemedText variant="h5" style={{ color: '#FFFFFF' }}>
        Hello, {firstName}
      </ThemedText>
      <ThemedText variant="body2" style={{ color: 'rgba(255,255,255,0.9)' }}>
        Ready to inspect today?
      </ThemedText>
    </View>

    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
      <Icon name="bell-outline" size={28} color="#FFFFFF" />
      <View style={styles.notificationBadge}>
        <ThemedText variant="caption" style={{ color: '#FFFFFF' }}>
          3
        </ThemedText>
      </View>
    </TouchableOpacity>
  </View>
</View>
```

---

## Color Coding System

**Purpose**: Consistent semantic color usage across all screens

### Standard Colors

| Color             | Hex     | RGB               | Use Cases                                               |
| ----------------- | ------- | ----------------- | ------------------------------------------------------- |
| 🟢 **Green**      | #4CAF50 | rgb(76, 175, 80)  | Success, workflow, calendar, membership, new inspection |
| 🔵 **Blue**       | #2196F3 | rgb(33, 150, 243) | Primary actions, inspections, contacts, help, schedule  |
| 🟠 **Orange**     | #FF9800 | rgb(255, 152, 0)  | In-progress, continue inspection, accounting            |
| 🟣 **Purple**     | #9C27B0 | rgb(156, 39, 176) | Team features, collaboration, store                     |
| 🔴 **Red**        | #F44336 | rgb(244, 67, 54)  | Notifications, alerts, urgent items                     |
| 🟠 **Orange-Red** | #FF5722 | rgb(255, 87, 34)  | Report templates, documents                             |
| 🔵 **Cyan**       | #00BCD4 | rgb(0, 188, 212)  | Forms, data management                                  |
| ⚫ **Gray**       | #607D8B | rgb(96, 125, 139) | Settings, system tools, inspection data                 |

### Color Usage Rules

1. **Consistency**: Use same color for same feature type across all screens
2. **Accessibility**: Minimum 4.5:1 contrast ratio for text
3. **Icon Backgrounds**: Always use 13% opacity (`${color}22` hex alpha)
4. **Dark Mode**: Colors remain consistent, theme handles text contrast
5. **Accent Stripes**: Use full opacity color, not tinted

### TypeScript Color Constants

```typescript
export const MENU_COLORS = {
  success: '#4CAF50', // Green
  primary: '#2196F3', // Blue
  inProgress: '#FF9800', // Orange
  team: '#9C27B0', // Purple
  alert: '#F44336', // Red
  template: '#FF5722', // Orange-red
  data: '#00BCD4', // Cyan
  system: '#607D8B', // Gray
} as const;
```

---

## Typography Standards

**Purpose**: Consistent text hierarchy using ThemedText variants

### Font Variants

| Variant     | Size | Weight | Line Height | Use Case                   |
| ----------- | ---- | ------ | ----------- | -------------------------- |
| **h1**      | 32px | 700    | 38px        | Page titles                |
| **h2**      | 28px | 700    | 34px        | Section titles             |
| **h3**      | 24px | 600    | 30px        | Card titles                |
| **h4**      | 20px | 600    | 26px        | Subsection titles          |
| **h5**      | 18px | 600    | 24px        | Header greeting            |
| **h6**      | 16px | 700    | 22px        | Section headers            |
| **body1**   | 16px | 400    | 24px        | MenuCard titles, body text |
| **body2**   | 14px | 400    | 20px        | Descriptions, captions     |
| **caption** | 12px | 400    | 16px        | Metadata, timestamps       |

### Usage Examples

```typescript
// Page title
<ThemedText variant="h1">My Inspections</ThemedText>

// Section header
<ThemedText variant="h6" style={styles.sectionTitle}>
  Business Tools
</ThemedText>

// MenuCard title (automatically uses body1)
<ThemedText variant="body1" style={styles.menuCardTitle}>
  Workflow Editor
</ThemedText>

// Subtitle or description
<ThemedText variant="body2" style={styles.subtitle}>
  Last updated 2 hours ago
</ThemedText>
```

### Font Weight Rules

- **700 (Bold)**: h1, h2, h6 section headers
- **600 (Semi-bold)**: h3-h5, MenuCard titles, tab labels
- **400 (Regular)**: Body text, descriptions, captions

---

## Spacing & Layout

**Purpose**: Consistent whitespace and rhythm

### Spacing Scale

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
```

### Layout Guidelines

| Element                       | Spacing                   | Notes                 |
| ----------------------------- | ------------------------- | --------------------- |
| **Page Horizontal Padding**   | 16px                      | Standard page margins |
| **Tab Content Top Padding**   | 20px                      | Below tab bar         |
| **Section Title Bottom**      | 12px                      | Space before cards    |
| **Section Spacing**           | 24px marginTop            | Between sections      |
| **Card Bottom Margin**        | 10px                      | Between MenuCards     |
| **Quick Actions Gap**         | 12px                      | Between buttons       |
| **Icon-to-Text Gap**          | 6px (tabs), 8px (buttons) | Tight coupling        |
| **ScrollView Bottom Padding** | 32px                      | Breathing room        |

### Border Radius Scale

```typescript
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Usage
borderRadius: BORDER_RADIUS.md; // 12px for MenuCard
```

---

## Screen Structure Template

**Purpose**: Starting point for new screens with consistent patterns

### Basic Screen Template

```typescript
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const MyScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <ThemedText variant="h5" style={{ color: '#FFFFFF' }}>
          Screen Title
        </ThemedText>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Section Header */}
          <ThemedText variant="h6" style={styles.sectionTitle}>
            Section Name
          </ThemedText>

          {/* MenuCards */}
          <MenuCard
            title="Feature Name"
            icon="icon-name"
            iconColor="#2196F3"
            onPress={() => navigation.navigate('TargetScreen')}
            fullWidth
          />
        </View>
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
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '700',
  },
});
```

### Tab-Based Screen Template

```typescript
export const MyTabScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tab1':
        return (
          <View style={styles.tabContent}>
            <ThemedText variant="h6" style={styles.sectionTitle}>
              Section Name
            </ThemedText>
            {/* MenuCards */}
          </View>
        );
      case 'tab2':
        return <View style={styles.tabContent}>{/* Tab 2 content */}</View>;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        {/* Header content */}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tab1' && styles.tabActive]}
          onPress={() => setActiveTab('tab1')}
        >
          <Icon name="icon-name" size={22} />
          <ThemedText variant="body2">Tab 1</ThemedText>
        </TouchableOpacity>
        {/* Additional tabs */}
      </View>

      {/* Tab Content */}
      <ScrollView>{renderTabContent()}</ScrollView>
    </ThemedView>
  );
};
```

---

## Summary Checklist

When creating a new screen, ensure:

- ✅ Use ThemedView and ThemedText (never hardcoded colors)
- ✅ MenuCard pattern for navigation lists with 4px accent stripe
- ✅ Color coding system for icon colors
- ✅ Tab navigation if 3+ feature groups
- ✅ Quick actions for 1-2 primary CTAs
- ✅ Header with greeting/title and optional notifications
- ✅ Section headers (h6 variant) for grouping
- ✅ Consistent spacing (16px horizontal padding, etc.)
- ✅ Accessibility props (accessibilityRole, accessibilityLabel)
- ✅ TypeScript interfaces for all props
- ✅ Material Community Icons only

---

**Reference Implementation**: `src/screens/home/HomeScreen.tsx` (478 lines)
**Component Library**: `Docs/COMPONENT_LIBRARY.md` (MenuCard section)
**Code Standards**: `Docs/CODE_STANDARDS.md` (MenuCard pattern section)
