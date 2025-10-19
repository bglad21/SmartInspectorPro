# Smart Inspector Pro - AI Agent Instructions

## Project Overview

Smart Inspector Pro is a **React Native mobile app** for professional residential home inspections with AI-powered features. **ACTIVE DEVELOPMENT** with foundation and core features implemented.

**Current Status**: 🚧 Phase 8 in progress (33% complete) - Foundation phases complete
**Progress**: 22/68 tasks complete (32%) across 20 phases
**Primary Development Guide**: `Docs/BUILD_CHECKLIST.md` (68 tasks across 20 phases, ~86-90 days)
**Main Specification**: `Docs/Smart_Inspector_Pro_Build_Layout.md` (complete 2,189-line technical spec)
**Core Data**: `Docs/Single_Family.csv` (33,432 inspection items) + `Docs/single_family_sample.csv` (2,504 sample items)

## 🚀 HOW TO USE THE BUILD CHECKLIST

### Current Implementation Status (Updated: October 18, 2025)

**✅ COMPLETED PHASES (Phases 1-7):**

- **Phase 1**: Development Environment Setup (3/3 tasks) - Node.js, Xcode, Android Studio configured
- **Phase 2**: Project Initialization (3/3 tasks) - React Native 0.82.0 project with TypeScript
- **Phase 3**: AWS Infrastructure Integration (2/2 tasks) - AWS Amplify v6, Cognito, S3 with CloudFront
- **Phase 4**: Authentication System (3/3 tasks) - Full auth service with Redux integration
- **Phase 5**: Data Layer & CSV Management (3/3 tasks) - SQLite database, CSV parser, sync engine
- **Phase 6**: Theme System Implementation (2/2 tasks) - Light/dark themes with ThemeContext
- **Phase 7**: Core UI Components (3/3 tasks) - 18 reusable components (buttons, cards, modals, inspection components)

**🔄 IN PROGRESS:**

- **Phase 8**: Navigation & Screen Structure (1/3 tasks, 33%) - React Navigation configured, HomeScreen implemented
  - ✅ P8-T01: Set up React Navigation (MainStack, Auth flow ready)
  - ✅ P8-T02: Create Home Screen (19 navigation cards, 4 collapsible sections)
  - ⏳ P8-T03: Create Inspection Management Screens (pending)

**📦 KEY IMPLEMENTED FILES:**

```
src/
├── config/aws-config.ts           # AWS Amplify configuration (215 lines)
├── services/
│   ├── auth.service.ts             # Cognito authentication (426 lines)
│   ├── s3.service.ts               # S3 with CloudFront (616 lines)
│   ├── database.service.ts         # SQLite service (773 lines)
│   ├── csv-parser.service.ts       # CSV parsing (492 lines)
│   └── sync.service.ts             # Offline-first sync (382 lines)
├── redux/
│   ├── store.ts                    # Redux Toolkit store
│   └── slices/auth.slice.ts        # Auth state management (286 lines)
├── theme/
│   ├── lightTheme.ts               # Light theme colors/typography
│   └── darkTheme.ts                # Dark theme colors/typography
├── components/
│   ├── common/                     # 10 base components (Button, Card, Modal, etc.)
│   ├── inspection/                 # 6 inspection components (PhotoThumbnail, HierarchySelector, etc.)
│   └── data/                       # 5 data components (CSVDataTable, FilterChips, etc.)
├── navigation/
│   └── MainStack.tsx               # Stack navigator with auth flow
└── screens/
    ├── auth/LoginScreen.tsx        # Authentication screen
    └── home/HomeScreen.tsx         # Main landing screen (478 lines)
```

**🔑 DEVELOPMENT COMMANDS (Active):**

```bash
# Install dependencies
npm install

# iOS development
npm run ios
# or: npx react-native run-ios

# Android development
npm run android
# or: npx react-native run-android

# Start Metro bundler
npm start

# Type checking
npx tsc --noEmit

# Run tests
npm test

# Apply patches (SQLite fix)
npm run postinstall
```

## 🎯 Critical Patterns for AI Agents

### Database Service Pattern (SQLite + Sync)

