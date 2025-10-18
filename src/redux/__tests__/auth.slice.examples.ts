/**
 * Redux Auth Slice - Usage Examples & Test Scenarios
 * 
 * This file demonstrates how to use the Redux auth slice in components:
 * 1. Initialize auth on app startup
 * 2. Sign in with username/password
 * 3. Sign up new user
 * 4. Confirm email verification
 * 5. Forgot password flow
 * 6. Change password
 * 7. Sign out
 * 8. Access auth state with selectors
 * 9. Token expiration checking
 * 10. Error handling
 * 
 * @module redux/__tests__/auth.slice.examples
 */

import { store } from '../store';
import {
  initializeAuth,
  signIn,
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signOut,
  forgotPassword,
  confirmForgotPassword,
  changePassword,
  refreshTokens,
  checkTokenExpiration,
  clearError,
  updateLastActivity,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserEmail,
  selectUserBusinessName,
  selectUserMembershipTier,
  selectUserGroups,
  selectHasRole,
} from '../slices/auth.slice';

// ==================== Example 1: Initialize Auth on App Startup ====================

/**
 * Example 1: Initialize authentication state when app starts
 * 
 * This should be called in App.tsx componentDidMount or useEffect
 * Restores user session from AsyncStorage if available
 */
export async function exampleInitializeAuth() {
  console.log('=== Example 1: Initialize Auth on App Startup ===\n');

  try {
    // Dispatch initialize action
    const result = await store.dispatch(initializeAuth()).unwrap();

    if (result) {
      console.log('✅ Session restored from storage');
      console.log('User:', result.user.username);
      console.log('Email:', result.user.email);
      console.log('Membership:', result.user.membershipTier);
    } else {
      console.log('ℹ️ No existing session found');
    }

    // Check state after initialization
    const state = store.getState();
    console.log('Is Initialized:', state.auth.isInitialized);
    console.log('Is Authenticated:', state.auth.isAuthenticated);
  } catch (error) {
    console.error('❌ Initialize error:', error);
  }
}

// ==================== Example 2: Sign In ====================

/**
 * Example 2: Sign in user and update Redux state
 * 
 * Usage in LoginScreen component:
 * ```typescript
 * const dispatch = useAppDispatch();
 * const loading = useAppSelector(selectAuthLoading('signIn'));
 * const error = useAppSelector(selectAuthError);
 * 
 * const handleSignIn = async () => {
 *   try {
 *     await dispatch(signIn({ username, password })).unwrap();
 *     navigation.navigate('Home');
 *   } catch (error) {
 *     // Error is already in Redux state
 *     console.error(error);
 *   }
 * };
 * ```
 */
export async function exampleSignIn() {
  console.log('=== Example 2: Sign In ===\n');

  try {
    // Dispatch sign in action
    const result = await store.dispatch(
      signIn({
        username: 'john.inspector',
        password: 'SecurePass123!',
      })
    ).unwrap();

    console.log('✅ Signed in successfully!');
    console.log('User:', result.user.username);
    console.log('Email:', result.user.email);
    console.log('Business:', result.user.businessName);
    console.log('Groups:', result.user.groups);

    // Access state with selectors
    const state = store.getState();
    const user = selectUser(state);
    const isAuthenticated = selectIsAuthenticated(state);

    console.log('\nRedux State:');
    console.log('User:', user?.username);
    console.log('Authenticated:', isAuthenticated);
  } catch (error) {
    console.error('❌ Sign in failed:', error);
    
    // Error is available in Redux state
    const state = store.getState();
    const authError = selectAuthError(state);
    console.log('Error from state:', authError);
  }
}

// ==================== Example 3: Sign Up ====================

