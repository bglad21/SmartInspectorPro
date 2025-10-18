# Smart Inspector Pro - Testing Guidelines

**Version**: 1.0.0  
**Last Updated**: October 17, 2025  
**Status**: Pre-Development Testing Strategy

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End (E2E) Testing](#end-to-end-e2e-testing)
6. [API Testing](#api-testing)
7. [Mobile App Testing](#mobile-app-testing)
8. [AWS Services Testing](#aws-services-testing)
9. [AI Integration Testing](#ai-integration-testing)
10. [Performance Testing](#performance-testing)
11. [Security Testing](#security-testing)
12. [Accessibility Testing](#accessibility-testing)
13. [Internationalization Testing](#internationalization-testing)
14. [Test Data Management](#test-data-management)
15. [CI/CD Testing Pipeline](#cicd-testing-pipeline)
16. [Bug Reporting & Tracking](#bug-reporting--tracking)

---

## Testing Philosophy

### Core Principles

**1. Test Early, Test Often**
- Write tests alongside code (TDD/BDD when appropriate)
- Catch bugs before they reach production
- Automated tests run on every commit

**2. Right Tests, Right Time**
- Unit tests: Fast, isolated, comprehensive
- Integration tests: Critical paths, service interactions
- E2E tests: User workflows, business-critical features

**3. Test Automation First**
- Automate repetitive tests
- Manual testing for UX, edge cases, exploratory
- 80%+ code coverage goal

**4. Production-Like Testing**
- Use staging environment mirroring production
- Test with real data volumes (33,432 CSV items)
- Simulate real-world network conditions

---

## Testing Pyramid

```
              ┌──────────────┐
              │     E2E      │ ← 10% (Slow, expensive)
              │   (10 tests) │
              └──────────────┘
            ┌──────────────────┐
            │   Integration    │ ← 30% (Medium speed)
            │   (50-100 tests) │
            └──────────────────┘
        ┌────────────────────────┐
        │      Unit Tests        │ ← 60% (Fast, cheap)
        │    (500-1000 tests)    │
        └────────────────────────┘
```

**Target Test Distribution**:
- **60% Unit Tests**: Fast, isolated, comprehensive coverage
- **30% Integration Tests**: Service interactions, API endpoints
- **10% E2E Tests**: Critical user flows, business logic

---

## Unit Testing

### Framework & Tools
- **React Native**: Jest + React Native Testing Library
- **Backend (Node.js)**: Jest + Supertest
- **Code Coverage**: Istanbul (nyc)

### What to Test
✅ **Business Logic**:
- CSV parsing functions
- Hierarchy validation (Section → System → Component)
- Condition type validation (Acceptable, Monitor, Repair/Replace, Safety Hazard, Access Restricted)
- Workflow filtering algorithms
- AI response parsing

✅ **Utilities**:
- Date formatters (locale-aware)
- Currency converters
- Measurement system conversions (imperial ↔ metric)
- Photo compression algorithms
- Hash generation (SHA-256)

✅ **Redux Logic**:
- Action creators
- Reducers (state updates)
- Selectors (derived state)
- Thunks (async actions)

### Example Unit Test

```typescript
// __tests__/utils/csvParser.test.ts
import { parseCSV, validateHierarchy } from '../utils/csvParser';

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse valid single_family_sample.csv', () => {
      const csvContent = `Section,System,Location,Component,Material,Condition,Comment
Exterior Grounds,Drainage,Null,Area Drain,Concrete,Monitor,Minor debris noted`;
      
      const result = parseCSV(csvContent);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        section: 'Exterior Grounds',
        system: 'Drainage',
        component: 'Area Drain',
        material: 'Concrete',
        condition: 'Monitor'
      });
    });

    it('should throw error for invalid condition type', () => {
      const csvContent = `Section,System,Location,Component,Material,Condition,Comment
Exterior,Drainage,Null,Drain,Concrete,Invalid,Comment`;
      
      expect(() => parseCSV(csvContent)).toThrow('Invalid condition type');
    });
  });

  describe('validateHierarchy', () => {
    it('should validate correct 6-level hierarchy', () => {
      const record = {
        section: 'Exterior Grounds',
        system: 'Drainage',
        location: null,
        component: 'Area Drain',
        material: 'Concrete',
        condition: 'Monitor'
      };
      
      expect(validateHierarchy(record)).toBe(true);
    });

    it('should reject missing required fields', () => {
      const record = { section: 'Exterior', system: null };
      
      expect(validateHierarchy(record)).toBe(false);
    });
  });
});
```

### Unit Test Coverage Goals
- **Target**: 80%+ overall coverage
- **Critical modules**: 90%+ coverage (auth, payments, data parsing)
- **UI components**: 70%+ coverage (focus on logic, not styling)

### Running Unit Tests
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode (during development)
npm run test:watch

# Single file
npm test -- csvParser.test.ts
```

---

## Integration Testing

### Framework & Tools
- **API Testing**: Supertest + Jest
- **Database Testing**: PostgreSQL test database + Jest
- **AWS Services**: LocalStack or AWS SDK mocks

### What to Test
✅ **API Endpoints**:
- Authentication flow (signup → verify → login)
- Inspection CRUD operations
- Photo upload to S3
- AI photo analysis request/response
- Marketplace purchase flow (Stripe, Apple IAP, Google Play)
- Report generation

✅ **Database Operations**:
- User creation with Cognito sync
- Inspection record creation
- Foreign key constraints
- Cascade deletes
- Transaction rollbacks

✅ **AWS Service Integration**:
- S3 upload/download
- Cognito authentication
- Lambda function triggers
- SES email sending
- ElastiCache Redis caching
- RDS PostgreSQL queries

### Example Integration Test

```typescript
// __tests__/integration/inspections.test.ts
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, getAuthToken } from '../helpers/auth';
import { seedDatabase, cleanDatabase } from '../helpers/database';

describe('Inspections API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await seedDatabase();
    const user = await createTestUser({
      email: 'test@example.com',
      membershipTier: 'professional'
    });
    userId = user.id;
    authToken = await getAuthToken(user);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/inspections', () => {
    it('should create new inspection with valid data', async () => {
      const inspectionData = {
        propertyAddress: '123 Main St, Austin, TX 78701',
        scheduledDate: '2025-10-25T10:00:00Z',
        clientName: 'Jane Doe',
        inspectionType: 'pre-purchase',
        workflowId: 'workflow-123'
      };

      const response = await request(app)
        .post('/api/inspections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inspectionData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        propertyAddress: inspectionData.propertyAddress,
        status: 'scheduled',
        userId: userId
      });

      // Verify database record
      const dbRecord = await db.inspections.findById(response.body.id);
      expect(dbRecord).toBeTruthy();
    });

    it('should reject inspection without authentication', async () => {
      const response = await request(app)
        .post('/api/inspections')
        .send({ propertyAddress: '123 Main St' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject inspection for free-tier user exceeding limits', async () => {
      const freeUser = await createTestUser({
        email: 'free@example.com',
        membershipTier: 'free'
      });
      const freeToken = await getAuthToken(freeUser);

      // Create 5 inspections (free tier limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/inspections')
          .set('Authorization', `Bearer ${freeToken}`)
          .send({ propertyAddress: `${i} Test St` })
          .expect(201);
      }

      // 6th inspection should fail
      const response = await request(app)
        .post('/api/inspections')
        .set('Authorization', `Bearer ${freeToken}`)
        .send({ propertyAddress: '6 Test St' })
        .expect(403);

      expect(response.body.error.code).toBe('QUOTA_EXCEEDED');
    });
  });

  describe('POST /api/photos/upload', () => {
    it('should upload photo to S3 and return CDN URL', async () => {
      const response = await request(app)
        .post('/api/photos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', '__tests__/fixtures/test-photo.jpg')
        .field('inspectionId', 'inspection-123')
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        originalUrl: expect.stringContaining('cloudfront.net'),
        thumbnailUrl: expect.stringContaining('cloudfront.net')
      });

      // Verify S3 upload (mock or LocalStack)
      const s3Object = await s3.getObject({
        Bucket: 'smart-inspector-production',
        Key: expect.stringContaining('photos/original/')
      });
      expect(s3Object).toBeTruthy();
    });
  });
});
```

### Integration Test Environment
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: smart_inspector_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test123
    ports:
      - "5433:5432"
  
  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
  
  localstack:
    image: localstack/localstack
    environment:
      SERVICES: s3,cognito,ses,lambda
    ports:
      - "4566:4566"
```

### Running Integration Tests
```bash
# Start test services
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration

# Stop test services
docker-compose -f docker-compose.test.yml down
```

---

## End-to-End (E2E) Testing

### Framework & Tools
- **Mobile**: Detox (React Native)
- **Web**: Cypress or Playwright
- **Device Testing**: BrowserStack or AWS Device Farm

### Critical User Flows to Test

#### Flow 1: Complete Inspection Workflow
```gherkin
Feature: Complete Inspection Workflow
  As a home inspector
  I want to perform a complete inspection
  So that I can generate a professional report

  Scenario: Create inspection, capture photos, generate report
    Given I am logged in as a professional user
    When I create a new inspection for "123 Main St"
    And I capture 10 photos with AI analysis
    And I review and approve AI suggestions
    And I generate a PDF report
    Then the report should be available for download
    And all photos should be watermarked
    And the inspection status should be "completed"
```

#### Flow 2: Premium Data Unlock
```gherkin
Feature: Premium Data Access
  As a new paid subscriber
  I want to access the full Single_Family.csv data
  So that I can perform comprehensive inspections

  Scenario: First login after subscription activates premium download
    Given I just subscribed to Professional tier
    When I log in for the first time
    Then the app should download Single_Family.csv (3.5 MB)
    And show a progress indicator
    And load 33,432 items into SQLite
    And enable full workflow editor features
```

#### Flow 3: Marketplace Purchase
```gherkin
Feature: Marketplace Product Purchase
  As a commercial inspector
  I want to purchase the Office Buildings add-on
  So that I can inspect commercial properties

  Scenario: Purchase and download marketplace product
    Given I am logged in as a professional user
    And I have a valid payment method
    When I browse the marketplace
    And I select "Office Buildings" ($49.99)
    And I complete the Stripe checkout
    Then I should receive a purchase confirmation
    And the product should appear in "My Purchases"
    And I can download the CSV file
    And the workflow editor shows commercial options
```

### Example E2E Test (Detox)

```typescript
// e2e/complete-inspection.e2e.ts
describe('Complete Inspection Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { camera: 'YES', location: 'always' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await loginAsProfessionalUser();
  });

  it('should complete full inspection workflow', async () => {
    // 1. Create inspection
    await element(by.id('create-inspection-button')).tap();
    await element(by.id('property-address-input')).typeText('123 Main St, Austin, TX');
    await element(by.id('client-name-input')).typeText('Jane Doe');
    await element(by.id('scheduled-date-picker')).tap();
    await element(by.text('October 25, 2025')).tap();
    await element(by.id('save-inspection-button')).tap();

    // Verify inspection created
    await expect(element(by.text('123 Main St'))).toBeVisible();

    // 2. Open inspection
    await element(by.text('123 Main St')).tap();
    await expect(element(by.id('smart-inspector-screen'))).toBeVisible();

    // 3. Capture photo with AI
    await element(by.id('capture-photo-button')).tap();
    // Photo capture happens (mocked in test)
    await waitFor(element(by.id('ai-analysis-result'))).toBeVisible().withTimeout(5000);

    // 4. Review AI suggestion
    await expect(element(by.text('Component: Water Heater'))).toBeVisible();
    await expect(element(by.text('98% confident'))).toBeVisible();
    await element(by.id('accept-ai-suggestion-button')).tap();

    // 5. Add 9 more photos (loop)
    for (let i = 0; i < 9; i++) {
      await element(by.id('capture-photo-button')).tap();
      await waitFor(element(by.id('ai-analysis-result'))).toBeVisible().withTimeout(5000);
      await element(by.id('accept-ai-suggestion-button')).tap();
    }

    // 6. Generate report
    await element(by.id('generate-report-button')).tap();
    await waitFor(element(by.text('Report Generated'))).toBeVisible().withTimeout(30000);

    // 7. Verify report
    await expect(element(by.id('download-report-button'))).toBeVisible();
    await element(by.id('download-report-button')).tap();
    
    // Verify file downloaded (platform-specific)
    await expect(element(by.text('Report downloaded successfully'))).toBeVisible();
  });
});
```

### E2E Test Environments
- **Local**: Simulator/Emulator with mocked services
- **Staging**: Real AWS staging environment
- **Production**: Smoke tests only (non-destructive)

### Running E2E Tests
```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android

# Build and test
detox build -c ios.sim.debug
detox test -c ios.sim.debug

# Run specific test
detox test -c ios.sim.debug e2e/complete-inspection.e2e.ts
```

---

## API Testing

### Test Categories

#### 1. Authentication Tests
```typescript
describe('Authentication API', () => {
  it('POST /auth/signup - valid user', async () => {
    const response = await request(API_BASE_URL)
      .post('/api/auth/signup')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Smith',
        membershipTier: 'professional'
      })
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body.emailVerified).toBe(false);
  });

  it('POST /auth/signin - valid credentials', async () => {
    const response = await request(API_BASE_URL)
      .post('/api/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.expiresIn).toBe(3600);
  });
});
```

#### 2. Marketplace API Tests
```typescript
describe('Marketplace API', () => {
  describe('GET /api/marketplace/products', () => {
    it('should return product catalog', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/marketplace/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(10); // 10 individual products
      expect(response.body.bundles).toHaveLength(3);   // 3 bundles
      
      // Verify product structure
      expect(response.body.products[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        category: expect.stringMatching(/residential|commercial/),
        itemCount: expect.any(Number),
        isPurchased: expect.any(Boolean)
      });
    });
  });

  describe('POST /api/marketplace/purchase/:productId', () => {
    it('should purchase product with Stripe', async () => {
      const response = await request(API_BASE_URL)
        .post('/api/marketplace/purchase/product-multifamily')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'stripe',
          paymentMethodId: 'pm_test_123'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        purchaseId: expect.any(String),
        productId: 'product-multifamily',
        amount: 19.99,
        status: 'completed',
        downloadUrl: expect.stringContaining('/api/marketplace/download/')
      });
    });

    it('should reject duplicate purchase', async () => {
      // Purchase once
      await request(API_BASE_URL)
        .post('/api/marketplace/purchase/product-multifamily')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentMethod: 'stripe', paymentMethodId: 'pm_test_123' })
        .expect(201);

      // Attempt duplicate
      const response = await request(API_BASE_URL)
        .post('/api/marketplace/purchase/product-multifamily')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ paymentMethod: 'stripe', paymentMethodId: 'pm_test_123' })
        .expect(409);

      expect(response.body.error.code).toBe('ALREADY_PURCHASED');
    });
  });
});
```

### API Test Coverage
- ✅ All CRUD operations
- ✅ Authentication & authorization
- ✅ Rate limiting
- ✅ Error responses (4xx, 5xx)
- ✅ Pagination
- ✅ Filtering & sorting
- ✅ Input validation
- ✅ Payment flows (Stripe, Apple, Google)

### Running API Tests
```bash
# Run all API tests
npm run test:api

# Run specific test suite
npm run test:api -- marketplace

# With coverage
npm run test:api:coverage
```

---

## Mobile App Testing

### Test Scenarios

#### 1. Offline Functionality
```typescript
describe('Offline Photo Capture', () => {
  beforeEach(async () => {
    // Disable network
    await device.setNetworkConditions({ offline: true });
  });

  afterEach(async () => {
    // Re-enable network
    await device.setNetworkConditions({ offline: false });
  });

  it('should queue photos when offline', async () => {
    await element(by.id('capture-photo-button')).tap();
    await element(by.id('save-offline-button')).tap();

    // Verify queued
    await element(by.id('sync-queue-button')).tap();
    await expect(element(by.text('1 photo pending'))).toBeVisible();

    // Re-enable network and sync
    await device.setNetworkConditions({ offline: false });
    await element(by.id('sync-now-button')).tap();
    
    // Verify uploaded
    await waitFor(element(by.text('0 photos pending'))).toBeVisible().withTimeout(10000);
  });
});
```

#### 2. Photo Upload Performance
```typescript
describe('Photo Upload Performance', () => {
  it('should upload 20 photos in under 60 seconds', async () => {
    const startTime = Date.now();

    for (let i = 0; i < 20; i++) {
      await element(by.id('capture-photo-button')).tap();
      await element(by.id('save-photo-button')).tap();
    }

    await waitFor(element(by.text('All photos uploaded'))).toBeVisible().withTimeout(60000);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(60000); // 60 seconds
  });
});
```

#### 3. Memory Management
```typescript
describe('Memory Leak Detection', () => {
  it('should not leak memory when loading large CSV', async () => {
    const initialMemory = await device.getMemoryUsage();

    // Load Single_Family.csv (33,432 items)
    await element(by.id('load-premium-data-button')).tap();
    await waitFor(element(by.text('Data loaded'))).toBeVisible().withTimeout(30000);

    const afterLoadMemory = await device.getMemoryUsage();
    const memoryIncrease = afterLoadMemory - initialMemory;

    // Should use less than 50 MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

    // Navigate away and back
    await element(by.id('home-button')).tap();
    await element(by.id('workflow-editor-button')).tap();

    const finalMemory = await device.getMemoryUsage();
    const leak = finalMemory - afterLoadMemory;

    // Memory should not grow significantly
    expect(leak).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Device Testing Matrix

| Platform | Devices | OS Versions | Priority |
|----------|---------|-------------|----------|
| iOS | iPhone 15 Pro, iPhone 13, iPhone SE | iOS 17, 16, 15 | High |
| Android | Samsung Galaxy S23, Pixel 7, OnePlus 10 | Android 14, 13, 12 | High |
| Tablets | iPad Pro, Samsung Tab S8 | Latest | Medium |

---

## AWS Services Testing

### S3 Testing
```typescript
describe('S3 Photo Storage', () => {
  it('should upload photo with correct metadata', async () => {
    const photoBuffer = fs.readFileSync('test-photo.jpg');
    const metadata = {
      inspectionId: 'inspection-123',
      userId: 'user-456',
      timestamp: new Date().toISOString()
    };

    const result = await s3Service.uploadPhoto(photoBuffer, metadata);

    expect(result).toMatchObject({
      originalUrl: expect.stringContaining('cloudfront.net'),
      thumbnailUrl: expect.stringContaining('cloudfront.net')
    });

    // Verify S3 object metadata
    const s3Object = await s3.headObject({
      Bucket: 'smart-inspector-production',
      Key: result.s3Key
    });

    expect(s3Object.Metadata).toMatchObject({
      inspectionid: 'inspection-123',
      userid: 'user-456'
    });
  });

  it('should apply lifecycle policy to old photos', async () => {
    // Create photo with 91-day-old timestamp
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 91);

    await s3Service.uploadPhoto(photoBuffer, {
      timestamp: oldDate.toISOString()
    });

    // Verify storage class changed
    await sleep(24 * 60 * 60 * 1000); // Wait 24 hours (mocked)
    const object = await s3.headObject({ Bucket, Key });
    
    expect(object.StorageClass).toBe('INTELLIGENT_TIERING');
  });
});
```

### Cognito Testing
```typescript
describe('Cognito Authentication', () => {
  it('should create user with correct group assignment', async () => {
    const result = await cognitoService.createUser({
      email: 'inspector@example.com',
      membershipTier: 'professional',
      role: 'team-leader'
    });

    // Verify user in correct group
    const groups = await cognito.adminListGroupsForUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: result.username
    });

    expect(groups.Groups).toContainEqual(
      expect.objectContaining({ GroupName: 'team-leader' })
    );
  });

  it('should enforce MFA for enterprise users', async () => {
    const user = await cognitoService.createUser({
      email: 'enterprise@example.com',
      membershipTier: 'enterprise'
    });

    const userAttributes = await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.username
    });

    expect(userAttributes.MFAOptions).toBeDefined();
  });
});
```

### Lambda Testing
```typescript
describe('Lambda Triggers', () => {
  it('should trigger PostConfirmation on email verify', async () => {
    const event = {
      triggerSource: 'PostConfirmation_ConfirmSignUp',
      request: {
        userAttributes: {
          email: 'test@example.com',
          'custom:membershipTier': 'professional'
        }
      }
    };

    const result = await lambdaHandler(event);

    // Verify side effects
    const dbUser = await db.users.findByEmail('test@example.com');
    expect(dbUser).toBeTruthy();
    expect(dbUser.emailVerified).toBe(true);
  });
});
```

### ElastiCache Redis Testing
```typescript
describe('Redis Caching', () => {
  it('should cache AI photo analysis', async () => {
    const photoHash = 'abc123def456';
    const aiResult = {
      component: 'Water Heater',
      condition: 'Monitor',
      confidence: 0.95
    };

    // Cache result
    await redis.set(`ai:${photoHash}`, JSON.stringify(aiResult), 'EX', 3600);

    // Retrieve from cache
    const cached = await redis.get(`ai:${photoHash}`);
    expect(JSON.parse(cached)).toEqual(aiResult);

    // Verify TTL
    const ttl = await redis.ttl(`ai:${photoHash}`);
    expect(ttl).toBeGreaterThan(3500);
  });

  it('should invalidate cache on user logout', async () => {
    const userId = 'user-123';
    await redis.set(`session:${userId}`, 'active', 'EX', 3600);

    await authService.logout(userId);

    const session = await redis.get(`session:${userId}`);
    expect(session).toBeNull();
  });
});
```

---

## AI Integration Testing

### OpenAI API Testing

#### 1. Photo Analysis Accuracy
```typescript
describe('AI Photo Analysis', () => {
  const testPhotos = [
    { path: 'fixtures/water-heater.jpg', expected: { component: 'Water Heater', confidence: 0.95 } },
    { path: 'fixtures/area-drain.jpg', expected: { component: 'Area Drain', confidence: 0.89 } },
    { path: 'fixtures/roof-shingles.jpg', expected: { component: 'Roof Shingles', confidence: 0.92 } }
  ];

  it.each(testPhotos)('should correctly identify $expected.component', async ({ path, expected }) => {
    const photoBuffer = fs.readFileSync(path);
    const result = await aiService.analyzePhoto(photoBuffer);

    expect(result.component).toBe(expected.component);
    expect(result.confidence).toBeGreaterThanOrEqual(expected.confidence);
  });
});
```

#### 2. AI Caching Performance
```typescript
describe('AI Caching Strategy', () => {
  it('should return cached result for identical photo', async () => {
    const photoBuffer = fs.readFileSync('fixtures/water-heater.jpg');

    // First call (no cache)
    const start1 = Date.now();
    const result1 = await aiService.analyzePhoto(photoBuffer);
    const duration1 = Date.now() - start1;

    // Second call (cached)
    const start2 = Date.now();
    const result2 = await aiService.analyzePhoto(photoBuffer);
    const duration2 = Date.now() - start2;

    expect(result1).toEqual(result2);
    expect(duration2).toBeLessThan(duration1 * 0.1); // 10x faster from cache
  });

  it('should achieve 40-60% cache hit rate', async () => {
    const testPhotos = generateTestPhotos(100); // Mix of duplicates and unique
    let cacheHits = 0;

    for (const photo of testPhotos) {
      const result = await aiService.analyzePhoto(photo);
      if (result.source === 'cache') cacheHits++;
    }

    const hitRate = (cacheHits / testPhotos.length) * 100;
    expect(hitRate).toBeGreaterThanOrEqual(40);
    expect(hitRate).toBeLessThanOrEqual(60);
  });
});
```

#### 3. AI Cost Tracking
```typescript
describe('AI Cost Tracking', () => {
  it('should track per-user AI usage', async () => {
    const userId = 'user-123';
    const userTier = 'ai-standard'; // 200 analyses/month

    for (let i = 0; i < 10; i++) {
      await aiService.analyzePhoto(randomPhoto(), { userId });
    }

    const usage = await aiService.getUsage(userId);
    expect(usage.count).toBe(10);
    expect(usage.remaining).toBe(190);
    expect(usage.cost).toBeCloseTo(0.20, 2); // 10 * $0.02
  });

  it('should reject analysis when quota exceeded', async () => {
    const userId = 'user-456';
    
    // Use 200 analyses (quota)
    for (let i = 0; i < 200; i++) {
      await aiService.analyzePhoto(randomPhoto(), { userId });
    }

    // 201st should fail
    await expect(
      aiService.analyzePhoto(randomPhoto(), { userId })
    ).rejects.toThrow('AI quota exceeded');
  });
});
```

### AI Fallback Testing
```typescript
describe('AI Fallback Mechanisms', () => {
  it('should fallback to manual workflow when OpenAI down', async () => {
    // Mock OpenAI API failure
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(503, { error: 'Service Unavailable' });

    const result = await aiService.analyzePhoto(photoBuffer);

    expect(result.aiAvailable).toBe(false);
    expect(result.message).toContain('AI temporarily unavailable');
    expect(result.fallbackWorkflow).toBe('manual');
  });

  it('should retry with exponential backoff', async () => {
    let attempts = 0;
    
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .times(3)
      .reply(500, () => {
        attempts++;
        return { error: 'Internal Server Error' };
      });

    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(200, { /* success response */ });

    const result = await aiService.analyzePhoto(photoBuffer);

    expect(attempts).toBe(3); // Retried 3 times before success
    expect(result.aiAvailable).toBe(true);
  });
});
```

---

## Performance Testing

### Load Testing Tools
- **Backend**: Apache JMeter or Artillery
- **Mobile**: Xcode Instruments (iOS), Android Profiler

### Performance Benchmarks

#### 1. API Response Times
| Endpoint | Target | Acceptable | Failure |
|----------|---------|-----------|---------|
| GET /api/inspections | <100ms | <200ms | >500ms |
| POST /api/photos/upload | <500ms | <1s | >3s |
| POST /api/ai/analyze-photo | <3s | <5s | >10s |
| POST /api/reports/generate | <5s | <10s | >30s |
| GET /api/marketplace/products | <100ms | <200ms | >500ms |

#### 2. Mobile App Performance
| Metric | Target | Acceptable | Failure |
|--------|---------|-----------|---------|
| App launch time | <2s | <3s | >5s |
| Photo capture latency | <100ms | <200ms | >500ms |
| CSV load time (33,432 items) | <5s | <10s | >20s |
| Scroll FPS (workflow list) | 60 FPS | 50 FPS | <30 FPS |
| Memory usage | <100 MB | <150 MB | >200 MB |

### Load Testing Scenarios

#### Scenario 1: Concurrent User Load
```yaml
# artillery-config.yml
config:
  target: 'https://api.smartinspector.pro'
  phases:
    - duration: 60
      arrivalRate: 10      # 10 users/sec for 1 min (600 users)
    - duration: 120
      arrivalRate: 50      # 50 users/sec for 2 min (6,000 users)
    - duration: 60
      arrivalRate: 100     # 100 users/sec for 1 min (6,000 users)
scenarios:
  - name: "Full Inspection Flow"
    flow:
      - post:
          url: "/api/auth/signin"
          json:
            email: "{{ $randomEmail() }}"
            password: "TestPass123!"
          capture:
            json: "$.accessToken"
            as: "token"
      - post:
          url: "/api/inspections"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            propertyAddress: "{{ $randomStreet() }}"
            scheduledDate: "{{ $now() }}"
      - post:
          url: "/api/photos/upload"
          headers:
            Authorization: "Bearer {{ token }}"
          formData:
            file: "@fixtures/test-photo.jpg"
```

**Run Load Test**:
```bash
npm run test:load
# OR
artillery run artillery-config.yml --output report.json
artillery report report.json
```

#### Scenario 2: Database Query Performance
```typescript
describe('Database Performance', () => {
  it('should query 1000 inspections in under 100ms', async () => {
    const start = Date.now();
    
    const inspections = await db.inspections.findAll({
      where: { userId: 'user-123' },
      limit: 1000,
      include: ['records', 'photos']
    });
    
    const duration = Date.now() - start;
    
    expect(inspections).toHaveLength(1000);
    expect(duration).toBeLessThan(100);
  });

  it('should handle 10,000 concurrent writes', async () => {
    const writes = [];
    
    for (let i = 0; i < 10000; i++) {
      writes.push(
        db.inspections.create({
          userId: `user-${i % 100}`,
          propertyAddress: `${i} Test St`
        })
      );
    }
    
    const start = Date.now();
    await Promise.all(writes);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(30000); // 30 seconds
  });
});
```

### Running Performance Tests
```bash
# Backend load testing
npm run test:load

# Mobile profiling (iOS)
open ios/SmartInspectorPro.xcworkspace
# Run with Instruments (Time Profiler, Allocations)

# Mobile profiling (Android)
npm run android
# Open Android Studio → Profiler
```

---

## Security Testing

### Security Test Categories

#### 1. Authentication & Authorization
```typescript
describe('Security: Authentication', () => {
  it('should reject requests without valid JWT', async () => {
    const response = await request(API_BASE_URL)
      .get('/api/inspections')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject expired JWT tokens', async () => {
    const expiredToken = generateJWT({ userId: 'user-123' }, { expiresIn: '-1h' });

    const response = await request(API_BASE_URL)
      .get('/api/inspections')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('should enforce RBAC (team-leader can view, assistant cannot edit)', async () => {
    const assistantToken = await getAuthToken({ role: 'assistant-inspector' });

    const response = await request(API_BASE_URL)
      .put('/api/inspections/inspection-123')
      .set('Authorization', `Bearer ${assistantToken}`)
      .send({ status: 'completed' })
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
```

#### 2. Input Validation & SQL Injection
```typescript
describe('Security: Input Validation', () => {
  it('should reject SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE inspections; --";

    const response = await request(API_BASE_URL)
      .post('/api/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ propertyAddress: maliciousInput })
      .expect(400);

    // Verify table still exists
    const count = await db.inspections.count();
    expect(count).toBeGreaterThan(0);
  });

  it('should sanitize XSS attempts in comments', async () => {
    const xssPayload = '<script>alert("XSS")</script>';

    const response = await request(API_BASE_URL)
      .post('/api/inspection-records')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ comment: xssPayload })
      .expect(201);

    expect(response.body.comment).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });
});
```

#### 3. Rate Limiting
```typescript
describe('Security: Rate Limiting', () => {
  it('should enforce rate limits (100 req/min)', async () => {
    const requests = [];

    for (let i = 0; i < 101; i++) {
      requests.push(
        request(API_BASE_URL)
          .get('/api/inspections')
          .set('Authorization', `Bearer ${authToken}`)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

#### 4. Data Encryption
```typescript
describe('Security: Data Encryption', () => {
  it('should encrypt sensitive data in database', async () => {
    await db.users.create({
      email: 'test@example.com',
      licenseNumber: 'LIC-12345',
      ssn: '123-45-6789' // Should be encrypted
    });

    // Query raw database
    const raw = await db.query('SELECT ssn FROM users WHERE email = ?', ['test@example.com']);
    
    // Verify encrypted (not plaintext)
    expect(raw[0].ssn).not.toBe('123-45-6789');
    expect(raw[0].ssn).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64 pattern
  });

  it('should use HTTPS for all API calls', async () => {
    const response = await request('http://api.smartinspector.pro') // HTTP, not HTTPS
      .get('/api/inspections')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(301); // Redirect to HTTPS
    expect(response.headers.location).toMatch(/^https:/);
  });
});
```

### Security Scanning Tools
- **SAST**: SonarQube, ESLint security plugins
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: Snyk, npm audit
- **Secret Detection**: GitGuardian, TruffleHog

### Running Security Tests
```bash
# Dependency vulnerabilities
npm audit

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://api.smartinspector.pro

# Secret scanning
npx @gitguardian/ggshield secret scan repo .
```

---

## Accessibility Testing

### WCAG 2.1 Compliance Goals
- **Level AA**: Minimum requirement (target)
- **Level AAA**: Stretch goal for critical features

### Accessibility Test Cases

#### 1. Screen Reader Compatibility
```typescript
describe('Accessibility: Screen Reader', () => {
  it('should have accessible labels on all buttons', async () => {
    await element(by.id('capture-photo-button')).tap();
    
    const label = await element(by.id('capture-photo-button')).getAttributes();
    expect(label.accessibilityLabel).toBe('Capture photo');
    expect(label.accessible).toBe(true);
  });

  it('should announce AI analysis results', async () => {
    await element(by.id('capture-photo-button')).tap();
    await waitFor(element(by.id('ai-analysis-result'))).toBeVisible();

    const announcement = await device.getAccessibilityAnnouncement();
    expect(announcement).toContain('AI analysis complete. Component: Water Heater');
  });
});
```

#### 2. Color Contrast
```typescript
describe('Accessibility: Color Contrast', () => {
  it('should meet WCAG AA contrast ratio (4.5:1)', () => {
    const textColor = '#333333';
    const backgroundColor = '#FFFFFF';

    const contrast = calculateContrastRatio(textColor, backgroundColor);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  it('should have alternative for color-only indicators', async () => {
    // Condition indicators should not rely on color alone
    await expect(element(by.text('Safety Hazard'))).toBeVisible(); // Text label
    await expect(element(by.id('safety-hazard-icon'))).toBeVisible(); // Icon
  });
});
```

#### 3. Keyboard Navigation (Web)
```typescript
describe('Accessibility: Keyboard Navigation', () => {
  it('should allow tab navigation through all interactive elements', async () => {
    await page.goto('https://app.smartinspector.pro');
    
    await page.keyboard.press('Tab'); // First button
    expect(await page.evaluate(() => document.activeElement.id)).toBe('create-inspection-button');

    await page.keyboard.press('Tab'); // Second button
    expect(await page.evaluate(() => document.activeElement.id)).toBe('view-inspections-button');
  });

  it('should support Enter key to activate buttons', async () => {
    await page.focus('#create-inspection-button');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/.*\/inspections\/new/);
  });
});
```

### Accessibility Testing Tools
- **React Native**: react-native-accessibility-engine
- **iOS**: Xcode Accessibility Inspector
- **Android**: Android Accessibility Scanner
- **Web**: axe-core, Lighthouse

---

## Internationalization Testing

### i18n Test Cases

#### 1. Language Switching
```typescript
describe('Internationalization: Language Switching', () => {
  it('should switch UI language', async () => {
    await element(by.id('settings-button')).tap();
    await element(by.id('language-selector')).tap();
    await element(by.text('Español (México)')).tap();

    await expect(element(by.text('Crear Inspección'))).toBeVisible();
    await expect(element(by.text('Create Inspection'))).not.toBeVisible();
  });

  it('should persist language preference', async () => {
    await changeLanguage('es-MX');
    await device.reloadReactNative();

    await expect(element(by.text('Crear Inspección'))).toBeVisible();
  });
});
```

#### 2. Date/Time Formatting
```typescript
describe('Internationalization: Date Formatting', () => {
  it('should format dates according to locale', async () => {
    const date = new Date('2025-10-17T10:00:00Z');

    // US format
    expect(formatDate(date, 'en-US')).toBe('10/17/2025');

    // EU format
    expect(formatDate(date, 'de-DE')).toBe('17.10.2025');

    // ISO format
    expect(formatDate(date, 'ja-JP')).toBe('2025/10/17');
  });
});
```

#### 3. Currency & Measurements
```typescript
describe('Internationalization: Units', () => {
  it('should convert measurements (imperial ↔ metric)', () => {
    // US: 1,200 sq ft
    expect(formatArea(1200, 'imperial')).toBe('1,200 sq ft');

    // EU: 111.5 m²
    expect(formatArea(1200, 'metric')).toBe('111.5 m²');
  });

  it('should format currency by locale', () => {
    expect(formatCurrency(19.99, 'USD', 'en-US')).toBe('$19.99');
    expect(formatCurrency(19.99, 'EUR', 'de-DE')).toBe('19,99 €');
    expect(formatCurrency(19.99, 'MXN', 'es-MX')).toBe('$19.99');
  });
});
```

#### 4. RTL Language Support
```typescript
describe('Internationalization: RTL', () => {
  it('should render Arabic correctly (RTL)', async () => {
    await changeLanguage('ar-SA');

    const layoutDirection = await element(by.id('main-container')).getAttributes();
    expect(layoutDirection.direction).toBe('rtl');

    // Verify text alignment
    const textAlign = await element(by.id('property-address')).getStyle('textAlign');
    expect(textAlign).toBe('right');
  });
});
```

---

## Test Data Management

### Test Data Strategy

#### 1. Fixtures
```typescript
// __tests__/fixtures/inspections.ts
export const sampleInspections = [
  {
    id: 'inspection-123',
    propertyAddress: '123 Main St, Austin, TX 78701',
    scheduledDate: '2025-10-25T10:00:00Z',
    status: 'scheduled',
    clientName: 'Jane Doe',
    inspectionType: 'pre-purchase',
    recordCount: 0,
    photoCount: 0
  },
  // ... more fixtures
];

export const sampleInspectionRecords = [
  {
    section: 'Exterior Grounds',
    system: 'Drainage',
    component: 'Area Drain',
    material: 'Concrete',
    condition: 'Monitor',
    comment: 'Minor debris noted; monitor and clean as needed.'
  },
  // ... more records
];
```

#### 2. Factory Functions
```typescript
// __tests__/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export const createUserFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  membershipTier: 'professional',
  createdAt: faker.date.past(),
  ...overrides
});

// Usage
const testUser = createUserFactory({ membershipTier: 'enterprise' });
```

#### 3. Database Seeding
```typescript
// __tests__/helpers/seed.ts
export async function seedTestDatabase() {
  // Clear existing data
  await db.inspections.destroy({ where: {} });
  await db.users.destroy({ where: {} });

  // Create test users
  const users = await Promise.all([
    db.users.create(createUserFactory({ email: 'test1@example.com' })),
    db.users.create(createUserFactory({ email: 'test2@example.com', membershipTier: 'enterprise' }))
  ]);

  // Create test inspections
  for (const user of users) {
    await Promise.all([
      db.inspections.create({ userId: user.id, propertyAddress: '123 Main St' }),
      db.inspections.create({ userId: user.id, propertyAddress: '456 Oak Ave' })
    ]);
  }

  return { users };
}
```

### Test Data Cleanup
```typescript
// __tests__/helpers/cleanup.ts
export async function cleanupTestData() {
  // Delete test data
  await db.inspections.destroy({ where: { propertyAddress: { [Op.like]: '%Test St%' } } });
  await db.users.destroy({ where: { email: { [Op.like]: '%@test.example.com' } } });

  // Delete test S3 objects
  const objects = await s3.listObjects({ Bucket: TEST_BUCKET, Prefix: 'test/' });
  if (objects.Contents) {
    await s3.deleteObjects({
      Bucket: TEST_BUCKET,
      Delete: { Objects: objects.Contents.map(o => ({ Key: o.Key })) }
    });
  }

  // Clear Redis test keys
  const keys = await redis.keys('test:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

## CI/CD Testing Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup iOS simulator
        run: |
          xcrun simctl boot "iPhone 15 Pro" || true
      
      - name: Build for iOS
        run: detox build -c ios.sim.release
      
      - name: Run E2E tests
        run: detox test -c ios.sim.release --headless

  e2e-tests-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Start emulator
        run: |
          $ANDROID_HOME/emulator/emulator -avd Pixel_4_API_30 -no-window -no-audio &
      
      - name: Build for Android
        run: detox build -c android.emu.release
      
      - name: Run E2E tests
        run: detox test -c android.emu.release --headless

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --production
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Artillery
        run: npm install -g artillery
      
      - name: Run load tests
        run: artillery run artillery-config.yml --output report.json
      
      - name: Generate report
        run: artillery report report.json
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: report.html
```

### Test Execution Order
1. **Unit Tests** (2-5 minutes) - Run on every commit
2. **Integration Tests** (5-10 minutes) - Run on every commit
3. **Security Scan** (3-5 minutes) - Run on every commit
4. **E2E Tests** (15-30 minutes) - Run on PR to main
5. **Performance Tests** (10-20 minutes) - Run on merge to main

---

## Bug Reporting & Tracking

### Bug Report Template

```markdown
## Bug Report

**Title**: [Short description]

**Environment**:
- Platform: iOS / Android / Web
- OS Version: [e.g., iOS 17.0, Android 13]
- App Version: [e.g., 1.0.0-beta]
- Device: [e.g., iPhone 15 Pro, Samsung Galaxy S23]

**Priority**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**:
[What you expected to happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[If applicable, add screenshots]

**Logs**:
```
[Paste relevant logs]
```

**Additional Context**:
[Any other context about the problem]
```

### Bug Severity Levels

| Level | Definition | SLA |
|-------|------------|-----|
| **Critical** | App crash, data loss, security vulnerability | Fix within 24 hours |
| **High** | Major feature broken, impacts multiple users | Fix within 3 days |
| **Medium** | Minor feature broken, workaround available | Fix within 1 week |
| **Low** | Cosmetic issue, doesn't impact functionality | Fix in next release |

### Test Result Tracking
```typescript
// test-results.json
{
  "timestamp": "2025-10-17T10:00:00Z",
  "version": "0.5.0-beta",
  "summary": {
    "total": 1250,
    "passed": 1198,
    "failed": 12,
    "skipped": 40,
    "coverage": 82.5
  },
  "failures": [
    {
      "test": "API: Marketplace purchase with Apple IAP",
      "file": "__tests__/integration/marketplace.test.ts",
      "line": 145,
      "error": "Receipt validation failed",
      "assignee": "dev-team-backend"
    }
  ]
}
```

---

## Testing Metrics & KPIs

### Code Coverage Targets
- **Overall**: 80%+
- **Critical paths** (auth, payments): 95%+
- **Business logic**: 90%+
- **UI components**: 70%+

### Test Execution Metrics
- **Unit tests**: <5 minutes total
- **Integration tests**: <10 minutes total
- **E2E tests**: <30 minutes total
- **Full pipeline**: <45 minutes

### Quality Gates (CI/CD)
- ✅ **Pass**: All tests pass, coverage ≥80%
- ⚠️ **Warning**: Coverage 70-79%, <5 test failures
- ❌ **Fail**: Coverage <70%, ≥5 test failures, any critical bug

---

## Appendix

### Testing Resources
- **Jest Documentation**: https://jestjs.io/
- **React Native Testing Library**: https://callstack.github.io/react-native-testing-library/
- **Detox Documentation**: https://wix.github.io/Detox/
- **Artillery Load Testing**: https://www.artillery.io/docs

### Testing Cheat Sheet
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- inspections.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run E2E tests (iOS)
detox test -c ios.sim.debug

# Run load tests
artillery run artillery-config.yml

# Run security scan
npm audit
snyk test
```

---

*Last Updated: October 17, 2025*  
*Version: 1.0.0*  
*Next Review: Pre-Development Phase (Week 1)*