```typescript
// Always use the singleton database service
import { DatabaseService } from '@/services/database.service';
const DB = DatabaseService.getInstance();

// Initialize once on app start
await DB.initialize();

// CRUD operations return typed results
const user = await DB.createUser({ email, businessName, membershipTier });
const inspections = await DB.getInspections(userId);

// Sync engine auto-queues changes for cloud sync
// Never directly modify sync_queue table
```

### Theme Integration Pattern

```typescript
// All components MUST use theme hooks for styling
import { useTheme } from '@/theme';

const Component = () => {
  const { colors, fonts, spacing } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <ThemedText variant="h1">Title</ThemedText>
    </View>
  );
};

// Use ThemedText/ThemedView for automatic theme support
// Avoid hardcoded colors - always reference theme.colors.*
```

### Redux State Management Pattern

```typescript
// Use typed hooks from @/redux/hooks
import { useAppSelector, useAppDispatch } from '@/redux/hooks';

// Access auth state
const { user, isAuthenticated } = useAppSelector(state => state.auth);

// Dispatch actions
const dispatch = useAppDispatch();
dispatch(authSlice.actions.setUser(userData));

// Auth slice location: src/redux/slices/auth.slice.ts
```

### AWS Amplify Integration Pattern

```typescript
// Amplify configured once in App.tsx
// Services wrap Amplify APIs with error handling

// Auth Service (src/services/auth.service.ts)
import { AuthService } from '@/services/auth.service';
const result = await AuthService.signIn(email, password);

// S3 Service (src/services/s3.service.ts)
import { S3Service } from '@/services/s3.service';
const url = await S3Service.uploadPhoto(file, inspectionId);

// Always use service wrappers, never call Amplify directly
```

### Navigation Pattern

```typescript
// Type-safe navigation with MainStackParamList
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home'>;
};

// Navigate with typed parameters
navigation.navigate('InspectionDetail', { inspectionId: '123' });

// MainStack location: src/navigation/MainStack.tsx
```

### CSV Hierarchy Pattern (CRITICAL)

```typescript
// 6-level hierarchy is IMMUTABLE pattern
// Section → System → Location → Component → Material → Condition

// Example record structure:
{
  section: 'Exterior Grounds',      // Required
  system: 'Drainage',                // Required
  location: null,                    // Optional
  component: 'Area Drain',           // Required
  material: 'Concrete',              // Required
  condition: 'Monitor',              // Required (5 fixed values)
  comment: 'Minor debris noted'      // Optional
}

// Condition types (NEVER add more):
type ConditionType =
  | 'Acceptable'
  | 'Monitor'
  | 'Repair/Replace'
  | 'Safety Hazard'
  | 'Access Restricted';
```

### Component Library Pattern

```typescript
// Import from organized component folders
import { Button, Card, Modal } from '@/components/common';
import { PhotoThumbnail, HierarchySelector } from '@/components/inspection';
import { CSVDataTable, FilterChips } from '@/components/data';

// All components use:
// - TypeScript interfaces for props
// - Theme integration (useTheme hook)
// - Accessibility props (accessibilityLabel, accessibilityRole)
// - testID for E2E tests
```

### Starting Development

When the user begins development, **ALWAYS follow the Docs/BUILD_CHECKLIST.md** systematically:

1. **User copies a Copilot Prompt** from Docs/BUILD_CHECKLIST.md (e.g., P1-T01)
2. **User pastes the prompt** into a new Copilot conversation
3. **Agent follows the Standard Copilot Operating Procedures (SOPs)**:

   - Step 1: Acknowledge & Analyze the task
   - Step 2: Plan & Execute the steps
   - Step 3: Test & Validate locally
   - Step 4: Verify & Document with evidence
   - Step 5: Handle any blockers
   - Step 6: Update & Finalize documentation

4. **Agent completes all acceptance criteria** with evidence
5. **Agent instructs user** to check off the task in Docs/BUILD_CHECKLIST.md: `[x] P#-T##`
6. **User proceeds to next task** in sequential order

### Critical Rules for Agents

