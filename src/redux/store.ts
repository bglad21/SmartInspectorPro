/**
 * Redux Store Configuration for Smart Inspector Pro
 * 
 * Configures the Redux store with:
 * - Auth slice
 * - Redux DevTools (development only)
 * - Middleware configuration
 * 
 * @module redux/store
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';

/**
 * Configure Redux store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add more slices here as needed:
    // inspections: inspectionsReducer,
    // workflows: workflowsReducer,
    // reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['auth/initializeAuth/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.tokens.expiresAt'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.tokens.expiresAt', 'auth.lastActivity'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ==================== TypeScript Types ====================

/**
 * Root state type
 * Infer the `RootState` type from the store itself
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type
 * Infer the `AppDispatch` type from the store itself
 */
export type AppDispatch = typeof store.dispatch;

// ==================== Export ====================

export default store;
