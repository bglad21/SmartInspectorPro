/**
 * Redux Auth Slice for Smart Inspector Pro
 * 
 * Manages global authentication state using Redux Toolkit.
 * Integrates with auth.service.ts for all authentication operations.
 * 
 * Features:
 * - Async thunks for all auth operations
 * - Automatic token refresh on app startup
 * - Token expiration checking
 * - Error handling with user-friendly messages
 * - Persistent state (integrated with AsyncStorage via auth service)
 * 
 * @module redux/slices/auth.slice
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import AuthService, {
  type AuthCredentials,
  type SignUpParams,
  type SignUpResult,
  type ConfirmSignUpParams,
  type ForgotPasswordParams,
  type ConfirmForgotPasswordParams,
  type ChangePasswordParams,
  type UserProfile,
  type AuthTokens,
  type AuthError,
} from '@/services/auth.service';

// ==================== TypeScript Interfaces ====================

/**
 * Authentication state shape
 */
export interface AuthState {
  // User data
  user: UserProfile | null;
  tokens: AuthTokens | null;
  
  // Authentication status
  isAuthenticated: boolean;
  isInitialized: boolean; // True after attempting to restore session
  
  // Loading states for different operations
  loading: {
    signIn: boolean;
    signUp: boolean;
    signOut: boolean;
    confirmSignUp: boolean;
    forgotPassword: boolean;
    confirmForgotPassword: boolean;
    changePassword: boolean;
    refreshTokens: boolean;
    initialize: boolean;
  };
  
  // Error state
  error: AuthError | null;
  
  // Last activity timestamp (for token expiration checking)
  lastActivity: number | null;
}

/**
 * Sign in payload
 */
export interface SignInPayload {
  user: UserProfile;
  tokens: AuthTokens;
}

/**
 * Token refresh payload
 */
export interface TokenRefreshPayload {
  tokens: AuthTokens;
}

// ==================== Initial State ====================

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: {
    signIn: false,
    signUp: false,
    signOut: false,
    confirmSignUp: false,
    forgotPassword: false,
    confirmForgotPassword: false,
    changePassword: false,
    refreshTokens: false,
    initialize: false,
  },
  error: null,
  lastActivity: null,
};

// ==================== Async Thunks ====================

/**
 * Initialize auth state on app startup
 * Attempts to restore session from AsyncStorage
 */
export const initializeAuth = createAsyncThunk<SignInPayload | null, void, { rejectValue: AuthError }>(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await AuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        return null;
      }

      // Restore user and tokens from storage
      const [user, tokens] = await Promise.all([
        AuthService.getCurrentUser(),
        AuthService.getTokens(),
      ]);

      // Start automatic token refresh timer
      AuthService.startTokenRefreshTimer();

      return { user, tokens };
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Sign in user with username and password
 */