- ✅ **ALWAYS reference Docs/BUILD_CHECKLIST.md** when user asks to start development
- ✅ **Follow the 6-step SOPs** for every task (no shortcuts)
- ✅ **Complete ALL acceptance criteria** before declaring task done
- ✅ **Provide evidence** (screenshots, command output, file paths, test results)
- ✅ **Update documentation** as specified in each task
- ✅ **Never skip prerequisites** - verify previous tasks are complete
- ✅ **Test locally first** before external integrations
- ❌ **DON'T jump ahead** - tasks build on each other sequentially
- ❌ **DON'T assume completion** - user must verify and checkoff

### Task Format Understanding

Each task in Docs/BUILD_CHECKLIST.md follows this structure:

```
### P#-T##: Task Name

**Copilot Prompt**: [Copy-paste ready prompt with SOPs]
**Goal**: [One-sentence objective]
**Prerequisites**: [Required previous tasks]
**Copilot Reference**: [Relevant documentation files]
**Steps**: [Numbered checklist of actions]
**Acceptance Criteria**: [Checkboxes for completion verification]
**Evidence Required**: [What to provide as proof]
**Documents to Update**: [Files to modify after completion]
```

### Progress Tracking

- **68 total tasks** organized across 20 phases
- **Days 1-90+**: Complete timeline from setup to production launch
- User checks off tasks as `[x] P#-T##` to track progress
- Each phase builds upon previous phases systematically

## Architecture & Technology Stack

### Frontend (✅ Implemented)

- **Framework**: React Native 0.82.0 with TypeScript 5.8+
- **State Management**: Redux Toolkit 2.9+ with Redux hooks (`useAppSelector`, `useAppDispatch`)
- **Navigation**: React Navigation v7 with native-stack navigator
- **UI Components**: React Native Paper 5.14+ for Material Design, custom component library (21 components)
- **Local Storage**: React Native SQLite Storage 6.0+ with custom service layer (773 lines)
- **File Handling**: Papa Parse 5.5+ for CSV processing (33,432 inspection items supported)
- **AWS Integration**: AWS Amplify v6 with Cognito User Pools and S3 + CloudFront

### Backend (Planned - Not Yet Implemented)

- **Framework**: React Native 0.72+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation v6
- **UI Components**: React Native Elements + React Native Paper
- **Local Storage**: React Native SQLite
- **File Handling**: Papa Parse for CSV processing

### Backend (Planned - Not Yet Implemented)

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (AWS RDS) with Redis ElastiCache for caching
- **Storage**: AWS S3 with CloudFront CDN
- **AI Integration**: OpenAI GPT-4 Vision (photo recognition) + GPT-4 Turbo (report generation)
- **Authentication**: AWS Cognito (User Pools + Identity Pools)
- **Real-time**: Socket.io for team collaboration

## Data Structure Philosophy

### CSV Hierarchy (Critical Pattern)

The app revolves around a **6-level hierarchical inspection workflow**:

```
Section → System → Location → Component → Material → Condition
```

**Example from CSV**:

```csv
Section: Exterior Grounds
System: Drainage
Location: Null (optional)
Component: Area Drain
Material: Concrete
Condition: Monitor
Comment: "Minor debris noted; monitor and clean as needed."
```

**Condition Types** (always one of these 5):

1. `Acceptable` - No issues
2. `Monitor` - Minor issues to watch
3. `Repair/Replace` - Action required
4. `Safety Hazard` - Immediate attention
5. `Access Restricted` - Cannot inspect

### Database Design Principles

- **Multi-tenant architecture** with user/team isolation
- **Workflow customization**: Users filter/reorder CSV data to create custom inspection workflows
- **Offline-first**: SQLite local storage syncs to PostgreSQL cloud
- **JSON flexibility**: Use JSONB columns for dynamic configurations (workflows, permissions, metadata)

## Premium Feature Model

### AI Photo Recognition (Premium Add-on: $29.99/month)

- **Implementation**: OpenAI GPT-4 Vision API (~$0.02/image)
- **Workflow**: Photo → AI analysis → Suggested hierarchy values → One-click accept or manual override
- **Accuracy Targets**: Component (95%), Material (88%), Condition (85%)
- **Value Proposition**: 2-3x faster inspection workflow

### Subscription Tiers

