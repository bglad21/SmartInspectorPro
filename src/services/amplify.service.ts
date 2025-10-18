/**
 * AWS Amplify Service Wrapper
 * Handles initialization and provides typed service interfaces
 */

import type { CognitoGroup } from '@/config/aws-config';
import { getEnvironmentConfig } from '@/config/aws-config';
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from '@aws-amplify/auth';
import { downloadData, list, remove, uploadData } from '@aws-amplify/storage';
import { Amplify } from 'aws-amplify';

// Types
export interface SignInParams {
  username: string;
  password: string;
}

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  businessName?: string;
  membershipTier?: 'professional' | 'enterprise';
}

export interface SignUpResult {
  userId: string;
  isSignUpComplete: boolean;
}

export interface User {
  username: string;
  email: string;
  userId: string;
  groups: CognitoGroup[];
  attributes: Record<string, string>;
}

export interface UploadPhotoParams {
  uri: string;
  filename: string;
  folder: 'inspections' | 'reports' | 'signatures' | 'profile';
  inspectionId?: string;
  contentType?: string;
}

/**
 * Initialize AWS Amplify with configuration
 * Call this once at app startup (in App.tsx or index.js)
 */
export const initializeAmplify = (): void => {
  const config = getEnvironmentConfig();
  // Configure Amplify with environment-specific settings
  // Note: Type assertion needed due to Amplify v6 config structure differences
  Amplify.configure(config as any);
  console.log('✅ AWS Amplify initialized successfully');
};

/**
 * Authentication Service
 * Provides typed interfaces for Cognito authentication
 */
export const AuthService = {
  /**
   * Sign in user with username and password
   */
  async signIn(params: SignInParams): Promise<User> {
    try {
      const { username, password } = params;

      const result = await signIn({ username, password });

      if (result.isSignedIn) {
        return await AuthService.getCurrentUser();
      }

      throw new Error('Sign in failed');
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign up new user with email verification
   */
  async signUp(params: SignUpParams): Promise<SignUpResult> {
    try {
      const { username, password, email, businessName, membershipTier } =
        params;

      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            'custom:businessName': businessName || '',
            'custom:membershipTier': membershipTier || 'professional',
          },
        },
      });

      return {
        userId: result.userId || '',
        isSignUpComplete: result.isSignUpComplete,
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut();
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      // Extract groups from JWT token
      const accessToken = session.tokens?.accessToken;
      const groups = (accessToken?.payload['cognito:groups'] as string[]) || [];

      return {
        username: user.username,
        email: user.signInDetails?.loginId || '',
        userId: user.userId,
        groups: groups as CognitoGroup[],
        attributes: {},
      };
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  },

  /**
   * Get JWT access token for API requests
   */
  async getAccessToken(): Promise<string> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        throw new Error('No access token available');
      }

      return token;
    } catch (error) {
      console.error('❌ Get access token error:', error);
      throw error;
    }
  },

  /**
   * Check if user has specific role
   */
  async hasRole(role: CognitoGroup): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      return user.groups.includes(role);
    } catch {
      return false;
    }
  },
};

/**
 * Storage Service
 * Provides typed interfaces for S3 photo uploads
 */
export const StorageService = {
  /**
   * Upload photo to S3 with CloudFront CDN
   */
  async uploadPhoto(
    params: UploadPhotoParams,
  ): Promise<{ key: string; url: string }> {
    try {
      const {
        uri,
        filename,
        folder,
        inspectionId,
        contentType = 'image/jpeg',
      } = params;

      // Construct S3 key based on folder structure
      let key: string;
      if (inspectionId && folder === 'inspections') {
        key = `inspections/${inspectionId}/photos/${filename}`;
      } else {
        key = `${folder}/${filename}`;
      }

      // Fetch file data from URI (React Native specific)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to S3
      const result = await uploadData({
        key,
        data: blob,
        options: {
          contentType,
          accessLevel: 'protected', // User-specific folder
        },
      }).result;

      // Construct CloudFront URL
      const cloudFrontUrl = `https://d3g3dd1e1f7859.cloudfront.net/${result.key}`;

      console.log(`✅ Photo uploaded successfully: ${cloudFrontUrl}`);

      return {
        key: result.key,
        url: cloudFrontUrl,
      };
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      throw error;
    }
  },

  /**
   * Download photo from S3
   */
  async downloadPhoto(key: string): Promise<unknown> {
    try {
      const result = await downloadData({
        key,
        options: {
          accessLevel: 'protected',
        },
      }).result;

      return result.body;
    } catch (error) {
      console.error('❌ Photo download error:', error);
      throw error;
    }
  },

  /**
   * List photos in a folder
   */
  async listPhotos(prefix: string): Promise<string[]> {
    try {
      const result = await list({
        prefix,
        options: {
          accessLevel: 'protected',
        },
      });

      return result.items.map(item => item.key);
    } catch (error) {
      console.error('❌ List photos error:', error);
      throw error;
    }
  },

  /**
   * Delete photo from S3
   */
  async deletePhoto(key: string): Promise<void> {
    try {
      await remove({
        key,
        options: {
          accessLevel: 'protected',
        },
      });

      console.log(`✅ Photo deleted successfully: ${key}`);
    } catch (error) {
      console.error('❌ Photo delete error:', error);
      throw error;
    }
  },
};

// Export convenience function for initialization
export default {
  initialize: initializeAmplify,
  Auth: AuthService,
  Storage: StorageService,
};