/**
 * Example 3: Sign up new user
 * 
 * Usage in RegistrationScreen:
 * ```typescript
 * const dispatch = useAppDispatch();
 * const loading = useAppSelector(selectAuthLoading('signUp'));
 * 
 * const handleSignUp = async () => {
 *   try {
 *     const result = await dispatch(signUp({
 *       username,
 *       password,
 *       email,
 *       businessName,
 *       membershipTier: 'professional'
 *     })).unwrap();
 *     
 *     if (result.needsEmailVerification) {
 *       navigation.navigate('ConfirmEmail', { username });
 *     }
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export async function exampleSignUp() {
  console.log('=== Example 3: Sign Up ===\n');

  try {
    const result = await store.dispatch(
      signUp({
        username: 'sarah.inspector',
        password: 'SecurePass456!',
        email: 'sarah@example.com',
        businessName: 'ABC Inspections LLC',
        membershipTier: 'professional',
      })
    ).unwrap();

    console.log('✅ Sign up successful!');
    console.log('User ID:', result.userId);
    console.log('Needs verification:', result.needsEmailVerification);

    if (result.needsEmailVerification) {
      console.log('📧 Check email for verification code');
    }
  } catch (error) {
    console.error('❌ Sign up failed:', error);
  }
}

// ==================== Example 4: Confirm Email Verification ====================

/**
 * Example 4: Confirm email with verification code
 * 
 * Usage in EmailVerificationScreen:
 * ```typescript
 * const dispatch = useAppDispatch();
 * const loading = useAppSelector(selectAuthLoading('confirmSignUp'));
 * 
 * const handleConfirm = async () => {
 *   try {
 *     await dispatch(confirmSignUp({
 *       username,
 *       confirmationCode
 *     })).unwrap();
 *     
 *     navigation.navigate('Login');
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export async function exampleConfirmSignUp() {
  console.log('=== Example 4: Confirm Email Verification ===\n');

  try {
    await store.dispatch(
      confirmSignUp({
        username: 'sarah.inspector',
        confirmationCode: '123456',
      })
    ).unwrap();

    console.log('✅ Email verified successfully!');
    console.log('👉 User can now sign in');
  } catch (error) {
    console.error('❌ Confirmation failed:', error);
  }
}

// ==================== Example 5: Resend Verification Code ====================

/**
 * Example 5: Resend verification code if user didn't receive it
 */
export async function exampleResendCode() {
  console.log('=== Example 5: Resend Verification Code ===\n');

  try {
    await store.dispatch(resendConfirmationCode('sarah.inspector')).unwrap();
    console.log('✅ Verification code resent!');
  } catch (error) {
    console.error('❌ Resend failed:', error);
  }
}

// ==================== Example 6: Forgot Password ====================

/**
 * Example 6: Forgot password flow (2 steps)
 * 
 * Usage in ForgotPasswordScreen:
 * ```typescript
 * // Step 1: Request code
 * const handleRequestCode = async () => {
 *   try {
 *     await dispatch(forgotPassword({ username })).unwrap();
 *     setStep('confirm'); // Show code input
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * 
 * // Step 2: Confirm with code
 * const handleConfirmReset = async () => {
 *   try {
 *     await dispatch(confirmForgotPassword({
 *       username,
 *       confirmationCode,
 *       newPassword
 *     })).unwrap();
 *     
 *     navigation.navigate('Login');
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export async function exampleForgotPassword() {
  console.log('=== Example 6: Forgot Password Flow ===\n');

  try {
    // Step 1: Request password reset
    console.log('Step 1: Requesting reset code...');
    await store.dispatch(
      forgotPassword({ username: 'john.inspector' })
    ).unwrap();
    console.log('✅ Reset code sent to email');

    // Step 2: Confirm with code
    console.log('\nStep 2: Confirming with code...');
    await store.dispatch(
      confirmForgotPassword({
        username: 'john.inspector',
        confirmationCode: '654321',
        newPassword: 'NewSecurePass789!',
      })
    ).unwrap();
    console.log('✅ Password reset successfully!');
    console.log('👉 User can now sign in with new password');
  } catch (error) {
    console.error('❌ Password reset failed:', error);
  }
}

// ==================== Example 7: Change Password (Authenticated) ====================

/**
 * Example 7: Change password for authenticated user
 * 
 * Usage in SettingsScreen:
 * ```typescript
 * const dispatch = useAppDispatch();
 * const loading = useAppSelector(selectAuthLoading('changePassword'));
 * 
 * const handleChangePassword = async () => {
 *   try {
 *     await dispatch(changePassword({
 *       oldPassword,
 *       newPassword
 *     })).unwrap();
 *     
 *     Alert.alert('Success', 'Password changed!');
 *   } catch (error) {
 *     Alert.alert('Error', error.message);
 *   }
 * };
 * ```
 */