- **Professional** ($89.99/mo): Unlimited inspections, 5 team members, AI report generation, 50GB storage
- **Enterprise** ($149.99/mo): Adds AI Photo Recognition (500 analyses/mo), 10 team members, 200GB storage

## Key Screen Workflows

### 1. Smart Inspector Screen (Core UX)

**6-Step Hierarchical Selection** (unless AI shortcut used):

```
Step 1: Capture photo
Step 2: Select Section (Exterior Grounds, Interior, Mechanical, Structure)
Step 3: Select System (Drainage, Driveway, Landscaping, etc.)
Step 4: Select Location (Front Yard, Back Yard, etc.) - OPTIONAL
Step 5: Select Component (Area Drain, Drainage Swale, etc.)
Step 6: Select Material (Concrete, PVC, HDPE, etc.)
Step 7: Select Condition (Acceptable, Monitor, etc.)
Step 8: Select Comments (pre-written or custom)
```

**With AI**: Photo → AI suggests all values → Review → Submit (3 steps vs 8)

### 2. Workflow Editor Pattern

- Base table selection (default: `Single_Family.csv`)
- Hierarchical filtering using drag-and-drop toggles
- Filter by Section → System → Component → Material → Condition
- Save custom workflows; share with team via codes/QR

### 3. Team Collaboration Flow

- Real-time inspection sharing via Socket.io
- Role-based permissions (Team Leader, Senior Inspector, Assistant)
- Share via codes, QR codes, or email invitations
- Live photo sync and comment collaboration

## File Structure Conventions (When Implemented)

```
SmartInspectorPro/
├── src/
│   ├── components/        # Reusable UI (Button, Card, Modal, etc.)
│   │   ├── common/       # Generic components
│   │   ├── inspection/   # PhotoCapture, AIPredictor, InspectionTracker
│   │   └── data/         # CSVViewer, FilterButtons, HierarchyNavigator
│   ├── screens/          # Full-screen views (HomeScreen, WorkflowEditorScreen)
│   ├── navigation/       # React Navigation config (Stack + Tab navigators)
│   ├── redux/            # Redux slices (auth, inspections, workflows)
│   ├── services/         # API clients, OpenAI integration, AWS S3 utils
│   ├── utils/            # CSV parsers, date formatters, validators
│   ├── data/             # CSV files (single_family.csv, add-ons)
│   └── types/            # TypeScript interfaces (Inspection, Workflow, User)
├── backend/              # Node.js API server
│   ├── routes/           # Express routes (/api/inspections, /api/ai)
│   ├── models/           # Sequelize/TypeORM models
│   └── middleware/       # Auth, error handling, rate limiting
└── database/             # SQL schemas and migrations
```

## Development Commands (Future)

```bash
# Mobile app (when implemented)
npm install
npx react-native run-ios
npx react-native run-android

# Backend server (when implemented)
cd backend && npm install
npm run dev  # Development with hot reload
npm run migrate  # Run database migrations

# CSV data processing
# Use Papa Parse in utils/csvParser.ts to read Single_Family.csv
```

## Critical Implementation Notes

### CSV Processing

- **Never modify** `Single_Family.csv` directly (33,432 items is the source of truth)
- Use `single_family_sample.csv` (2,504 items) for testing/demos
- Papa Parse handles large files; implement pagination for mobile performance
- Cache parsed CSV in SQLite for offline access

### AI Integration Cost Management

- **Rate limiting**: Enforce monthly limits per subscription tier
- **Caching**: Store AI predictions per photo to avoid duplicate API calls
- **Fallback**: Always provide manual workflow if AI fails or quota exceeded
- **Analytics**: Track AI accuracy to improve prompts over time

### Offline-First Strategy

- SQLite is primary data store on device
- Background sync queue for cloud updates
- Conflict resolution: Last-write-wins with timestamp comparison
- Critical data (inspections in progress) always persisted locally first

### Security Requirements

- **AWS Cognito authentication** with JWT tokens and refresh tokens
- **Cognito User Pools** for user authentication and management
- **Cognito Identity Pools** for temporary AWS credentials (S3 access)
- Role-based access control (RBAC) enforced in backend with Cognito Groups
- End-to-end encryption for inspection photos in S3
- Digital signature validation for legal forms
- Audit logging for compliance (GDPR, state inspection regulations)

