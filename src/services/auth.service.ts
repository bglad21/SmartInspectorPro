/**
 * Enhanced Authentication Service for Smart Inspector Pro
 *
 * Provides comprehensive authentication functionality using AWS Cognito:
 * - User registration and email verification
 * - Sign in/out with JWT token management
 * - Password reset and change
 * - Automatic token refresh
 * - Token validation and storage
 * - User profile management
 * - Role-based access control (RBAC)
 *
 * Built on AWS Amplify v6 Auth API
 */

import type { CognitoGroup } from '@/config/aws-config';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmResetPassword,
  confirmSignUp,
  type ConfirmSignUpInput,
  fetchAuthSession,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  type ResetPasswordOutput,
  type SignInInput,
  type SignInOutput,
  type SignUpInput,
  type SignUpOutput,
  updatePassword,
} from '@aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== TypeScript Interfaces ====================

/**
 * User authentication credentials
 */
export interface AuthCredentials {
  username: string;
  password: string;
}

/**
 * User registration parameters
 */
export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  businessName?: string;
  membershipTier?: 'professional' | 'enterprise';
}

/**
 * Sign up result with confirmation status
 */
export interface SignUpResult {
  userId: string;
  username: string;
  isConfirmed: boolean;
  needsEmailVerification: boolean;
}

/**
 * Email verification parameters
 */
export interface ConfirmSignUpParams {
  username: string;
  confirmationCode: string;
}

/**
 * Password reset request parameters
 */
export interface ForgotPasswordParams {
  username: string;
}

/**
 * Password reset confirmation parameters
 */
export interface ConfirmForgotPasswordParams {
  username: string;
  confirmationCode: string;
  newPassword: string;
}

/**
 * Change password parameters (for authenticated users)
 */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/**
 * User profile with Cognito attributes
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  emailVerified: boolean;
  businessName?: string;
  membershipTier?: 'professional' | 'enterprise';
  groups: CognitoGroup[];
  createdAt?: string;
  updatedAt?: string;
  attributes: Record<string, string>;
}

/**
 * JWT tokens from Cognito
 */
export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Token validation result
 */
export interface TokenValidation {
  isValid: boolean;
  isExpired: boolean;
  expiresIn: number; // seconds until expiration
  needsRefresh: boolean; // true if token expires in < 5 minutes
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  tokens: AuthTokens | null;
  error: AuthError | null;
}

/**
 * Enhanced authentication error
 */
export interface AuthError {
  code: string;
  message: string;
  name: string;
  originalError?: unknown;
}

// ==================== Constants ====================

const TOKEN_STORAGE_KEY = '@smart_inspector_tokens';
const USER_STORAGE_KEY = '@smart_inspector_user';
const TOKEN_CHECK_INTERVAL = 60 * 1000; // Check token every 60 seconds

// Private token refresh timer
let tokenRefreshTimer: number | null = null;

// ==================== Enhanced Authentication Service ====================

