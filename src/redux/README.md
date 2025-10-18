# Redux State Management

Global state management using Redux Toolkit with TypeScript.

## Structure

### `slices/` - Redux Slices

Each slice manages a specific domain of state.

**Core Slices:**

- `authSlice.ts` - User authentication (token, user info, login state)
- `inspectionsSlice.ts` - Inspection data (active, completed, sync queue)
- `workflowsSlice.ts` - Custom workflows and filters
- `userSlice.ts` - User profile and preferences
- `offlineSlice.ts` - Offline sync queue and status
- `aiSlice.ts` - AI analysis results and quota tracking

### Root Files

- `store.ts` - Redux store configuration with RTK Query
- `hooks.ts` - Typed `useAppDispatch` and `useAppSelector`

## Redux Slice Pattern

```typescript
// inspectionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Inspection } from '@/types';

interface InspectionsState {
  items: Inspection[];
  activeInspectionId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: InspectionsState = {
  items: [],
  activeInspectionId: null,
  loading: false,
  error: null,
};

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    setActiveInspection: (state, action: PayloadAction<string>) => {
      state.activeInspectionId = action.payload;
    },
    addInspection: (state, action: PayloadAction<Inspection>) => {
      state.items.push(action.payload);
    },
    // More reducers...
  },
});

export const { setActiveInspection, addInspection } = inspectionsSlice.actions;
export default inspectionsSlice.reducer;
```

## Store Configuration

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inspectionsReducer from './slices/inspectionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inspections: inspectionsReducer,
    // More reducers...
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific actions if needed
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Typed Hooks

```typescript
// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Usage in Components

```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveInspection } from '@/redux/slices/inspectionsSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const inspections = useAppSelector(state => state.inspections.items);

  const handleSelectInspection = (id: string) => {
    dispatch(setActiveInspection(id));
  };

  // Component logic...
};
```

## RTK Query (API Calls)

For API endpoints, use RTK Query:

```typescript
// services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    getInspections: builder.query<Inspection[], void>({
      query: () => 'inspections',
    }),
    createInspection: builder.mutation<Inspection, CreateInspectionDto>({
      query: body => ({
        url: 'inspections',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetInspectionsQuery, useCreateInspectionMutation } = api;
```

## Best Practices

1. **Normalize State** - Use entities and IDs for relational data
2. **Immer Integration** - Redux Toolkit uses Immer (mutate state safely)
3. **Async Thunks** - Use `createAsyncThunk` for async operations
4. **Selectors** - Create reusable selectors with `createSelector` (Reselect)
5. **Type Safety** - Always type state, actions, and selectors
6. **Persistence** - Use `redux-persist` for offline-first data