## Code Style Conventions (When Coding Begins)

### TypeScript Patterns

```typescript
// Always define interfaces for domain models
interface Inspection {
  id: string;
  userId: string;
  propertyAddress: string;
  scheduledDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  workflowId: string;
  records: InspectionRecord[];
}

// Use discriminated unions for condition types
type ConditionType =
  | 'Acceptable'
  | 'Monitor'
  | 'Repair/Replace'
  | 'Safety Hazard'
  | 'Access Restricted';
```

### React Native Patterns

- Functional components with hooks (no class components)
- Custom hooks for business logic (`useInspectionWorkflow`, `useAIAnalysis`)
- Styled-components or StyleSheet for styling (consistent with React Native Paper)
- Lazy loading for large lists (`FlatList` with `windowSize` optimization)

### API Patterns

```typescript
// RTK Query example
const inspectionApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    getInspections: builder.query<Inspection[], void>(),
    createInspection: builder.mutation<Inspection, CreateInspectionDto>(),
  }),
});
```

## Common Pitfalls to Avoid

1. **Don't flatten the CSV hierarchy** - The 6-level structure is core to the UX
2. **Don't skip SQLite** - Offline access is non-negotiable for field inspections
3. **Don't hardcode condition types** - Always use the 5 defined condition values
4. **Don't expose OpenAI API keys** - Backend proxy only; never in mobile app
5. **Don't ignore team permissions** - Implement RBAC from day one, not as an afterthought
6. **Don't call Amplify directly** - Always use service wrappers (auth.service.ts, s3.service.ts)
7. **Don't bypass theme system** - Never hardcode colors; use `theme.colors.*`
8. **Don't forget TypeScript checks** - Run `npx tsc --noEmit` before committing
9. **Don't modify Single_Family.csv** - Use single_family_sample.csv for testing
10. **Don't skip evidence documentation** - Every completed task needs CompletedTaskEvidence

## 🔧 Key File Locations

### Configuration & Entry Points

- `App.tsx` - Root component, Amplify initialization, ThemeProvider, Redux Provider
- `src/config/aws-config.ts` - AWS credentials (215 lines, region, IDs, buckets)
- `src/redux/store.ts` - Redux store configuration with auth slice
- `package.json` - React Native 0.82.0, all dependencies, scripts

### Services Layer (Business Logic)

- `src/services/auth.service.ts` (426 lines) - Cognito auth wrapper (signIn, signUp, signOut, getUser)
- `src/services/database.service.ts` (773 lines) - SQLite singleton with CRUD operations
- `src/services/s3.service.ts` (616 lines) - S3 uploads with CloudFront CDN URLs
- `src/services/csv-parser.service.ts` (492 lines) - Parse CSV with hierarchy validation
- `src/services/sync.service.ts` (382 lines) - Offline-first sync queue manager

### UI Component Library

- `src/components/common/` - 10 base components (Button, Card, Modal, TextInput, Badge, etc.)
- `src/components/inspection/` - 6 inspection components (PhotoThumbnail, HierarchySelector, InspectionCard, etc.)
- `src/components/data/` - 5 data components (CSVDataTable, FilterChips, SearchBar, etc.)
- `src/components/common/CollapsibleSection.tsx` (389 lines) - Animated sections with AsyncStorage persistence

### Screens & Navigation

- `src/navigation/MainStack.tsx` - Stack navigator with auth flow (Login → Home)
- `src/screens/auth/LoginScreen.tsx` - Authentication screen with Cognito integration
- `src/screens/home/HomeScreen.tsx` (478 lines) - Main landing screen with 19 navigation cards
- `src/screens/PlaceholderScreen.tsx` - Placeholder for unimplemented screens

### Theme System

- `src/theme/ThemeContext.tsx` - Theme provider with light/dark mode toggle
- `src/theme/lightTheme.ts` - Light theme colors, typography, spacing
- `src/theme/darkTheme.ts` - Dark theme colors, typography, spacing
- `src/components/common/ThemedText.tsx` - Typography component (h1-h6, body, caption variants)
- `src/components/common/ThemedView.tsx` - Container component with theme-aware background

