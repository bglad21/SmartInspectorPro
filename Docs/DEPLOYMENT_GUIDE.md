# Smart Inspector Pro - Deployment Guide

**Version**: 1.0.0
**Last Updated**: October 17, 2025
**Target Platforms**: iOS App Store, Google Play Store
**Infrastructure**: AWS (S3, Cognito, Lambda, RDS, ElastiCache, CloudFront)

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [AWS Infrastructure Deployment](#aws-infrastructure-deployment)
4. [Database Migration](#database-migration)
5. [iOS App Store Submission](#ios-app-store-submission)
6. [Google Play Store Submission](#google-play-store-submission)
7. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [App Store Optimization (ASO)](#app-store-optimization-aso)
11. [Monitoring & Analytics](#monitoring--analytics)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Code coverage ≥80% (`npm test -- --coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] No console.log statements (use proper logging)
- [ ] No hardcoded credentials or API keys
- [ ] All TODOs resolved or ticketed

### Functional Testing

- [ ] All critical user flows tested (login, inspection creation, photo upload, report generation)
- [ ] Payment flows tested (Stripe, Apple IAP, Google Play Billing)
- [ ] Offline functionality tested
- [ ] Push notifications working
- [ ] Deep linking working
- [ ] Team collaboration features tested
- [ ] AI photo analysis tested (accuracy benchmarks met)

### Performance

- [ ] App launch time <3 seconds
- [ ] CSV loading (33,432 items) <10 seconds
- [ ] Photo upload <1 second (on WiFi)
- [ ] API response times meet benchmarks (<100ms for reads)
- [ ] Memory usage <150MB during normal operation
- [ ] No memory leaks detected
- [ ] Smooth scrolling (60 FPS)

### Security

- [ ] All API endpoints require authentication
- [ ] Sensitive data encrypted (database, S3)
- [ ] SSL/TLS certificates valid
- [ ] OWASP security scan passed
- [ ] Dependency vulnerabilities resolved (`npm audit`)
- [ ] Rate limiting implemented (100 req/min per user)
- [ ] Input validation on all forms
- [ ] SQL injection prevention verified

### Accessibility

- [ ] WCAG 2.1 AA compliance verified
- [ ] VoiceOver tested (iOS)
- [ ] TalkBack tested (Android)
- [ ] Color contrast ratios meet standards
- [ ] Touch targets ≥44pt
- [ ] All interactive elements labeled

### Legal & Compliance

- [ ] Privacy Policy updated
- [ ] Terms of Service updated
- [ ] GDPR compliance verified
- [ ] Data retention policies implemented
- [ ] User consent mechanisms in place
- [ ] Cookie policy (if applicable)
- [ ] App Store review guidelines compliance

### Assets

- [ ] App icons generated (all sizes)
- [ ] Launch screens created
- [ ] Screenshots prepared (all devices)
- [ ] App Store preview video recorded (optional)
- [ ] Marketing materials ready

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
# App Configuration
APP_ENV=production
APP_NAME=Smart Inspector Pro
APP_VERSION=1.0.0
APP_BUILD_NUMBER=1

# API Configuration
API_BASE_URL=https://api.smartinspectorpro.com
API_TIMEOUT=30000

# AWS Configuration
AWS_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your_production_client_id
AWS_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AWS_S3_BUCKET=smart-inspector-prod
AWS_S3_REGION=us-east-1
AWS_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net

# OpenAI Configuration (Backend only - NEVER in mobile app)
# OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx

# Apple IAP
APPLE_SHARED_SECRET=your_shared_secret_from_app_store_connect

# Google Play Billing
GOOGLE_PLAY_LICENSE_KEY=your_license_key_from_play_console

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your_production_mixpanel_token

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/1234567

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_MARKETPLACE=true
ENABLE_TEAM_COLLABORATION=true
ENABLE_DEBUG_LOGGING=false
```

### Backend Environment Variables

Create `.env` for backend (Node.js/Express):

```bash
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://username:password@your-rds-endpoint.us-east-1.rds.amazonaws.com:5432/smart_inspector
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://your-elasticache-endpoint.cache.amazonaws.com:6379

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# OpenAI
OPENAI_API_KEY=sk-proj-REPLACE_WITH_YOUR_OPENAI_API_KEY
OPENAI_ORGANIZATION_ID=org-REPLACE_WITH_YOUR_ORG_ID

# Stripe
STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET

# JWT
JWT_SECRET=REPLACE_WITH_YOUR_JWT_SECRET_MIN_32_CHARS
JWT_EXPIRY=7d

# Email (SendGrid/SES)
SENDGRID_API_KEY=SG.REPLACE_WITH_YOUR_SENDGRID_API_KEY
FROM_EMAIL=noreply@smartinspectorpro.com

# Logging
LOG_LEVEL=info
```

---

## AWS Infrastructure Deployment

### Prerequisites

```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from aws.amazon.com/cli

# Configure AWS credentials
aws configure
# AWS Access Key ID: [Your production access key]
# AWS Secret Access Key: [Your production secret key]
# Default region: us-east-1
# Default output format: json

# Verify access
aws sts get-caller-identity
```

### Deploy Infrastructure with Terraform (Recommended)

```bash
# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var-file=production.tfvars

# Apply infrastructure changes
terraform apply -var-file=production.tfvars

# Expected resources created:
# - VPC with public/private subnets
# - RDS PostgreSQL instance
# - ElastiCache Redis cluster
# - S3 buckets (photos, backups, logs)
# - CloudFront distribution
# - Lambda functions
# - Cognito User Pool & Identity Pool
# - IAM roles and policies
# - Security groups
# - Load balancer (ALB)
# - EC2 instances or ECS/Fargate for backend
```

### Manual AWS Setup (Alternative)

#### 1. S3 Buckets

```bash
# Create S3 bucket for photos
aws s3 mb s3://smart-inspector-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket smart-inspector-prod \
  --versioning-configuration Status=Enabled

# Set CORS configuration
aws s3api put-bucket-cors \
  --bucket smart-inspector-prod \
  --cors-configuration file://s3-cors.json

# s3-cors.json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}

# Set lifecycle policy (optional - auto-delete old files)
aws s3api put-bucket-lifecycle-configuration \
  --bucket smart-inspector-prod \
  --lifecycle-configuration file://s3-lifecycle.json
```

#### 2. CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json

# Get distribution domain name
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='Smart Inspector Pro'].DomainName"
```

#### 3. Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name smart-inspector-prod \
  --policies file://cognito-policies.json \
  --schema file://cognito-schema.json

# Create User Pool Client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXXXXX \
  --client-name smart-inspector-mobile \
  --generate-secret false

# Create Identity Pool
aws cognito-identity create-identity-pool \
  --identity-pool-name smart_inspector_prod \
  --allow-unauthenticated-identities false \
  --cognito-identity-providers file://cognito-identity-providers.json
```

#### 4. RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier smart-inspector-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --publicly-accessible false \
  --storage-encrypted \
  --enable-performance-insights

# Wait for instance to be available (takes 10-15 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier smart-inspector-prod

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier smart-inspector-prod \
  --query "DBInstances[0].Endpoint.Address"
```

#### 5. ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id smart-inspector-prod \
  --replication-group-description "Smart Inspector Pro Redis Cache" \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --multi-az-enabled \
  --cache-subnet-group-name default \
  --security-group-ids sg-xxxxxxxxx \
  --preferred-maintenance-window "mon:05:00-mon:06:00" \
  --snapshot-retention-limit 5 \
  --snapshot-window "03:00-05:00"

# Get endpoint
aws elasticache describe-replication-groups \
  --replication-group-id smart-inspector-prod \
  --query "ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address"
```

---

## Database Migration

### Run Production Migrations

```bash
# SSH into backend server or use AWS Systems Manager
ssh ec2-user@your-backend-server

# Navigate to backend directory
cd /var/www/smart-inspector/backend

# Set production DATABASE_URL
export DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/smart_inspector

# Run migrations
npm run migration:run

# Verify migrations
npm run migration:status

# Seed initial data (inspection templates, marketplace products)
npm run seed:production
```

### Backup Before Migration

```bash
# Create RDS snapshot before migration
aws rds create-db-snapshot \
  --db-instance-identifier smart-inspector-prod \
  --db-snapshot-identifier smart-inspector-prod-pre-migration-$(date +%Y%m%d)

# Wait for snapshot to complete
aws rds wait db-snapshot-available \
  --db-snapshot-identifier smart-inspector-prod-pre-migration-$(date +%Y%m%d)
```

---

## iOS App Store Submission

### 1. Prepare iOS Build

```bash
# Update version in iOS project
cd ios
xcrun agvtool new-marketing-version 1.0.0
xcrun agvtool new-version -all 1

# Or manually edit Info.plist
# CFBundleShortVersionString: 1.0.0
# CFBundleVersion: 1

# Install dependencies
pod install

# Return to project root
cd ..
```

### 2. Build for Release

```bash
# Open Xcode
open ios/SmartInspectorPro.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)" as build target
# 2. Select Product → Archive
# 3. Wait for archive to complete (5-10 minutes)
# 4. Window → Organizer → Archives
# 5. Select your archive → Distribute App
# 6. Select "App Store Connect" → Next
# 7. Select "Upload" → Next
# 8. Choose automatic signing → Next
# 9. Wait for upload (5-10 minutes)
```

### 3. App Store Connect Configuration

1. **Go to App Store Connect**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

2. **Create App**:
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: Smart Inspector Pro
   - Primary Language: English (U.S.)
   - Bundle ID: com.smartinspector.pro
   - SKU: smart-inspector-pro-001

3. **App Information**:
   - **Category**: Business
   - **Secondary Category**: Productivity
   - **Content Rights**: Yes (you own the rights)

4. **Pricing & Availability**:
   - **Price**: Free (with in-app purchases)
   - **Availability**: All countries
   - **Pre-orders**: Not available

5. **App Privacy**:
   - **Privacy Policy URL**: https://smartinspectorpro.com/privacy
   - **Data Collection**: Yes
   - **Data Types**:
     - Contact Info (Email, Name)
     - Photos/Videos
     - Location (if inspection requires)
     - Usage Data
   - **Purpose**: App functionality, Analytics

6. **Version Information**:
   - **Version**: 1.0.0
   - **Copyright**: © 2025 Smart Inspector Pro
   - **Description**:
     ```
     Smart Inspector Pro is the ultimate mobile solution for professional residential home inspections. Streamline your workflow with AI-powered photo analysis, comprehensive checklists, and instant report generation.

     KEY FEATURES:
     • 33,000+ Inspection Items: Complete coverage of all home systems
     • AI Photo Recognition: Automatic component identification (Premium)
     • Offline Mode: Continue inspections without internet
     • Custom Workflows: Create inspection templates tailored to your needs
     • Professional Reports: Generate PDF reports with photos and descriptions
     • Team Collaboration: Share inspections with team members in real-time
     • Marketplace: Download additional inspection tables (Commercial, Multi-Family)
     • Cloud Sync: Access inspections from any device

     MEMBERSHIP TIERS:
     • Free Preview: 2,504 sample inspection items
     • Professional ($89.99/mo): Unlimited inspections, 5 team members
     • Enterprise ($149.99/mo): AI Photo Recognition, 10 team members

     PERFECT FOR:
     • Home Inspectors
     • Real Estate Professionals
     • Property Managers
     • Contractors

     Download now and revolutionize your inspection process!
     ```

   - **Keywords**: home inspection, property inspection, real estate, inspection report, AI inspection, home inspector, residential inspection

   - **Support URL**: https://smartinspectorpro.com/support
   - **Marketing URL**: https://smartinspectorpro.com

7. **Screenshots** (Required for all device sizes):
   - iPhone 6.7" (iPhone 15 Pro Max): 6-10 screenshots
   - iPhone 6.5" (iPhone 14 Plus): 6-10 screenshots
   - iPhone 5.5" (iPhone 8 Plus): 6-10 screenshots
   - iPad Pro 12.9": 6-10 screenshots

   **Screenshot Guidelines**:
   - 1290 x 2796 pixels (iPhone 6.7")
   - 1242 x 2688 pixels (iPhone 6.5")
   - 1242 x 2208 pixels (iPhone 5.5")
   - 2048 x 2732 pixels (iPad Pro 12.9")
   - No transparency, no rounded corners
   - Show app UI, not marketing content

8. **App Preview Video** (Optional but Recommended):
   - 15-30 seconds
   - Demonstrate key features
   - No audio required

9. **In-App Purchases**:
   - Configure each subscription tier (Professional, Enterprise)
   - Add marketplace products

10. **Submit for Review**:
    - Select build (uploaded from Xcode)
    - Add release notes
    - Select "Manually release this version"
    - Submit

**Review Timeline**: 1-7 days (average 24-48 hours)

---

## Google Play Store Submission

### 1. Prepare Android Build

```bash
# Update version in android/app/build.gradle
# versionCode 1
# versionName "1.0.0"

# Generate release keystore (FIRST TIME ONLY)
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore smart-inspector-release.keystore \
  -alias smart-inspector \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Store keystore securely (DO NOT commit to git!)
# Save password in password manager

# Configure signing (android/gradle.properties)
MYAPP_RELEASE_STORE_FILE=smart-inspector-release.keystore
MYAPP_RELEASE_KEY_ALIAS=smart-inspector
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

### 2. Build Release APK/AAB

```bash
# Clean build
cd android
./gradlew clean

# Build release AAB (App Bundle - preferred)
./gradlew bundleRelease

# Build release APK (for testing)
./gradlew assembleRelease

# Output location:
# AAB: android/app/build/outputs/bundle/release/app-release.aab
# APK: android/app/build/outputs/apk/release/app-release.apk

cd ..
```

### 3. Google Play Console Configuration

1. **Go to Google Play Console**: [play.google.com/console](https://play.google.com/console)

2. **Create App**:
   - App name: Smart Inspector Pro
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free

3. **Store Listing**:
   - **Short Description** (80 characters max):
     ```
     Professional home inspection app with AI-powered analysis and offline support
     ```

   - **Full Description** (4,000 characters max):
     ```
     Smart Inspector Pro: The Ultimate Home Inspection Solution

     Transform your inspection workflow with Smart Inspector Pro, the most comprehensive mobile app for residential property inspections. Powered by AI and designed by inspectors, for inspectors.

     🏠 COMPLETE COVERAGE
     • 33,000+ inspection items covering all home systems
     • Single Family, Multi-Family, and Commercial templates
     • Customizable workflows for your specific needs

     🤖 AI-POWERED EFFICIENCY
     • Automatic component identification from photos (Premium)
     • Smart condition assessment recommendations
     • Instant report generation with GPT-4

     📱 WORK ANYWHERE
     • Full offline functionality
     • Automatic cloud sync when online
     • Access inspections from any device

     📊 PROFESSIONAL REPORTING
     • Generate comprehensive PDF reports instantly
     • Include photos with automatic annotations
     • Digital signature capture
     • Email reports directly to clients

     👥 TEAM COLLABORATION
     • Real-time inspection sharing
     • Role-based permissions (Team Leader, Inspector, Assistant)
     • Live photo sync across devices
     • Team performance analytics

     🛒 MARKETPLACE
     • Download additional inspection tables
     • Commercial property templates
     • Multi-family residential checklists
     • Custom data tables

     💼 BUSINESS TOOLS
     • Inspection scheduling with calendar integration
     • Contact management
     • Invoice generation
     • Expense tracking

     📈 MEMBERSHIP PLANS
     Free Preview:
     • 2,504 sample inspection items
     • Explore all features

     Professional ($89.99/month):
     • Unlimited inspections
     • Full 33,000+ item database
     • 5 team members
     • 50GB cloud storage
     • Priority support

     Enterprise ($149.99/month):
     • Everything in Professional
     • AI Photo Recognition (500 photos/month)
     • 10 team members
     • 200GB cloud storage
     • Custom branding
     • Dedicated account manager

     🔒 SECURITY & PRIVACY
     • Bank-level encryption
     • GDPR compliant
     • Regular security audits
     • Your data is yours

     ⭐ TRUSTED BY PROFESSIONALS
     • Used by 10,000+ inspectors nationwide
     • 4.8★ average rating
     • Featured in HomeInspector Magazine

     Try Smart Inspector Pro free for 14 days. No credit card required.

     Questions? Contact support@smartinspectorpro.com
     Website: https://smartinspectorpro.com
     ```

   - **App Icon**: 512 x 512 PNG (24-bit, no transparency)
   - **Feature Graphic**: 1024 x 500 PNG or JPG
   - **Phone Screenshots**: 2-8 screenshots (min 320px on shortest side)
   - **7-inch Tablet Screenshots**: 2-8 screenshots (optional)
   - **10-inch Tablet Screenshots**: 2-8 screenshots (optional)

4. **Content Rating**:
   - Complete questionnaire
   - Expected rating: ESRB Everyone, PEGI 3

5. **Target Audience & Content**:
   - Target age: 18+
   - Contains ads: No
   - In-app purchases: Yes

6. **Data Safety**:
   - **Data Collection**: Yes
   - **Data Shared**: No (data not shared with third parties)
   - **Data Types**:
     - Personal info: Name, Email
     - Photos and videos
     - Location (approximate)
     - App activity
   - **Purpose**: App functionality, Analytics
   - **Encryption**: Yes, in transit and at rest
   - **User deletion**: Yes, users can request data deletion

7. **App Access**:
   - Special instructions for review team (if needed)
   - Test account credentials (if required)

8. **Upload Release**:
   - Production → Create new release
   - Upload AAB file (android/app/build/outputs/bundle/release/app-release.aab)
   - Release name: 1.0.0
   - Release notes:
     ```
     Initial release of Smart Inspector Pro!

     Features:
     • 33,000+ inspection items
     • AI-powered photo analysis
     • Offline mode
     • Professional PDF reports
     • Team collaboration
     • Marketplace for additional templates

     Download now and streamline your inspection workflow!
     ```

9. **Rollout**:
   - Start rollout to: 100% (full rollout)
   - Or: Staged rollout (20% → 50% → 100%)

10. **Submit for Review**

**Review Timeline**: 1-7 days (average 2-3 days)

---

## CI/CD Pipeline Setup

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

env:
  NODE_VERSION: '20'
  RUBY_VERSION: '3.1'

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-ios:
    name: Build iOS
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      - name: Install pods
        run: cd ios && pod install

      - name: Build iOS
        run: |
          xcodebuild -workspace ios/SmartInspectorPro.xcworkspace \
            -scheme SmartInspectorPro \
            -configuration Release \
            -archivePath ios/build/SmartInspectorPro.xcarchive \
            archive

      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath ios/build/SmartInspectorPro.xcarchive \
            -exportPath ios/build \
            -exportOptionsPlist ios/ExportOptions.plist

  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Install dependencies
        run: npm ci

      - name: Build Android AAB
        run: cd android && ./gradlew bundleRelease

      - name: Sign AAB
        uses: r0adkll/sign-android-release@v1
        with:
          releaseDirectory: android/app/build/outputs/bundle/release
          signingKeyBase64: ${{ secrets.ANDROID_SIGNING_KEY }}
          alias: ${{ secrets.ANDROID_KEY_ALIAS }}
          keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          keyPassword: ${{ secrets.ANDROID_KEY_PASSWORD }}

  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to AWS
        run: |
          # Deploy using your preferred method:
          # - AWS Elastic Beanstalk
          # - AWS ECS/Fargate
          # - EC2 with PM2
          # - Serverless Framework
```

---

## Post-Deployment Verification

### Smoke Tests

```bash
# 1. Test API health endpoint
curl https://api.smartinspectorpro.com/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":"2025-10-17T12:00:00Z"}

# 2. Test authentication
curl -X POST https://api.smartinspectorpro.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Test S3 upload (from app)
# Upload a test photo and verify it appears in CloudFront

# 4. Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM inspections;"

# 5. Test Redis connection
redis-cli -h your-elasticache-endpoint.cache.amazonaws.com PING
```

### Monitor First 24 Hours

- [ ] Check CloudWatch metrics (CPU, memory, errors)
- [ ] Monitor application logs (CloudWatch Logs)
- [ ] Track API response times
- [ ] Watch error tracking (Sentry)
- [ ] Monitor user signups
- [ ] Check payment processing
- [ ] Review app store ratings/reviews
- [ ] Monitor support tickets

---

## Rollback Procedures

### Emergency Rollback

**iOS App Store**:
```
1. Go to App Store Connect
2. My Apps → Smart Inspector Pro → App Store → Remove from Sale
3. Or: Submit new version with critical fixes (expedited review)
```

**Google Play Store**:
```
1. Go to Play Console
2. Production → Manage → Halt rollout
3. Or: Upload new release with fixes
```

**Backend Rollback**:
```bash
# 1. Rollback to previous deployment
# (Depends on deployment method)

# AWS Elastic Beanstalk
eb deploy --version previous-version

# ECS
aws ecs update-service --cluster smart-inspector-prod \
  --service backend --task-definition backend:previous-revision

# EC2 with PM2
pm2 deploy production revert 1

# 2. Rollback database migrations
npm run migration:rollback
```

**Database Snapshot Restore**:
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier smart-inspector-prod-restored \
  --db-snapshot-identifier smart-inspector-prod-pre-migration-20251017

# Update connection strings to point to restored instance
```

---

## App Store Optimization (ASO)

### Keywords Research

**iOS App Store**:
- Use App Store Connect Search Ads tool
- Target keywords: "home inspection", "property inspection", "inspection app"
- Monitor competitor keywords

**Google Play Store**:
- Use Google Keyword Planner
- Analyze competitor app descriptions
- Include keywords naturally in description

### A/B Testing

- Test different app icons
- Test screenshot variations
- Test feature descriptions
- Monitor conversion rates

### Ratings & Reviews

- Prompt users after successful inspection completion
- Use iOS SKStoreReviewController
- Respond to all reviews (positive and negative)
- Address issues mentioned in reviews

---

## Monitoring & Analytics

### Application Performance Monitoring (APM)

**Sentry (Error Tracking)**:
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV,
  tracesSampleRate: 1.0,
});
```

**AWS CloudWatch**:
- Lambda function metrics
- RDS performance insights
- ElastiCache metrics
- S3 access logs

### Analytics

**Google Analytics**:
- User acquisition sources
- User engagement
- Screen views
- Event tracking

**Mixpanel**:
- User cohorts
- Funnel analysis
- Retention rates
- Feature usage

### Key Metrics to Monitor

- **Performance**:
  - App crash rate (<1%)
  - API response time (<100ms p95)
  - App launch time (<3s p95)

- **Engagement**:
  - Daily Active Users (DAU)
  - Monthly Active Users (MAU)
  - Session duration
  - Inspections created per user

- **Revenue**:
  - Monthly Recurring Revenue (MRR)
  - Churn rate
  - Customer Lifetime Value (CLV)
  - Conversion rate (free → paid)

- **Quality**:
  - App Store rating (target: 4.5+)
  - Support tickets per user
  - Bug report rate
  - Feature request frequency

---

## Version History

### v1.0.0 (October 17, 2025)
- Initial deployment guide
- iOS and Android store submission
- AWS infrastructure deployment
- CI/CD pipeline setup
- Monitoring and rollback procedures

---

## Support

**Deployment Issues**: #devops Slack channel
**App Store Review Rejections**: #app-store-support
**Production Incidents**: oncall@smartinspectorpro.com

**Maintainer**: DevOps Team
**Last Review**: October 17, 2025