export async function exampleChangePassword() {
  console.log('=== Example 7: Change Password ===\n');

  try {
    await store.dispatch(
      changePassword({
        oldPassword: 'SecurePass123!',
        newPassword: 'NewSecurePass999!',
      })
    ).unwrap();

    console.log('✅ Password changed successfully!');
  } catch (error) {
    console.error('❌ Change password failed:', error);
  }
}

// ==================== Example 8: Sign Out ====================

/**
 * Example 8: Sign out user
 * 
 * Usage in any screen with sign out button:
 * ```typescript
 * const dispatch = useAppDispatch();
 * 
 * const handleSignOut = async () => {
 *   try {
 *     await dispatch(signOut()).unwrap();
 *     navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export async function exampleSignOut() {
  console.log('=== Example 8: Sign Out ===\n');

  try {
    await store.dispatch(signOut()).unwrap();

    console.log('✅ Signed out successfully!');

    // Verify state cleared
    const state = store.getState();
    console.log('Is Authenticated:', state.auth.isAuthenticated);
    console.log('User:', state.auth.user); // Should be null
  } catch (error) {
    console.error('❌ Sign out failed:', error);
  }
}

// ==================== Example 9: Using Selectors in Components ====================

/**
 * Example 9: Access auth state with selectors
 * 
 * Usage in React components:
 * ```typescript
 * import { useAppSelector } from '@/redux/hooks';
 * import {
 *   selectUser,
 *   selectIsAuthenticated,
 *   selectAuthLoading,
 *   selectUserEmail,
 *   selectUserGroups,
 *   selectHasRole
 * } from '@/redux/slices/auth.slice';
 * 
 * function ProfileScreen() {
 *   const user = useAppSelector(selectUser);
 *   const isAuthenticated = useAppSelector(selectIsAuthenticated);
 *   const loading = useAppSelector(selectAuthLoading('signIn'));
 *   const email = useAppSelector(selectUserEmail);
 *   const groups = useAppSelector(selectUserGroups);
 *   const isTeamLeader = useAppSelector(selectHasRole('team-leader'));
 *   
 *   if (!isAuthenticated) return <LoginScreen />;
 *   
 *   return (
 *     <View>
 *       <Text>Welcome, {user?.username}</Text>
 *       <Text>Email: {email}</Text>
 *       <Text>Role: {groups.join(', ')}</Text>
 *       {isTeamLeader && <TeamManagementButton />}
 *     </View>
 *   );
 * }
 * ```
 */
export function exampleSelectors() {
  console.log('=== Example 9: Using Selectors ===\n');

  const state = store.getState();

  // Basic selectors
  const user = selectUser(state);
  const isAuthenticated = selectIsAuthenticated(state);
  const loading = selectAuthLoading('signIn')(state);
  const error = selectAuthError(state);

  console.log('User:', user?.username);
  console.log('Authenticated:', isAuthenticated);
  console.log('Loading:', loading);
  console.log('Error:', error);

  // User-specific selectors
  if (user) {
    const email = selectUserEmail(state);
    const business = selectUserBusinessName(state);
    const tier = selectUserMembershipTier(state);
    const groups = selectUserGroups(state);

    console.log('\nUser Details:');
    console.log('Email:', email);
    console.log('Business:', business);
    console.log('Tier:', tier);
    console.log('Groups:', groups);

    // Role checking
    const isTeamLeader = selectHasRole('team-leader')(state);
    const isSeniorInspector = selectHasRole('senior-inspector')(state);
    console.log('\nRoles:');
    console.log('Team Leader:', isTeamLeader);
    console.log('Senior Inspector:', isSeniorInspector);
  }
}

// ==================== Example 10: Token Refresh ====================

/**
 * Example 10: Manual token refresh
 * 
 * Usually automatic, but can be triggered manually
 */
export async function exampleTokenRefresh() {
  console.log('=== Example 10: Token Refresh ===\n');

  try {
    const result = await store.dispatch(refreshTokens()).unwrap();

    console.log('✅ Tokens refreshed!');
    console.log('New expiration:', new Date(result.tokens.expiresAt).toLocaleString());
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
  }
}

// ==================== Example 11: Check Token Expiration ====================