### Testing & Documentation

- `src/services/__tests__/` - Service usage examples (auth, s3)
- `CompletedTaskEvidence/Phase_*/` - Task completion evidence by phase
- `Docs/BUILD_CHECKLIST.md` - 68-task systematic build guide
- `Docs/CHANGELOG.md` - Version history with detailed feature documentation

## 🐛 Debugging Workflows

### Build Issues

```bash
# Clean iOS build
cd ios && rm -rf build && pod deintegrate && pod install && cd ..

# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Metro bundler cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules && npm install && npm run postinstall
```

### TypeScript Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Common fixes:
# 1. Missing imports: Check src/types/ for type definitions
# 2. Redux types: Use useAppSelector/useAppDispatch from @/redux/hooks
# 3. Navigation types: Import MainStackParamList from @/navigation/MainStack
```

### SQLite Issues

```bash
# Check patches applied
npm run postinstall

# Verify patch exists
cat patches/react-native-sqlite-storage+6.0.1.patch

# Reinstall SQLite package
npm uninstall react-native-sqlite-storage
npm install react-native-sqlite-storage@6.0.1
npm run postinstall
```

### AWS Amplify Issues

```bash
# Verify configuration
cat src/config/aws-config.ts

# Test Cognito connection
# Run LoginScreen and check logs for auth errors

# Test S3 connection
# Check src/services/__tests__/s3.service.examples.ts
```

### Runtime Errors

```bash
# Check Metro bundler logs for detailed errors
npm start

# Enable React Native Debugger
# Shake device/simulator → Enable Remote JS Debugging

# Check Redux DevTools
# Install Redux DevTools extension for Chrome/Safari
```

## Common Pitfalls to Avoid

## Testing Strategy (When Implemented)

- **Unit tests**: Business logic (CSV parsing, workflow filtering, AI response parsing)
- **Integration tests**: API endpoints, database queries, S3 uploads
- **E2E tests**: Critical paths (create inspection → capture photo → generate report)
- **Performance tests**: CSV loading time, photo upload speed, AI response latency

## Documentation References

### Primary Development Guide

- **Docs/BUILD_CHECKLIST.md**: 68-task systematic build guide with copy-paste Copilot prompts (USE THIS FIRST)
  - 20 phases from setup to production launch
  - Standard Copilot Operating Procedures (SOPs)
  - Task format: P#-T## with prerequisites and acceptance criteria
  - Evidence-based completion verification

### Technical Specifications

- **Docs/Smart_Inspector_Pro_Build_Layout.md**: Complete technical specification (all screens, DB schema, API endpoints)
- **Docs/IMPLEMENTATION_ROADMAP.md**: Detailed 6,890-line implementation guide with code examples
- **Docs/API_DOCUMENTATION.md**: REST API endpoints and data models
- **Docs/AWS_INFRASTRUCTURE_COMPLETED.md**: AWS services configuration (Cognito, S3, RDS, etc.)

### Development Standards

- **Docs/CODE_STANDARDS.md**: TypeScript conventions, React Native patterns, naming conventions
- **Docs/COMPONENT_LIBRARY.md**: Reusable component specifications
- **Docs/TESTING_GUIDELINES.md**: Unit, integration, and E2E testing standards
- **Docs/DEPLOYMENT_GUIDE.md**: Production deployment procedures

### Reference Data

- **Docs/Single_Family.csv**: 33,432 inspection items (source of truth - NEVER modify)
- **Docs/single_family_sample.csv**: 2,504 sample items (use for testing/demos)

### Project Management

- **Docs/PROJECT_CONFIGURATION.md**: Confirmed decisions and project setup answers
- **Docs/CHANGELOG.md**: Version history and changes
- **Docs/TROUBLESHOOTING.md**: Common issues and solutions
- **Docs/QUICK_REFERENCE.md**: Quick links and common commands

## When Starting Implementation

### 🎯 START HERE: Use Docs/BUILD_CHECKLIST.md

**The Docs/BUILD_CHECKLIST.md is your primary guide for development.** It contains 68 tasks across 20 phases with detailed, copy-paste ready Copilot prompts.

#### How to Begin:

1. Open `Docs/BUILD_CHECKLIST.md`
2. Copy the Copilot Prompt from **P1-T01: Install Development Tools**
3. Paste it into a new Copilot conversation
4. Follow the 6-step Standard Operating Procedures
5. Complete all acceptance criteria with evidence
6. Check off the task: `[x] P1-T01`
7. Move to P1-T02 and repeat

#### Phase Overview (from Docs/BUILD_CHECKLIST.md):

**Phases 1-6: Foundation (Days 1-19)**

- Phase 1: Development Environment Setup (3 tasks)
- Phase 2: Project Initialization (3 tasks)
- Phase 3: AWS Infrastructure Integration (2 tasks)
- Phase 4: Authentication System (3 tasks)
- Phase 5: Data Layer & CSV Management (3 tasks)
- Phase 6: Theme System Implementation (2 tasks)

**Phases 7-10: Core Features (Days 20-36)**

- Phase 7: Core UI Components (3 tasks)
- Phase 8: Navigation & Screen Structure (3 tasks)
- Phase 9: Inspection Workflow - Part 1 (3 tasks)
- Phase 10: Photo Management & S3 (3 tasks)

**Phases 11-14: Advanced Features (Days 37-58)**

- Phase 11: Inspection Workflow - Part 2 (3 tasks)
- Phase 12: AI Integration (3 tasks)
- Phase 13: Report Generation (3 tasks)
- Phase 14: Team Collaboration (3 tasks)

**Phases 15-16: Business Tools (Days 59-67)**

- Phase 15: Business Tools Suite (3 tasks)
- Phase 16: Marketplace (3 tasks)

**Phases 17-20: Launch (Days 68-90+)**

- Phase 17: Testing & QA (3 tasks)
- Phase 18: Performance Optimization (3 tasks)
- Phase 19: App Store Preparation (3 tasks)
- Phase 20: Production Launch (3 tasks)

### Legacy Phase Information (For Reference Only)

The sections below provide high-level context. **Always use Docs/BUILD_CHECKLIST.md for actual implementation.**

### Phase 1: Project Initialization (Week 1)

```bash
# Initialize React Native project for both iOS & Android
npx react-native init SmartInspectorPro --template react-native-template-typescript