export const AuthService = {
  // ==================== Sign Up / Registration ====================

  /**
   * Register new user with email verification
   *
   * @param params Registration parameters
   * @returns Sign up result with confirmation status
   *
   * @example
   * ```typescript
   * const result = await AuthService.signUp({
   *   username: 'john.doe',
   *   password: 'SecurePass123!',
   *   email: 'john@example.com',
   *   businessName: 'ABC Inspections',
   *   membershipTier: 'professional'
   * });
   *
   * if (result.needsEmailVerification) {
   *   // Prompt user to enter verification code from email
   * }
   * ```
   */
  async signUp(params: SignUpParams): Promise<SignUpResult> {
    try {
      const { username, password, email, businessName, membershipTier } =
        params;

      // Validate input
      if (!username || !password || !email) {
        throw new Error('Username, password, and email are required');
      }

      const signUpInput: SignUpInput = {
        username,
        password,
        options: {
          userAttributes: {
            email,
            'custom:businessName': businessName || '',
            'custom:membershipTier': membershipTier || 'professional',
          },
          autoSignIn: false, // Require email verification first
        },
      };

      const result: SignUpOutput = await amplifySignUp(signUpInput);

      console.log('✅ User signed up successfully:', username);

      return {
        userId: result.userId || '',
        username,
        isConfirmed: result.isSignUpComplete,
        needsEmailVerification: !result.isSignUpComplete,
      };
    } catch (error: unknown) {
      console.error('❌ Sign up error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Confirm sign up with email verification code
   *
   * @param params Confirmation parameters
   * @returns True if confirmation successful
   *
   * @example
   * ```typescript
   * await AuthService.confirmSignUp({
   *   username: 'john.doe',
   *   confirmationCode: '123456'
   * });
   * // User can now sign in
   * ```
   */
  async confirmSignUp(params: ConfirmSignUpParams): Promise<boolean> {
    try {
      const { username, confirmationCode } = params;

      const confirmInput: ConfirmSignUpInput = {
        username,
        confirmationCode,
      };

      await confirmSignUp(confirmInput);

      console.log('✅ Email verified successfully:', username);
      return true;
    } catch (error: unknown) {
      console.error('❌ Confirm sign up error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Resend confirmation code to user's email
   *
   * @param username Username to resend code for
   * @returns True if code resent successfully
   */
  async resendConfirmationCode(username: string): Promise<boolean> {
    try {
      await resendSignUpCode({ username });
      console.log('✅ Confirmation code resent:', username);
      return true;
    } catch (error: unknown) {
      console.error('❌ Resend confirmation code error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  // ==================== Sign In / Sign Out ====================

  /**
   * Sign in user with username and password
   *
   * @param credentials User credentials
   * @returns User profile with tokens stored
   *
   * @example
   * ```typescript
   * const user = await AuthService.signIn({
   *   username: 'john.doe',
   *   password: 'SecurePass123!'
   * });
   *
   * console.log('Welcome:', user.username);
   * console.log('Groups:', user.groups); // ['team-leader', 'senior-inspector']
   * ```
   */
  async signIn(credentials: AuthCredentials): Promise<UserProfile> {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const signInInput: SignInInput = {
        username,
        password,
      };

      const result: SignInOutput = await amplifySignIn(signInInput);

      if (!result.isSignedIn) {
        throw new Error('Sign in failed - user not authenticated');
      }

      // Fetch user profile and tokens
      const user = await AuthService.getCurrentUser();
      const tokens = await AuthService.getTokens();

      // Store tokens for offline access
      await AuthService.storeTokens(tokens);
      await AuthService.storeUser(user);

      console.log('✅ User signed in successfully:', username);

      // Start automatic token refresh
      AuthService.startTokenRefreshTimer();

      return user;
    } catch (error: unknown) {
      console.error('❌ Sign in error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Sign out current user and clear stored tokens
   *
   * @returns True if sign out successful
   */
  async signOut(): Promise<boolean> {
    try {
      await amplifySignOut();

      // Clear stored tokens and user data
      await AuthService.clearTokens();
      await AuthService.clearUser();

      // Stop token refresh timer
      AuthService.stopTokenRefreshTimer();

      console.log('✅ User signed out successfully');
      return true;
    } catch (error: unknown) {
      console.error('❌ Sign out error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  // ==================== Password Management ====================

  /**
   * Request password reset (sends code to user's email)
   *
   * @param params Password reset parameters
   * @returns Reset output with code delivery details
   *
   * @example
   * ```typescript
   * await AuthService.forgotPassword({ username: 'john.doe' });
   * // User receives email with 6-digit code
   * ```
   */
  async forgotPassword(
    params: ForgotPasswordParams,
  ): Promise<ResetPasswordOutput> {
    try {
      const { username } = params;

      const result: ResetPasswordOutput = await resetPassword({ username });

      console.log('✅ Password reset code sent:', username);
      return result;
    } catch (error: unknown) {
      console.error('❌ Forgot password error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Confirm password reset with verification code
   *
   * @param params Password reset confirmation parameters
   * @returns True if password reset successful
   *
   * @example
   * ```typescript
   * await AuthService.confirmForgotPassword({
   *   username: 'john.doe',
   *   confirmationCode: '123456',
   *   newPassword: 'NewSecurePass123!'
   * });
   * // User can now sign in with new password
   * ```
   */
  async confirmForgotPassword(
    params: ConfirmForgotPasswordParams,
  ): Promise<boolean> {
    try {
      const { username, confirmationCode, newPassword } = params;

      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });

      console.log('✅ Password reset successfully:', username);
      return true;
    } catch (error: unknown) {
      console.error('❌ Confirm forgot password error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Change password for authenticated user
   *
   * @param params Password change parameters
   * @returns True if password changed successfully
   *
   * @example
   * ```typescript
   * await AuthService.changePassword({
   *   oldPassword: 'OldPass123!',
   *   newPassword: 'NewSecurePass123!'
   * });
   * ```
   */
  async changePassword(params: ChangePasswordParams): Promise<boolean> {
    try {
      const { oldPassword, newPassword } = params;

      await updatePassword({ oldPassword, newPassword });

      console.log('✅ Password changed successfully');
      return true;
    } catch (error: unknown) {
      console.error('❌ Change password error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  // ==================== User Profile ====================

  /**
   * Get current authenticated user profile
   *
   * @returns User profile with Cognito attributes and groups
   *
   * @example
   * ```typescript
   * const user = await AuthService.getCurrentUser();
   * console.log(user.email); // 'john@example.com'
   * console.log(user.groups); // ['team-leader']
   * console.log(user.membershipTier); // 'professional'
   * ```
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      // Extract groups from JWT access token
      const accessToken = session.tokens?.accessToken;
      const groups = (accessToken?.payload['cognito:groups'] as string[]) || [];

      // Extract custom attributes from ID token
      const idToken = session.tokens?.idToken;
      const customAttributes = idToken?.payload || {};

      const profile: UserProfile = {
        userId: cognitoUser.userId,
        username: cognitoUser.username,
        email: (customAttributes.email as string) || '',
        emailVerified: (customAttributes.email_verified as boolean) || false,
        businessName: customAttributes['custom:businessName'] as string,
        membershipTier: customAttributes['custom:membershipTier'] as
          | 'professional'
          | 'enterprise',
        groups: groups as CognitoGroup[],
        createdAt: customAttributes['custom:createdAt'] as string,
        updatedAt: customAttributes.updated_at as string,
        attributes: customAttributes as Record<string, string>,
      };

      return profile;
    } catch (error: unknown) {
      console.error('❌ Get current user error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Check if user is authenticated
   *
   * @returns True if user has valid session
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if user has specific role/group
   *
   * @param role Cognito group to check
   * @returns True if user has the role
   */
  async hasRole(role: CognitoGroup): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      return user.groups.includes(role);
    } catch {
      return false;
    }
  },

  // ==================== Token Management ====================

  /**
   * Get current JWT tokens from Cognito session
   *
   * @returns JWT tokens with expiration
   */
  async getTokens(): Promise<AuthTokens> {
    try {
      const session = await fetchAuthSession();

      if (!session.tokens) {
        throw new Error('No tokens available');
      }

      const accessToken = session.tokens.accessToken?.toString() || '';
      const idToken = session.tokens.idToken?.toString() || '';

      // Note: Amplify v6 doesn't expose refresh token directly
      // It's managed internally by Amplify
      const refreshToken = '';

      // Calculate expiration from access token
      const expiresAt = session.tokens.accessToken?.payload.exp
        ? session.tokens.accessToken.payload.exp * 1000
        : Date.now() + 3600000; // Default 1 hour

      return {
        accessToken,
        idToken,
        refreshToken,
        expiresAt,
      };
    } catch (error: unknown) {
      console.error('❌ Get tokens error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Get access token for API requests
   *
   * @returns JWT access token string
   */
  async getAccessToken(): Promise<string> {
    try {
      const tokens = await AuthService.getTokens();
      return tokens.accessToken;
    } catch (error: unknown) {
      console.error('❌ Get access token error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  /**
   * Validate current token
   *
   * @returns Token validation result with expiration info
   */
  async validateToken(): Promise<TokenValidation> {
    try {
      const tokens = await AuthService.getTokens();
      const now = Date.now();
      const expiresIn = Math.floor((tokens.expiresAt - now) / 1000);

      return {
        isValid: expiresIn > 0,
        isExpired: expiresIn <= 0,
        expiresIn,
        needsRefresh: expiresIn < 300, // Less than 5 minutes
      };
    } catch {
      return {
        isValid: false,
        isExpired: true,
        expiresIn: 0,
        needsRefresh: false,
      };
    }
  },

  /**
   * Refresh tokens if expired or expiring soon
   *
   * @returns New tokens
   */
  async refreshTokens(): Promise<AuthTokens> {
    try {
      // Amplify v6 automatically refreshes tokens when fetchAuthSession is called
      // Force a session refresh
      const session = await fetchAuthSession({ forceRefresh: true });

      if (!session.tokens) {
        throw new Error('Token refresh failed');
      }

      const tokens = await AuthService.getTokens();
      await AuthService.storeTokens(tokens);

      console.log('✅ Tokens refreshed successfully');
      return tokens;
    } catch (error: unknown) {
      console.error('❌ Refresh tokens error:', error);
      throw AuthService.handleAuthError(error);
    }
  },

  // ==================== Token Storage (AsyncStorage) ====================

  /**
   * Store tokens in AsyncStorage for offline access
   */
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('❌ Store tokens error:', error);
    }
  },

  /**
   * Retrieve tokens from AsyncStorage
   */
  async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error('❌ Get stored tokens error:', error);
      return null;
    }
  },

  /**
   * Clear tokens from AsyncStorage
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('❌ Clear tokens error:', error);
    }
  },

  /**
   * Store user profile in AsyncStorage
   */
  async storeUser(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('❌ Store user error:', error);
    }
  },

  /**
   * Retrieve user profile from AsyncStorage
   */
  async getStoredUser(): Promise<UserProfile | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('❌ Get stored user error:', error);
      return null;
    }
  },

  /**
   * Clear user profile from AsyncStorage
   */
  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('❌ Clear user error:', error);
    }
  },

  // ==================== Automatic Token Refresh ====================

  /**
   * Start automatic token refresh timer
   * Checks token every 60 seconds and refreshes if needed
   */
  startTokenRefreshTimer(): void {
    // Clear existing timer if any
    AuthService.stopTokenRefreshTimer();

    tokenRefreshTimer = setInterval(async () => {
      try {
        const validation = await AuthService.validateToken();

        if (validation.needsRefresh) {
          console.log('🔄 Token expiring soon, refreshing...');
          await AuthService.refreshTokens();
        }
      } catch (error) {
        console.error('❌ Token refresh timer error:', error);
      }
    }, TOKEN_CHECK_INTERVAL) as unknown as number;

    console.log('✅ Token refresh timer started');
  },

  /**
   * Stop automatic token refresh timer
   */
  stopTokenRefreshTimer(): void {
    if (tokenRefreshTimer) {
      clearInterval(tokenRefreshTimer);
      tokenRefreshTimer = null;
      console.log('✅ Token refresh timer stopped');
    }
  },

  // ==================== Error Handling ====================

  /**
   * Handle and format Cognito authentication errors
   *
   * @param error Original error from Cognito
   * @returns Formatted authentication error
   */
  handleAuthError(error: unknown): AuthError {
    const err = error as { code?: string; name?: string; message?: string };
    const errorCode = err.code || err.name || 'UnknownError';
    const errorMessage = err.message || 'An unknown error occurred';

    // Map common Cognito errors to user-friendly messages
    const errorMap: Record<string, string> = {
      UserNotFoundException: 'User not found. Please check your username.',
      NotAuthorizedException: 'Incorrect username or password.',
      UsernameExistsException:
        'Username already exists. Please choose a different username.',
      InvalidPasswordException:
        'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, and numbers.',
      CodeMismatchException: 'Invalid verification code. Please try again.',
      ExpiredCodeException:
        'Verification code has expired. Please request a new code.',
      LimitExceededException: 'Too many attempts. Please try again later.',
      InvalidParameterException: 'Invalid parameters provided.',
      UserNotConfirmedException:
        'User email not verified. Please check your email for verification code.',
      PasswordResetRequiredException:
        'Password reset required. Please reset your password.',
      TooManyRequestsException:
        'Too many requests. Please wait a moment and try again.',
      TooManyFailedAttemptsException:
        'Too many failed attempts. Please try again later.',
    };

    const formattedMessage = errorMap[errorCode] || errorMessage;

    return {
      code: errorCode,
      message: formattedMessage,
      name: errorCode,
      originalError: error,
    };
  },
};

// Export as default
export default AuthService;