/**
 * Example 11: Check token expiration and refresh if needed
 * 
 * This should be called periodically or on app resume
 * Usage in App.tsx:
 * ```typescript
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     dispatch(checkTokenExpiration());
 *   }, 60000); // Check every minute
 *   
 *   return () => clearInterval(interval);
 * }, [dispatch]);
 * ```
 */
export async function exampleCheckTokenExpiration() {
  console.log('=== Example 11: Check Token Expiration ===\n');

  try {
    const result = await store.dispatch(checkTokenExpiration()).unwrap();

    if (result) {
      console.log('✅ Token was expiring, refreshed automatically');
      console.log('New expiration:', new Date(result.tokens.expiresAt).toLocaleString());
    } else {
      console.log('ℹ️ Token still valid, no refresh needed');
    }
  } catch (error) {
    console.error('❌ Token check failed:', error);
  }
}

// ==================== Example 12: Error Handling ====================

/**
 * Example 12: Handle auth errors in components
 * 
 * Usage:
 * ```typescript
 * const dispatch = useAppDispatch();
 * const error = useAppSelector(selectAuthError);
 * 
 * useEffect(() => {
 *   if (error) {
 *     Alert.alert('Error', error.message);
 *     dispatch(clearError()); // Clear after showing
 *   }
 * }, [error, dispatch]);
 * ```
 */
export async function exampleErrorHandling() {
  console.log('=== Example 12: Error Handling ===\n');

  try {
    // Attempt sign in with wrong credentials
    await store.dispatch(
      signIn({
        username: 'wrong.user',
        password: 'WrongPass123!',
      })
    ).unwrap();
  } catch {
    console.log('❌ Expected error occurred');
    
    // Error is in Redux state
    const state = store.getState();
    const authError = selectAuthError(state);
    
    console.log('Error code:', authError?.code);
    console.log('Error message:', authError?.message);
    
    // Clear error after handling
    store.dispatch(clearError());
    
    console.log('Error cleared from state');
  }
}

// ==================== Example 13: Update Last Activity ====================

/**
 * Example 13: Track user activity
 * 
 * Usage in App.tsx or root component:
 * ```typescript
 * const dispatch = useAppDispatch();
 * 
 * useEffect(() => {
 *   const handleUserActivity = () => {
 *     dispatch(updateLastActivity());
 *   };
 *   
 *   // Track touches, navigation, etc.
 *   const subscription = DeviceEventEmitter.addListener(
 *     'userActivity',
 *     handleUserActivity
 *   );
 *   
 *   return () => subscription.remove();
 * }, [dispatch]);
 * ```
 */
export function exampleUpdateActivity() {
  console.log('=== Example 13: Update Last Activity ===\n');

  // Update activity timestamp
  store.dispatch(updateLastActivity());

  const state = store.getState();
  const lastActivity = state.auth.lastActivity;

  if (lastActivity) {
    console.log('Last activity updated:', new Date(lastActivity).toLocaleString());
  }
}

// ==================== Run All Examples ====================

/**
 * Run all Redux auth slice examples
 * 
 * NOTE: This is for testing/demo purposes only.
 * In production, these actions are dispatched from React components.
 */
export async function runAllReduxExamples() {
  console.log('========================================');
  console.log('Redux Auth Slice - All Examples');
  console.log('========================================\n');

  // await exampleInitializeAuth();
  // await exampleSignUp();
  // await exampleConfirmSignUp();
  // await exampleResendCode();
  // await exampleSignIn();
  // exampleSelectors();
  // await exampleForgotPassword();
  // await exampleChangePassword();
  // await exampleTokenRefresh();
  // await exampleCheckTokenExpiration();
  // exampleUpdateActivity();
  // await exampleErrorHandling();
  // await exampleSignOut();

  console.log('\n========================================');
  console.log('✅ All examples completed!');
  console.log('========================================');
}

// Export all examples
export default {
  exampleInitializeAuth,
  exampleSignIn,
  exampleSignUp,
  exampleConfirmSignUp,
  exampleResendCode,
  exampleForgotPassword,
  exampleChangePassword,
  exampleSignOut,
  exampleSelectors,
  exampleTokenRefresh,
  exampleCheckTokenExpiration,
  exampleErrorHandling,
  exampleUpdateActivity,
  runAllReduxExamples,
};