# Install core dependencies
npm install @reduxjs/toolkit react-redux @react-navigation/native
npm install react-native-elements react-native-paper
npm install react-native-sqlite-storage papaparse
npm install aws-amplify @aws-amplify/auth @aws-amplify/storage
npm install react-native-image-picker react-native-fs

# iOS specific setup
cd ios && pod install && cd ..

# Verify builds work
npx react-native run-ios
npx react-native run-android
```

### Phase 2: AWS Infrastructure Setup (Week 1-2)

1. **Configure all AWS services** (see `Docs/AWS_Services_Inventory.md` checklist)
2. **Set up Cognito User Pool** with custom attributes and groups
3. **Create S3 bucket** with folder structure
4. **Launch RDS PostgreSQL** instance and run migrations
5. **Configure ElastiCache Redis** cluster
6. **Set up CloudFront** distribution
7. **Deploy Lambda triggers** for Cognito

### Phase 3: Backend Development (Week 2-4)

```bash
# Initialize Node.js backend
mkdir backend && cd backend
npm init -y
npm install express pg redis aws-sdk jsonwebtoken jwks-rsa
npm install openai stripe socket.io
npm install -D nodemon typescript @types/node

# Set up backend structure (see File Structure Conventions)
# Implement all API endpoints from Phase 2.2 of Build Layout
```

### Phase 4: Data Layer (Week 3-4)

1. **Load CSV data**: Implement Papa Parse utility to load `single_family_sample.csv` first
2. **SQLite setup**: Create local database schema (offline-first)
3. **Sync engine**: Build background sync queue for cloud updates
4. **Test with 2,504 sample items** before loading full 33,432 items

### Phase 5: Core Features (Week 5-8)

1. **Authentication screens** (Login, Register, Password Reset)
2. **Home screen** with all navigation buttons
3. **Smart Inspector workflow** (6-step hierarchical selection)
4. **Photo capture** and S3 upload
5. **Workflow Editor** (drag-and-drop filtering)
6. **Inspection management** (create, continue, join team)

### Phase 6: AI Integration (Week 7-8)

1. **OpenAI API client** with existing API key
2. **GPT-4 Vision integration** for photo analysis
3. **Rate limiting** and cost tracking
4. **Caching layer** in Redis
5. **Fallback to manual workflow** if AI fails

### Phase 7: Advanced Features (Week 9-12)

1. **Report generation** (AI-powered descriptions, PDF export)
2. **Digital forms** and signature capture
3. **Team collaboration** (Socket.io real-time sync)
4. **Business tools** (scheduling, contacts, accounting)
5. **Data management** (cloud sync, storage analytics)

### Phase 8: Polish & Launch Prep (Week 13-14)

1. **Cross-platform testing** (iOS and Android)
2. **Performance optimization** (lazy loading, image compression)
3. **UI/UX refinement** (custom design implementation)
4. **App Store preparation** (screenshots, descriptions, compliance)
5. **Production deployment** (scale AWS infrastructure)

### Phase 9: Big-Bang Launch (Week 15)

1. **Submit to App Store** (iOS) and **Google Play** (Android) simultaneously
2. **Monitor infrastructure** (CloudWatch, error tracking)
3. **Customer support** setup
4. **Marketing campaign** execution

## AWS Cognito Authentication Flow

### User Authentication

```typescript
// Login flow with Cognito
import { Auth } from 'aws-amplify';