export const signIn = createAsyncThunk<SignInPayload, AuthCredentials, { rejectValue: AuthError }>(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await AuthService.signIn(credentials);
      const tokens = await AuthService.getTokens();
      
      return { user, tokens };
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Sign up new user with email verification
 */
export const signUp = createAsyncThunk<SignUpResult, SignUpParams, { rejectValue: AuthError }>(
  'auth/signUp',
  async (params, { rejectWithValue }) => {
    try {
      const result = await AuthService.signUp(params);
      return result;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Confirm sign up with email verification code
 */
export const confirmSignUp = createAsyncThunk<boolean, ConfirmSignUpParams, { rejectValue: AuthError }>(
  'auth/confirmSignUp',
  async (params, { rejectWithValue }) => {
    try {
      const result = await AuthService.confirmSignUp(params);
      return result;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Resend confirmation code
 */
export const resendConfirmationCode = createAsyncThunk<boolean, string, { rejectValue: AuthError }>(
  'auth/resendConfirmationCode',
  async (username, { rejectWithValue }) => {
    try {
      const result = await AuthService.resendConfirmationCode(username);
      return result;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Sign out current user
 */
export const signOut = createAsyncThunk<void, void, { rejectValue: AuthError }>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.signOut();
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Request password reset (forgot password)
 */
export const forgotPassword = createAsyncThunk<boolean, ForgotPasswordParams, { rejectValue: AuthError }>(
  'auth/forgotPassword',
  async (params, { rejectWithValue }) => {
    try {
      await AuthService.forgotPassword(params);
      return true;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Confirm password reset with code
 */
export const confirmForgotPassword = createAsyncThunk<boolean, ConfirmForgotPasswordParams, { rejectValue: AuthError }>(
  'auth/confirmForgotPassword',
  async (params, { rejectWithValue }) => {
    try {
      const result = await AuthService.confirmForgotPassword(params);
      return result;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Change password for authenticated user
 */
export const changePassword = createAsyncThunk<boolean, ChangePasswordParams, { rejectValue: AuthError }>(
  'auth/changePassword',
  async (params, { rejectWithValue }) => {
    try {
      const result = await AuthService.changePassword(params);
      return result;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Refresh JWT tokens
 */
export const refreshTokens = createAsyncThunk<TokenRefreshPayload, void, { rejectValue: AuthError }>(
  'auth/refreshTokens',
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await AuthService.refreshTokens();
      return { tokens };
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

/**
 * Check token expiration and refresh if needed
 */
export const checkTokenExpiration = createAsyncThunk<TokenRefreshPayload | null, void, { rejectValue: AuthError }>(
  'auth/checkTokenExpiration',
  async (_, { rejectWithValue }) => {
    try {
      const validation = await AuthService.validateToken();
      
      if (validation.needsRefresh) {
        const tokens = await AuthService.refreshTokens();
        return { tokens };
      }
      
      return null;
    } catch (error) {
      return rejectWithValue(AuthService.handleAuthError(error));
    }
  }
);

// ==================== Auth Slice ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Update last activity timestamp
     * Used for tracking user activity and token expiration
     */
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    /**
     * Manually set user (for edge cases)
     */
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
    
    /**
     * Manually clear auth state (force logout)
     */
    clearAuthState: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastActivity = null;
      AuthService.stopTokenRefreshTimer();
    },
  },
  extraReducers: (builder) => {
    // ==================== Initialize Auth ====================
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading.initialize = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading.initialize = false;
        state.isInitialized = true;
        
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.isAuthenticated = true;
          state.lastActivity = Date.now();
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading.initialize = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.error = action.payload || null;
      });

    // ==================== Sign In ====================
    builder
      .addCase(signIn.pending, (state) => {
        state.loading.signIn = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading.signIn = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading.signIn = false;
        state.error = action.payload || null;
        state.isAuthenticated = false;
      });

    // ==================== Sign Up ====================
    builder
      .addCase(signUp.pending, (state) => {
        state.loading.signUp = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.loading.signUp = false;
        // Don't set authenticated - user needs to confirm email first
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading.signUp = false;
        state.error = action.payload || null;
      });

    // ==================== Confirm Sign Up ====================
    builder
      .addCase(confirmSignUp.pending, (state) => {
        state.loading.confirmSignUp = true;
        state.error = null;
      })
      .addCase(confirmSignUp.fulfilled, (state) => {
        state.loading.confirmSignUp = false;
        // User can now sign in
      })
      .addCase(confirmSignUp.rejected, (state, action) => {
        state.loading.confirmSignUp = false;
        state.error = action.payload || null;
      });

    // ==================== Resend Confirmation Code ====================
    builder
      .addCase(resendConfirmationCode.pending, (state) => {
        state.error = null;
      })
      .addCase(resendConfirmationCode.fulfilled, () => {
        // Code resent successfully
      })
      .addCase(resendConfirmationCode.rejected, (state, action) => {
        state.error = action.payload || null;
      });

    // ==================== Sign Out ====================
    builder
      .addCase(signOut.pending, (state) => {
        state.loading.signOut = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading.signOut = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.lastActivity = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading.signOut = false;
        state.error = action.payload || null;
        // Still clear auth state even if sign out failed
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });

    // ==================== Forgot Password ====================
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading.forgotPassword = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading.forgotPassword = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading.forgotPassword = false;
        state.error = action.payload || null;
      });

    // ==================== Confirm Forgot Password ====================
    builder
      .addCase(confirmForgotPassword.pending, (state) => {
        state.loading.confirmForgotPassword = true;
        state.error = null;
      })
      .addCase(confirmForgotPassword.fulfilled, (state) => {
        state.loading.confirmForgotPassword = false;
      })
      .addCase(confirmForgotPassword.rejected, (state, action) => {
        state.loading.confirmForgotPassword = false;
        state.error = action.payload || null;
      });

    // ==================== Change Password ====================
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading.changePassword = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading.changePassword = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading.changePassword = false;
        state.error = action.payload || null;
      });

    // ==================== Refresh Tokens ====================
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.loading.refreshTokens = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.loading.refreshTokens = false;
        state.tokens = action.payload.tokens;
        state.lastActivity = Date.now();
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.loading.refreshTokens = false;
        state.error = action.payload || null;
        // If token refresh fails, user needs to re-authenticate
        state.isAuthenticated = false;
      });

    // ==================== Check Token Expiration ====================
    builder
      .addCase(checkTokenExpiration.pending, () => {
        // Silent check, don't show loading
      })
      .addCase(checkTokenExpiration.fulfilled, (state, action) => {
        if (action.payload) {
          state.tokens = action.payload.tokens;
          state.lastActivity = Date.now();
        }
      })
      .addCase(checkTokenExpiration.rejected, (state, action) => {
        state.error = action.payload || null;
        // If token check fails, user needs to re-authenticate
        state.isAuthenticated = false;
      });
  },
});

// ==================== Actions ====================

export const {
  clearError,
  updateLastActivity,
  setUser,
  clearAuthState,
} = authSlice.actions;

// ==================== Selectors ====================

/**
 * Select entire auth state
 */
export const selectAuth = (state: { auth: AuthState }) => state.auth;

/**
 * Select current user
 */
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

/**
 * Select authentication status
 */
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

/**
 * Select initialization status
 */
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

/**
 * Select loading state for specific operation
 */
export const selectAuthLoading = (operation: keyof AuthState['loading']) => (state: { auth: AuthState }) =>
  state.auth.loading[operation];

/**
 * Select any loading state (true if any operation is loading)
 */
export const selectIsAnyLoading = (state: { auth: AuthState }) =>
  Object.values(state.auth.loading).some((loading) => loading);

/**
 * Select error state
 */
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

/**
 * Select JWT tokens
 */
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens;

/**
 * Select access token
 */
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.tokens?.accessToken || null;

/**
 * Select user email
 */
export const selectUserEmail = (state: { auth: AuthState }) => state.auth.user?.email || null;

/**
 * Select user business name
 */
export const selectUserBusinessName = (state: { auth: AuthState }) => state.auth.user?.businessName || null;

/**
 * Select user membership tier
 */
export const selectUserMembershipTier = (state: { auth: AuthState }) => state.auth.user?.membershipTier || null;

/**
 * Select user groups (roles)
 */
export const selectUserGroups = (state: { auth: AuthState }) => state.auth.user?.groups || [];

/**
 * Select if user has specific role
 */
export const selectHasRole = (role: string) => (state: { auth: AuthState }) =>
  state.auth.user?.groups.some((group) => group === role) || false;

/**
 * Select last activity timestamp
 */
export const selectLastActivity = (state: { auth: AuthState }) => state.auth.lastActivity;

// ==================== Export ====================

export default authSlice.reducer;
