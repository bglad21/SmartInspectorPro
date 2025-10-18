/**
 * Authentication Service - Usage Examples & Test Scenarios
 *
 * This file demonstrates all authentication features:
 * 1. User Registration with Email Verification
 * 2. Sign In and Token Management
 * 3. Forgot Password Flow
 * 4. Change Password
 * 5. Token Refresh and Validation
 * 6. User Profile Management
 * 7. Role-Based Access Control
 * 8. Complete Authentication Workflow
 *
 * @module auth.service.examples
 */

import AuthService from '../auth.service';

// ==================== Example 1: User Registration ====================

/**
 * Example 1: Complete user registration with email verification
 *
 * Flow:
 * 1. User signs up with credentials
 * 2. Cognito sends verification code to email
 * 3. User enters code to confirm email
 * 4. User can now sign in
 */
export async function exampleUserRegistration() {
  console.log('=== Example 1: User Registration ===\n');

  try {
    // Step 1: Sign up new user
    const signUpResult = await AuthService.signUp({
      username: 'john.inspector',
      password: 'SecurePass123!',
      email: 'john@abcinspections.com',
      businessName: 'ABC Inspections LLC',
      membershipTier: 'professional',
    });

    console.log('✅ User registered:', signUpResult);

    if (signUpResult.needsEmailVerification) {
      console.log('📧 Verification code sent to:', 'john@abcinspections.com');

      // Step 2: User enters verification code from email
      // In real app, prompt user for code
      const verificationCode = '123456'; // User enters this

      await AuthService.confirmSignUp({
        username: 'john.inspector',
        confirmationCode: verificationCode,
      });

      console.log('✅ Email verified successfully!');
      console.log('👉 User can now sign in');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
  }
}

// ==================== Example 2: Resend Verification Code ====================

/**
 * Example 2: Resend verification code if user didn't receive it
 */
export async function exampleResendVerificationCode() {
  console.log('=== Example 2: Resend Verification Code ===\n');

  try {
    await AuthService.resendConfirmationCode('john.inspector');
    console.log('✅ Verification code resent to user email');
  } catch (error) {
    console.error('❌ Resend code error:', error);
  }
}

// ==================== Example 3: Sign In ====================

/**
 * Example 3: Sign in and receive JWT tokens
 *
 * After sign in:
 * - User profile is retrieved
 * - JWT tokens are stored in AsyncStorage
 * - Automatic token refresh timer starts
 */
export async function exampleSignIn() {
  console.log('=== Example 3: Sign In ===\n');

  try {
    const user = await AuthService.signIn({
      username: 'john.inspector',
      password: 'SecurePass123!',
    });

    console.log('✅ Signed in successfully!');
    console.log('User Profile:', {
      userId: user.userId,
      username: user.username,
      email: user.email,
      businessName: user.businessName,
      membershipTier: user.membershipTier,
      groups: user.groups,
    });

    // Access token is now available for API requests
    const accessToken = await AuthService.getAccessToken();
    console.log('🔑 Access token:', accessToken.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ Sign in error:', error);
  }
}

// ==================== Example 4: Get Current User ====================

/**
 * Example 4: Retrieve current authenticated user profile
 */
export async function exampleGetCurrentUser() {
  console.log('=== Example 4: Get Current User ===\n');

  try {
    const user = await AuthService.getCurrentUser();

    console.log('Current User:', {
      userId: user.userId,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      businessName: user.businessName,
      membershipTier: user.membershipTier,
      groups: user.groups,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
  }
}

// ==================== Example 5: Check Authentication Status ====================

/**
 * Example 5: Check if user is authenticated
 */
export async function exampleCheckAuthStatus() {
  console.log('=== Example 5: Check Authentication Status ===\n');

  try {
    const isAuthenticated = await AuthService.isAuthenticated();
    console.log('Is Authenticated:', isAuthenticated);

    if (isAuthenticated) {
      // Check user roles
      const isTeamLeader = await AuthService.hasRole('team-leader');
      const isSeniorInspector = await AuthService.hasRole('senior-inspector');
      const isAssistant = await AuthService.hasRole('assistant-inspector');

      console.log('Roles:', {
        isTeamLeader,
        isSeniorInspector,
        isAssistant,
      });
    }
  } catch (error) {
    console.error('❌ Check auth status error:', error);
  }
}

// ==================== Example 6: Token Management ====================

/**
 * Example 6: Validate and refresh tokens
 */
export async function exampleTokenManagement() {
  console.log('=== Example 6: Token Management ===\n');

  try {
    // Validate current token
    const validation = await AuthService.validateToken();

    console.log('Token Validation:', {
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      expiresIn: `${validation.expiresIn} seconds`,
      needsRefresh: validation.needsRefresh,
    });

    if (validation.needsRefresh) {
      console.log('🔄 Token expiring soon, refreshing...');
      const newTokens = await AuthService.refreshTokens();
      console.log('✅ Tokens refreshed!');
      console.log(
        'New expiration:',
        new Date(newTokens.expiresAt).toLocaleString(),
      );
    }
  } catch (error) {
    console.error('❌ Token management error:', error);
  }
}

// ==================== Example 7: Forgot Password ====================

/**
 * Example 7: Complete forgot password flow
 *
 * Flow:
 * 1. User requests password reset
 * 2. Cognito sends verification code to email
 * 3. User enters code + new password
 * 4. Password is reset, user can sign in with new password
 */
export async function exampleForgotPassword() {
  console.log('=== Example 7: Forgot Password ===\n');

  try {
    // Step 1: Request password reset
    const resetResult = await AuthService.forgotPassword({
      username: 'john.inspector',
    });

    console.log(
      '✅ Password reset code sent to:',
      resetResult.nextStep.codeDeliveryDetails.destination,
    );

    // Step 2: User enters verification code and new password
    // In real app, prompt user for code and new password
    const verificationCode = '654321'; // User enters this
    const newPassword = 'NewSecurePass456!';

    await AuthService.confirmForgotPassword({
      username: 'john.inspector',
      confirmationCode: verificationCode,
      newPassword,
    });

    console.log('✅ Password reset successfully!');
    console.log('👉 User can now sign in with new password');
  } catch (error) {
    console.error('❌ Forgot password error:', error);
  }
}

// ==================== Example 8: Change Password (Authenticated) ====================

/**
 * Example 8: Change password for authenticated user
 */
export async function exampleChangePassword() {
  console.log('=== Example 8: Change Password ===\n');

  try {
    // User must be signed in to change password
    await AuthService.changePassword({
      oldPassword: 'SecurePass123!',
      newPassword: 'NewSecurePass789!',
    });

    console.log('✅ Password changed successfully!');
    console.log('👉 User remains signed in');
  } catch (error) {
    console.error('❌ Change password error:', error);
  }
}

// ==================== Example 9: Sign Out ====================

/**
 * Example 9: Sign out user and clear all session data
 */
export async function exampleSignOut() {
  console.log('=== Example 9: Sign Out ===\n');

  try {
    await AuthService.signOut();

    console.log('✅ Signed out successfully!');
    console.log('- Tokens cleared from AsyncStorage');
    console.log('- User profile cleared');
    console.log('- Automatic token refresh stopped');

    // Verify user is no longer authenticated
    const isAuthenticated = await AuthService.isAuthenticated();
    console.log('Is Authenticated:', isAuthenticated); // Should be false
  } catch (error) {
    console.error('❌ Sign out error:', error);
  }
}

// ==================== Example 10: Complete Authentication Workflow ====================

/**
 * Example 10: Complete workflow from registration to sign out
 */
export async function exampleCompleteWorkflow() {
  console.log('=== Example 10: Complete Authentication Workflow ===\n');

  try {
    // 1. Register new user
    console.log('\n📝 Step 1: Register new user...');
    const signUpResult = await AuthService.signUp({
      username: 'sarah.inspector',
      password: 'SecurePass123!',
      email: 'sarah@xyzinspections.com',
      businessName: 'XYZ Inspections',
      membershipTier: 'enterprise',
    });
    console.log('✅ User registered:', signUpResult.username);

    // 2. Confirm email
    console.log('\n📧 Step 2: Confirm email...');
    await AuthService.confirmSignUp({
      username: 'sarah.inspector',
      confirmationCode: '123456',
    });
    console.log('✅ Email confirmed');

    // 3. Sign in
    console.log('\n🔑 Step 3: Sign in...');
    const user = await AuthService.signIn({
      username: 'sarah.inspector',
      password: 'SecurePass123!',
    });
    console.log('✅ Signed in as:', user.username);
    console.log('   Membership:', user.membershipTier);
    console.log('   Groups:', user.groups);

    // 4. Check token validation
    console.log('\n🔍 Step 4: Validate token...');
    const validation = await AuthService.validateToken();
    console.log('✅ Token valid:', validation.isValid);
    console.log(
      '   Expires in:',
      Math.floor(validation.expiresIn / 60),
      'minutes',
    );

    // 5. Get access token for API request
    console.log('\n🎫 Step 5: Get access token...');
    const accessToken = await AuthService.getAccessToken();
    console.log('✅ Access token retrieved (for API requests)');
    console.log('   Token preview:', accessToken.substring(0, 50) + '...');

    // 6. Check roles
    console.log('\n👥 Step 6: Check user roles...');
    const hasTeamLeaderRole = await AuthService.hasRole('team-leader');
    console.log('   Has team-leader role:', hasTeamLeaderRole);

    // 7. Sign out
    console.log('\n👋 Step 7: Sign out...');
    await AuthService.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n✅ Complete workflow finished successfully!');
  } catch (error) {
    console.error('❌ Workflow error:', error);
  }
}

// ==================== Example 11: Error Handling ====================

/**
 * Example 11: Comprehensive error handling
 */
export async function exampleErrorHandling() {
  console.log('=== Example 11: Error Handling ===\n');

  // Example 1: Invalid credentials
  try {
    await AuthService.signIn({
      username: 'wrong.user',
      password: 'WrongPass123!',
    });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.log('❌ Sign in error:');
    console.log('   Code:', err.code);
    console.log('   Message:', err.message);
    // Expected: UserNotFoundException or NotAuthorizedException
  }

  // Example 2: Weak password
  try {
    await AuthService.signUp({
      username: 'test.user',
      password: 'weak', // Too weak
      email: 'test@example.com',
    });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.log('❌ Sign up error:');
    console.log('   Code:', err.code);
    console.log('   Message:', err.message);
    // Expected: InvalidPasswordException
  }

  // Example 3: Invalid verification code
  try {
    await AuthService.confirmSignUp({
      username: 'test.user',
      confirmationCode: '000000', // Wrong code
    });
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.log('❌ Confirm sign up error:');
    console.log('   Code:', err.code);
    console.log('   Message:', err.message);
    // Expected: CodeMismatchException
  }
}

// ==================== Example 12: Offline Token Storage ====================

/**
 * Example 12: Work with stored tokens offline
 */
export async function exampleOfflineTokenStorage() {
  console.log('=== Example 12: Offline Token Storage ===\n');

  try {
    // Store tokens (happens automatically on sign in)
    console.log(
      '📱 Tokens are automatically stored in AsyncStorage on sign in',
    );

    // Retrieve stored tokens
    const storedTokens = await AuthService.getStoredTokens();
    if (storedTokens) {
      console.log('✅ Retrieved stored tokens:');
      console.log(
        '   Access token:',
        storedTokens.accessToken.substring(0, 30) + '...',
      );
      console.log(
        '   Expires at:',
        new Date(storedTokens.expiresAt).toLocaleString(),
      );
    } else {
      console.log('❌ No stored tokens found');
    }

    // Retrieve stored user
    const storedUser = await AuthService.getStoredUser();
    if (storedUser) {
      console.log('✅ Retrieved stored user:');
      console.log('   Username:', storedUser.username);
      console.log('   Email:', storedUser.email);
      console.log('   Business:', storedUser.businessName);
    } else {
      console.log('❌ No stored user found');
    }
  } catch (error) {
    console.error('❌ Offline storage error:', error);
  }
}

// ==================== Example 13: Automatic Token Refresh ====================

/**
 * Example 13: Automatic token refresh in background
 *
 * Token refresh timer:
 * - Starts automatically on sign in
 * - Checks token every 60 seconds
 * - Refreshes if expiring in < 5 minutes
 * - Stops on sign out
 */
export async function exampleAutomaticTokenRefresh() {
  console.log('=== Example 13: Automatic Token Refresh ===\n');

  try {
    // Sign in to start token refresh timer
    await AuthService.signIn({
      username: 'john.inspector',
      password: 'SecurePass123!',
    });

    console.log('✅ Signed in - automatic token refresh started');
    console.log('   - Checks token every 60 seconds');
    console.log('   - Refreshes if expiring in < 5 minutes');

    // Manually check token
    const validation = await AuthService.validateToken();
    console.log('Token status:', {
      valid: validation.isValid,
      expiresIn: `${Math.floor(validation.expiresIn / 60)} minutes`,
      needsRefresh: validation.needsRefresh,
    });

    // Token refresh happens automatically in background
    console.log('🔄 Token will be automatically refreshed when needed');

    // Sign out to stop timer
    await AuthService.signOut();
    console.log('✅ Signed out - automatic token refresh stopped');
  } catch (error) {
    console.error('❌ Token refresh error:', error);
  }
}

// ==================== Run All Examples ====================

/**
 * Run all authentication examples in sequence
 *
 * NOTE: This is for testing/demo purposes only.
 * In production, these flows are triggered by user actions.
 */
export async function runAllAuthExamples() {
  console.log('========================================');
  console.log('Authentication Service - All Examples');
  console.log('========================================\n');

  // await exampleUserRegistration();
  // await exampleResendVerificationCode();
  // await exampleSignIn();
  // await exampleGetCurrentUser();
  // await exampleCheckAuthStatus();
  // await exampleTokenManagement();
  // await exampleForgotPassword();
  // await exampleChangePassword();
  // await exampleSignOut();
  // await exampleCompleteWorkflow();
  // await exampleErrorHandling();
  // await exampleOfflineTokenStorage();
  // await exampleAutomaticTokenRefresh();

  console.log('\n========================================');
  console.log('✅ All examples completed!');
  console.log('========================================');
}

// Export all examples
export default {
  exampleUserRegistration,
  exampleResendVerificationCode,
  exampleSignIn,
  exampleGetCurrentUser,
  exampleCheckAuthStatus,
  exampleTokenManagement,
  exampleForgotPassword,
  exampleChangePassword,
  exampleSignOut,
  exampleCompleteWorkflow,
  exampleErrorHandling,
  exampleOfflineTokenStorage,
  exampleAutomaticTokenRefresh,
  runAllAuthExamples,
};