// Sign in
const user = await Auth.signIn(username, password);
const token = user.signInUserSession.idToken.jwtToken;

// Sign up with email verification
await Auth.signUp({
  username,
  password,
  attributes: {
    email,
    'custom:businessName': businessName,
    'custom:membershipTier': 'professional',
  },
});

// Refresh tokens automatically handled by Amplify
```

### Cognito Groups for RBAC

- `team-leader` - Full access to team management and inspections
- `senior-inspector` - Can create/edit inspections, limited team management
- `assistant-inspector` - Can view and contribute to assigned inspections
- `admin` - Platform administration access

### Integration Pattern

- Mobile app uses AWS Amplify SDK for Cognito integration
- Backend validates JWT tokens from Cognito User Pool
- Identity Pool provides temporary AWS credentials for direct S3 uploads
- Custom attributes store membership tier and business info

## Project Configuration Answers

### Confirmed Decisions

- **Target platforms**: ✅ **Both iOS and Android** (simultaneous launch)
- **OpenAI Integration**: ✅ **API key available** (ready for GPT-4 Vision + GPT-4 Turbo)
- **Design system**: ✅ **Custom design** (no existing brand guidelines to follow)
- **Launch Strategy**: ✅ **Big-bang launch** (full feature set from day one)

### Pending Setup

- **AWS Infrastructure**: Needs configuration (VPC, RDS, S3 buckets, IAM roles, Cognito User Pool)
- **Cognito User Pool**: Not yet created (see `AWS_Services_Inventory.md` for setup checklist)
- **Development Environment**: See "When Starting Implementation" section below

## Implementation Strategy (Big-Bang Launch)

Since this is a full feature launch, all major systems must be production-ready:

### Critical Path Items

1. **Complete React Native setup** for both iOS and Android
2. **Full AWS infrastructure** (all 8 services from AWS_Services_Inventory.md)
3. **OpenAI integration** with rate limiting and cost management
4. **All core screens** from Phase 9 of Build Layout (19+ screens)
5. **Complete testing** across both platforms before launch

### Development Priority Order

1. **Authentication** (Cognito + Amplify) - Foundation for everything
2. **Data Management** (CSV loading, SQLite, PostgreSQL sync)
3. **Core Workflow** (Smart Inspector 6-step hierarchy)
4. **Photo Management** (S3 upload, optimization, caching)
5. **AI Integration** (OpenAI GPT-4 Vision for premium users)
6. **Reports & Forms** (PDF generation, digital signatures)
7. **Business Features** (scheduling, contacts, accounting, team management)
8. **Polish & Testing** (UI/UX, performance, cross-platform testing)
