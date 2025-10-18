// AWS Amplify Configuration for Smart Inspector Pro
// This file configures connection to existing AWS infrastructure

/**
 * AWS Resource Configuration
 *
 * IMPORTANT: These values connect to EXISTING AWS resources.
 * Do not modify without understanding the infrastructure.
 *
 * Documentation: Docs/AWS_INFRASTRUCTURE_COMPLETED.md
 */

// Environment variables (will be replaced with react-native-config later)
const ENV = {
  AWS_COGNITO_CLIENT_ID: undefined as string | undefined,
  API_GATEWAY_URL: undefined as string | undefined,
  NODE_ENV: 'development' as 'development' | 'staging' | 'production',
};

export const awsConfig = {
  // AWS Region
  region: 'us-east-1',

  // Cognito User Pool Configuration
  Auth: {
    // Cognito User Pool ID (existing resource)
    userPoolId: 'us-east-1_HgZUMoxyZ',

    // Cognito User Pool Web Client ID
    // TODO: Create App Client in Cognito console if not exists
    // Navigate to: Cognito > User Pools > sip-sandbox-users > App integration > App clients
    userPoolWebClientId: ENV.AWS_COGNITO_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',

    // Cognito Identity Pool ID (for S3 direct uploads)
    identityPoolId: 'us-east-1:2802578f-d589-44d3-8ba1-449a457cef36',

    // Region
    region: 'us-east-1',

    // Authentication flow
    authenticationFlowType: 'USER_SRP_AUTH', // Secure Remote Password

    // OAuth configuration (if using social sign-in later)
    oauth: {
      domain: '', // TODO: Set up if using Hosted UI
      scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
      redirectSignIn: 'smartinspectorpro://', // Deep link for mobile
      redirectSignOut: 'smartinspectorpro://',
      responseType: 'code', // Authorization code flow
    },
  },

  // S3 Storage Configuration
  Storage: {
    // S3 Bucket Name (existing resource)
    bucket: 'smart-inspector-production',

    // Region
    region: 'us-east-1',

    // CORS configuration already set in bucket
    // Custom prefix for user uploads
    customPrefix: {
      public: 'public/',
      protected: 'users/{identityId}/',
      private: 'users/{identityId}/private/',
    },

    // CloudFront CDN (optional - for faster photo delivery)
    // If using CloudFront, photos will be served from CDN
    cloudFront: {
      enabled: true,
      domain: 'd3g3dd1e1f7859.cloudfront.net',
    },
  },

  // API Gateway Configuration (when backend is deployed)
  API: {
    endpoints: [
      {
        name: 'SmartInspectorAPI',
        endpoint: ENV.API_GATEWAY_URL || 'https://api.smartinspectorpro.com',
        region: 'us-east-1',
        custom_header: async () => {
          // Add Cognito JWT token to API requests
          return {
            Authorization: `Bearer ${await getAccessToken()}`,
          };
        },
      },
    ],
  },
};

/**
 * Helper function to get current user's access token
 * Used for API Gateway authorization
 */
async function getAccessToken(): Promise<string> {
  // This will be implemented with Amplify Auth.currentSession()
  // Placeholder for now
  return '';
}

/**
 * Environment-specific configuration
 * Overrides for development/staging/production
 */
export const getEnvironmentConfig = () => {
  const env = ENV.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        ...awsConfig,
        API: {
          endpoints: [
            {
              ...awsConfig.API.endpoints[0],
              endpoint: 'https://api.smartinspectorpro.com',
            },
          ],
        },
      };

    case 'staging':
      return {
        ...awsConfig,
        API: {
          endpoints: [
            {
              ...awsConfig.API.endpoints[0],
              endpoint: 'https://api-staging.smartinspectorpro.com',
            },
          ],
        },
      };

    case 'development':
    default:
      return {
        ...awsConfig,
        API: {
          endpoints: [
            {
              ...awsConfig.API.endpoints[0],
              endpoint: ENV.API_GATEWAY_URL || 'http://localhost:3000',
            },
          ],
        },
      };
  }
};

/**
 * Cognito RBAC Groups
 * These groups are already created in Cognito
 */
export const CognitoGroups = {
  ADMIN: 'admin', // Platform administration
  TEAM_LEADER: 'team-leader', // Full team management
  SENIOR_INSPECTOR: 'senior-inspector', // Create/edit inspections
  ASSISTANT_INSPECTOR: 'assistant-inspector', // View and contribute
} as const;

export type CognitoGroup = (typeof CognitoGroups)[keyof typeof CognitoGroups];

/**
 * S3 Folder Structure
 * Mirrors the bucket organization
 */
export const S3Folders = {
  // User-specific folders
  inspections: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}`,
  photos: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/photos`,
  photoOriginal: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/photos/original`,
  photoOptimized: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/photos/optimized`,
  photoThumbnails: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/photos/thumbnails`,
  reports: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/reports`,
  forms: (userId: string, inspectionId: string) =>
    `users/${userId}/inspections/${inspectionId}/forms`,
  workflows: (userId: string) => `users/${userId}/workflows`,

  // System folders
  csvTemplates: () => 'system/csv-templates',
  reportTemplates: () => 'system/report-templates',
} as const;

export default awsConfig;
