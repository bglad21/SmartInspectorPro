# Smart Inspector Pro - API Documentation

**Document Version:** 1.1.0  
**Last Updated:** October 17, 2025  
**API Version:** v1  
**Status:** Specification Phase

## Overview
**API Base URL:** `https://api.smartinspector.pro/v1`  
**API Type:** GraphQL (AWS AppSync) with REST fallback  
**Authentication:** AWS Cognito JWT tokens  
**Data Format:** JSON  
**Rate Limiting:** Tier-based (see Rate Limits section)

**Version History:**
- **1.1.0** (Oct 17, 2025): Added Marketplace API (12 endpoints), payment integrations
- **1.0.0** (Oct 16, 2025): Initial API specification (GraphQL + REST)

---

## Table of Contents
1. [Authentication](#authentication)
2. [GraphQL API](#graphql-api)
3. [REST API Endpoints](#rest-api-endpoints)
4. [Marketplace API](#marketplace-api)
5. [Internationalization API](#internationalization-api)
6. [Rate Limits](#rate-limits)
7. [Error Handling](#error-handling)
8. [Webhooks](#webhooks)
9. [SDK & Client Libraries](#sdk--client-libraries)

---

## Authentication

### AWS Cognito Integration
All API requests require a valid JWT token from AWS Cognito User Pool.

**Cognito User Pool:** `us-east-1_HgZUMoxyZ`  
**Identity Pool:** (For direct S3 uploads)

### Authentication Flow

#### 1. Sign Up
```graphql
mutation SignUp {
  signUp(input: {
    email: "inspector@example.com"
    password: "SecurePass123!"
    firstName: "John"
    lastName: "Smith"
    businessName: "Smith Inspections LLC"
    phone: "+1-555-0100"
    membershipTier: "professional"
  }) {
    userId
    email
    emailVerified
  }
}
```

**REST Equivalent:**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "inspector@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "businessName": "Smith Inspections LLC",
  "phone": "+1-555-0100",
  "membershipTier": "professional"
}

Response:
{
  "userId": "abc123...",
  "email": "inspector@example.com",
  "emailVerified": false,
  "verificationCodeSent": true
}
```

#### 2. Verify Email
```graphql
mutation VerifyEmail {
  verifyEmail(input: {
    email: "inspector@example.com"
    code: "123456"
  }) {
    success
    message
  }
}
```

#### 3. Sign In
```graphql
mutation SignIn {
  signIn(input: {
    email: "inspector@example.com"
    password: "SecurePass123!"
  }) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      email
      firstName
      lastName
      membershipTier
    }
  }
}
```

**REST Equivalent:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "inspector@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "accessToken": "eyJraWQiOiJ...",
  "refreshToken": "eyJjdHkiOiJ...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "user": {
    "id": "abc123...",
    "email": "inspector@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "membershipTier": "professional"
  }
}
```

#### 4. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJjdHkiOiJ..."
}

Response:
{
  "accessToken": "eyJraWQiOiJ...",
  "expiresIn": 3600
}
```

### Using JWT Tokens
Include the access token in all subsequent requests:

```http
Authorization: Bearer eyJraWQiOiJ...
```

---

## GraphQL API

### Schema Overview
```graphql
# Root Types
type Query { ... }
type Mutation { ... }
type Subscription { ... }

# Core Types
type User { ... }
type Inspection { ... }
type InspectionRecord { ... }
type Photo { ... }
type Workflow { ... }
type Team { ... }
```

### Example Queries

#### Get User Profile
```graphql
query GetUserProfile {
  me {
    id
    email
    firstName
    lastName
    businessName
    phone
    membershipTier
    localeSettings {
      preferredLanguage
      dateFormat
      timeFormat
      temperatureUnit
      measurementSystem
      currency
      timezone
    }
    teams {
      id
      name
      role
    }
  }
}
```

#### Get Inspections
```graphql
query GetInspections($status: InspectionStatus, $limit: Int, $offset: Int) {
  inspections(status: $status, limit: $limit, offset: $offset) {
    id
    propertyAddress
    scheduledDate
    status
    clientName
    inspector {
      id
      firstName
      lastName
    }
    recordCount
    photoCount
    createdAt
  }
}

# Variables
{
  "status": "IN_PROGRESS",
  "limit": 20,
  "offset": 0
}
```

#### Get Inspection Details
```graphql
query GetInspectionDetails($inspectionId: ID!) {
  inspection(id: $inspectionId) {
    id
    propertyAddress
    propertyDetails
    scheduledDate
    status
    clientName
    clientPhone
    clientEmail
    realtorName
    realtorPhone
    realtorEmail
    workflow {
      id
      name
    }
    records {
      id
      section
      system
      location
      component
      material
      condition
      comment
      photos {
        id
        thumbnailUrl
        originalUrl
      }
      aiPrediction {
        component
        material
        condition
        confidence
      }
    }
    inspector {
      id
      firstName
      lastName
      licenseNumber
    }
  }
}
```

### Example Mutations

#### Create Inspection
```graphql
mutation CreateInspection($input: CreateInspectionInput!) {
  createInspection(input: $input) {
    id
    propertyAddress
    scheduledDate
    status
    workflowId
  }
}

# Variables
{
  "input": {
    "propertyAddress": "123 Main St, Austin, TX 78701",
    "propertyDetails": {
      "type": "single-family",
      "yearBuilt": 1995,
      "squareFeet": 2400,
      "bedrooms": 4,
      "bathrooms": 2.5
    },
    "clientName": "Jane Doe",
    "clientPhone": "+1-555-0200",
    "clientEmail": "jane@example.com",
    "scheduledDate": "2025-10-25T10:00:00Z",
    "inspectionType": "pre-purchase",
    "workflowId": "workflow-123"
  }
}
```

#### Add Inspection Record
```graphql
mutation AddInspectionRecord($input: AddRecordInput!) {
  addInspectionRecord(input: $input) {
    id
    section
    system
    component
    material
    condition
    comment
    photos {
      id
      thumbnailUrl
    }
  }
}

# Variables
{
  "input": {
    "inspectionId": "inspection-123",
    "section": "Exterior Grounds",
    "system": "Drainage",
    "location": "Front Yard",
    "component": "Area Drain",
    "material": "Concrete",
    "condition": "MONITOR",
    "comment": "Minor debris noted; monitor and clean as needed.",
    "customNotes": "Located near driveway entrance"
  }
}
```

#### Upload Photo with AI Analysis
```graphql
mutation UploadPhotoWithAI($input: UploadPhotoInput!) {
  uploadPhoto(input: $input) {
    id
    originalUrl
    thumbnailUrl
    watermarkedUrl
    metadata {
      gpsCoordinates {
        lat
        lng
        accuracy
      }
      deviceInfo {
        model
        os
        osVersion
      }
      timestamp
    }
    aiAnalysis {
      section
      system
      component
      material
      condition
      confidence
      tags
    }
  }
}

# Variables
{
  "input": {
    "inspectionId": "inspection-123",
    "recordId": "record-456",
    "file": <File>,  # Binary file upload
    "enableAIAnalysis": true,
    "applyWatermark": true
  }
}
```

### Real-Time Subscriptions

#### Subscribe to Inspection Updates
```graphql
subscription OnInspectionUpdated($inspectionId: ID!) {
  inspectionUpdated(inspectionId: $inspectionId) {
    id
    propertyAddress
    status
    recordCount
    photoCount
    updatedAt
    updatedBy {
      id
      firstName
      lastName
    }
  }
}
```

#### Subscribe to New Records
```graphql
subscription OnRecordAdded($inspectionId: ID!) {
  recordAdded(inspectionId: $inspectionId) {
    id
    section
    system
    component
    condition
    photos {
      thumbnailUrl
    }
    createdAt
    createdBy {
      id
      firstName
    }
  }
}
```

---

## REST API Endpoints

### Inspections

#### List Inspections
```http
GET /api/inspections?status=in-progress&limit=20&offset=0
Authorization: Bearer {token}

Response:
{
  "inspections": [
    {
      "id": "inspection-123",
      "propertyAddress": "123 Main St",
      "scheduledDate": "2025-10-25T10:00:00Z",
      "status": "in-progress",
      "clientName": "Jane Doe",
      "recordCount": 45,
      "photoCount": 127,
      "createdAt": "2025-10-20T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Inspection
```http
POST /api/inspections
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyAddress": "123 Main St, Austin, TX 78701",
  "propertyDetails": {
    "type": "single-family",
    "yearBuilt": 1995,
    "squareFeet": 2400
  },
  "clientName": "Jane Doe",
  "clientPhone": "+1-555-0200",
  "scheduledDate": "2025-10-25T10:00:00Z",
  "inspectionType": "pre-purchase",
  "workflowId": "workflow-123"
}

Response: 201 Created
{
  "id": "inspection-789",
  "propertyAddress": "123 Main St, Austin, TX 78701",
  "scheduledDate": "2025-10-25T10:00:00Z",
  "status": "scheduled",
  "createdAt": "2025-10-20T08:00:00Z"
}
```

### Photos

#### Upload Photo
```http
POST /api/photos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[binary data]
--boundary
Content-Disposition: form-data; name="inspectionId"

inspection-123
--boundary
Content-Disposition: form-data; name="recordId"

record-456
--boundary
Content-Disposition: form-data; name="enableAIAnalysis"

true
--boundary--

Response: 201 Created
{
  "id": "photo-999",
  "originalUrl": "https://cdn.smartinspector.pro/photos/original/abc123/photo-999.jpg",
  "thumbnailUrl": "https://cdn.smartinspector.pro/photos/thumbnails/abc123/photo-999.jpg",
  "watermarkedUrl": "https://cdn.smartinspector.pro/photos/watermarked/abc123/photo-999.jpg",
  "metadata": {
    "gpsCoordinates": { "lat": 30.2672, "lng": -97.7431 },
    "timestamp": "2025-10-25T10:15:00Z",
    "deviceInfo": { "model": "iPhone 15 Pro", "os": "iOS", "osVersion": "17.0" }
  },
  "aiAnalysis": {
    "section": "Exterior Grounds",
    "system": "Drainage",
    "component": "Area Drain",
    "material": "Concrete",
    "condition": "Monitor",
    "confidence": 0.89,
    "tags": ["drainage", "concrete", "minor-debris"]
  }
}
```

### AI Analysis

#### Analyze Photo
```http
POST /api/ai/analyze-photo
Authorization: Bearer {token}
Content-Type: application/json

{
  "photoId": "photo-999",
  "analysisType": "full"  # "full" | "component-only" | "condition-only"
}

Response:
{
  "photoId": "photo-999",
  "analysis": {
    "section": "Exterior Grounds",
    "system": "Drainage",
    "component": "Area Drain",
    "material": "Concrete",
    "condition": "Monitor",
    "confidence": {
      "section": 0.95,
      "system": 0.92,
      "component": 0.89,
      "material": 0.88,
      "condition": 0.85
    },
    "tags": ["drainage", "concrete", "minor-debris"],
    "suggestedComments": [
      "Minor debris noted; monitor and clean as needed.",
      "Functional at time of inspection.",
      "Recommend routine maintenance."
    ]
  },
  "cost": 0.02,  # AI analysis cost in USD
  "modelVersion": "gpt-4-vision-preview",
  "analyzedAt": "2025-10-25T10:16:00Z"
}
```

### Reports

#### Generate Report
```http
POST /api/reports/inspection-123/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "templateId": "template-456",
  "includePhotos": true,
  "photoSize": "medium",  # "small" | "medium" | "full"
  "includeAISummary": true,
  "language": "en-US"
}

Response:
{
  "reportId": "report-789",
  "status": "generating",
  "estimatedCompletionTime": "2025-10-25T10:20:00Z"
}

# Check status
GET /api/reports/report-789/status

Response (when complete):
{
  "reportId": "report-789",
  "status": "completed",
  "pdfUrl": "https://cdn.smartinspector.pro/reports/report-789.pdf",
  "fileSize": 15728640,  # bytes
  "pageCount": 42,
  "generatedAt": "2025-10-25T10:19:45Z"
}
```

---

## Marketplace API

### Overview
The Marketplace API enables users to browse, purchase, and download additional inspection data tables beyond the bundled free preview and premium membership tables. All marketplace purchases are one-time transactions (not subscriptions) and integrate with Stripe, Apple In-App Purchase (IAP), and Google Play Billing.

**Available Payment Methods:**
- **Stripe** (web and mobile)
- **Apple IAP** (iOS)
- **Google Play Billing** (Android)

**Data Table Types:**
- **Free/Preview:** `single_family_sample.csv` (2,504 items, bundled with app)
- **Premium:** `Single_Family.csv` (33,432 items, requires membership)
- **Marketplace:** 10+ additional residential and commercial tables ($12.99-$54.99)
- **Bundles:** Discounted packages of multiple tables ($99.99-$279.99)

---

### List Marketplace Products

Get all available marketplace products with optional filtering.

```http
GET /api/marketplace/products?category=residential&sort=price-asc
Authorization: Bearer {token}

Query Parameters:
- category (optional): "residential" | "commercial" | "bundles"
- sort (optional): "price-asc" | "price-desc" | "popular" | "newest"
- limit (optional): Number of results (default: 20)
- offset (optional): Pagination offset (default: 0)

Response: 200 OK
{
  "products": [
    {
      "id": "product-multifamily",
      "productType": "table",
      "name": "Multi-Family Properties",
      "category": "residential",
      "description": "Complete inspection coverage for duplexes, triplexes, and 4-plex units. Includes shared systems, individual unit inspections, and common area components.",
      "tableIds": ["table-multifamily"],
      "itemCount": 15000,
      "fileSize": 1572864,  // bytes (~1.5 MB)
      "price": 19.99,
      "currency": "USD",
      "discountPrice": null,
      "isPurchased": false,
      "features": [
        "Shared HVAC and plumbing systems",
        "Individual unit inspections",
        "Common area components",
        "Property management checklists"
      ],
      "targetAudience": "Investors, property managers, multi-family inspectors",
      "sampleData": {
        "previewUrl": "/api/marketplace/products/product-multifamily/preview",
        "sampleItemCount": 100
      },
      "popularity": 4.7,
      "reviewCount": 342,
      "createdAt": "2025-01-15T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    },
    {
      "id": "product-condos",
      "productType": "table",
      "name": "Condominiums & Townhomes",
      "category": "residential",
      "description": "Specialized for HOA properties with shared walls. Limited exterior access scenarios, HOA-maintained systems, and condo-specific components.",
      "tableIds": ["table-condos"],
      "itemCount": 8500,
      "fileSize": 917504,  // ~900 KB
      "price": 14.99,
      "currency": "USD",
      "discountPrice": null,
      "isPurchased": true,  // User has purchased this
      "features": [
        "HOA property coverage",
        "Shared wall inspections",
        "Limited exterior access",
        "Condo-specific components"
      ],
      "targetAudience": "Condo inspectors, urban markets",
      "sampleData": {
        "previewUrl": "/api/marketplace/products/product-condos/preview",
        "sampleItemCount": 100
      },
      "popularity": 4.5,
      "reviewCount": 287,
      "purchasedAt": "2025-10-10T14:30:00Z",
      "downloadedAt": "2025-10-10T14:31:15Z",
      "createdAt": "2025-01-15T00:00:00Z",
      "updatedAt": "2025-09-15T00:00:00Z"
    }
  ],
  "bundles": [
    {
      "id": "bundle-residential-complete",
      "productType": "bundle",
      "name": "Residential Complete Bundle",
      "category": "bundles",
      "description": "All 5 residential add-on tables in one discounted package. Save $30.97 (24% off) compared to individual purchases.",
      "tableIds": [
        "table-multifamily",
        "table-condos",
        "table-mobile-homes",
        "table-historic-homes",
        "table-luxury-properties"
      ],
      "totalItemCount": 60200,
      "totalFileSize": 6291456,  // ~6 MB
      "individualPrice": 130.96,
      "price": 99.99,
      "savings": 30.97,
      "discountPercentage": 24,
      "currency": "USD",
      "isPurchased": false,
      "includedProducts": [
        {
          "id": "product-multifamily",
          "name": "Multi-Family Properties",
          "price": 19.99
        },
        {
          "id": "product-condos",
          "name": "Condominiums & Townhomes",
          "price": 14.99
        },
        {
          "id": "product-mobile-homes",
          "name": "Mobile/Manufactured Homes",
          "price": 12.99
        },
        {
          "id": "product-historic-homes",
          "name": "Historic Homes (Pre-1940s)",
          "price": 24.99
        },
        {
          "id": "product-luxury",
          "name": "Luxury Properties",
          "price": 29.99
        }
      ],
      "features": [
        "All residential add-ons included",
        "60,200+ inspection items",
        "24% savings vs individual",
        "One-time payment",
        "Lifetime access"
      ],
      "popularity": 4.9,
      "reviewCount": 156,
      "createdAt": "2025-02-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 13,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### Get Product Details

Retrieve detailed information about a specific marketplace product.

```http
GET /api/marketplace/products/product-multifamily
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "product-multifamily",
  "productType": "table",
  "name": "Multi-Family Properties",
  "category": "residential",
  "description": "Complete inspection coverage for duplexes, triplexes, and 4-plex units. Includes shared systems, individual unit inspections, and common area components.",
  "longDescription": "This comprehensive data table is designed specifically for multi-family residential properties. It covers all aspects of duplex, triplex, and 4-plex inspections including shared mechanical systems, individual unit components, common areas, and property management checklists.\n\nKey coverage areas:\n• Shared HVAC systems and ductwork\n• Individual unit plumbing and electrical\n• Common area lighting and safety systems\n• Shared exterior components (roofs, siding, foundations)\n• Unit-specific interior finishes and fixtures\n• Property management compliance items",
  "tableIds": ["table-multifamily"],
  "itemCount": 15000,
  "fileSize": 1572864,
  "price": 19.99,
  "currency": "USD",
  "discountPrice": null,
  "isPurchased": false,
  "features": [
    "15,000+ inspection items",
    "Shared HVAC and plumbing systems",
    "Individual unit inspections",
    "Common area components",
    "Property management checklists",
    "Customizable workflows",
    "Offline access after download"
  ],
  "technicalDetails": {
    "format": "CSV",
    "encoding": "UTF-8",
    "columns": ["section", "system", "location", "component", "material", "condition", "comment"],
    "hierarchyLevels": 6,
    "conditionTypes": ["Acceptable", "Monitor", "Repair/Replace", "Safety Hazard", "Access Restricted"]
  },
  "targetAudience": "Investors, property managers, multi-family inspectors",
  "sampleData": {
    "previewUrl": "/api/marketplace/products/product-multifamily/preview",
    "sampleItemCount": 100,
    "sampleSections": ["Exterior", "Interior - Unit A", "Interior - Unit B", "Shared Systems"]
  },
  "screenshots": [
    "https://cdn.smartinspector.pro/marketplace/multifamily-screenshot-1.jpg",
    "https://cdn.smartinspector.pro/marketplace/multifamily-screenshot-2.jpg"
  ],
  "popularity": 4.7,
  "reviewCount": 342,
  "reviews": [
    {
      "userId": "user-456",
      "userName": "Mike Johnson",
      "rating": 5,
      "comment": "Perfect for my duplex and triplex inspections. Very comprehensive!",
      "createdAt": "2025-09-15T10:00:00Z"
    }
  ],
  "relatedProducts": [
    {
      "id": "product-condos",
      "name": "Condominiums & Townhomes",
      "price": 14.99
    },
    {
      "id": "bundle-residential-complete",
      "name": "Residential Complete Bundle",
      "price": 99.99,
      "savings": 30.97
    }
  ],
  "faq": [
    {
      "question": "Can I use this table with my existing workflows?",
      "answer": "Yes! This table uses the same 6-level hierarchy (Section → System → Location → Component → Material → Condition) and can be combined with other tables in your custom workflows."
    },
    {
      "question": "Is this a one-time purchase or subscription?",
      "answer": "One-time purchase. You own it forever with lifetime access and free updates."
    }
  ],
  "createdAt": "2025-01-15T00:00:00Z",
  "updatedAt": "2025-10-01T00:00:00Z",
  "lastUpdated": "October 1, 2025"
}
```

---

### Get Products by Category

Filter marketplace products by category.

```http
GET /api/marketplace/products/category/residential
Authorization: Bearer {token}

Query Parameters:
- sort (optional): "price-asc" | "price-desc" | "popular" | "newest"
- limit (optional): Number of results (default: 20)
- offset (optional): Pagination offset (default: 0)

Response: 200 OK
{
  "category": "residential",
  "products": [
    {
      "id": "product-multifamily",
      "name": "Multi-Family Properties",
      "price": 19.99,
      "itemCount": 15000,
      "isPurchased": false
    },
    {
      "id": "product-condos",
      "name": "Condominiums & Townhomes",
      "price": 14.99,
      "itemCount": 8500,
      "isPurchased": true
    },
    {
      "id": "product-mobile-homes",
      "name": "Mobile/Manufactured Homes",
      "price": 12.99,
      "itemCount": 6200,
      "isPurchased": false
    },
    {
      "id": "product-historic-homes",
      "name": "Historic Homes (Pre-1940s)",
      "price": 24.99,
      "itemCount": 12000,
      "isPurchased": false
    },
    {
      "id": "product-luxury",
      "name": "Luxury Properties",
      "price": 29.99,
      "itemCount": 18500,
      "isPurchased": false
    }
  ],
  "totalProducts": 5
}
```

---

### Preview Product Data

Get a sample of the inspection items from a marketplace product before purchasing.

```http
GET /api/marketplace/products/product-multifamily/preview
Authorization: Bearer {token}

Response: 200 OK
{
  "productId": "product-multifamily",
  "productName": "Multi-Family Properties",
  "sampleItemCount": 100,
  "totalItemCount": 15000,
  "sampleData": [
    {
      "section": "Exterior",
      "system": "Building Envelope",
      "location": "Unit A - Front",
      "component": "Entry Door",
      "material": "Steel",
      "condition": "Acceptable",
      "comment": "Functional at time of inspection."
    },
    {
      "section": "Shared Systems",
      "system": "HVAC",
      "location": "Mechanical Room",
      "component": "Central Air Handler",
      "material": "Metal - Commercial Grade",
      "condition": "Monitor",
      "comment": "Minor wear noted; schedule preventive maintenance."
    },
    // ... 98 more sample items
  ],
  "hierarchy": {
    "sections": ["Exterior", "Interior - Unit A", "Interior - Unit B", "Shared Systems", "Common Areas"],
    "systemCount": 45,
    "componentCount": 850,
    "materialCount": 320
  }
}
```

---

### Purchase Product

Initiate a purchase for a marketplace product. Supports Stripe, Apple IAP, and Google Play Billing.

#### Stripe Purchase (Web/Mobile)

```http
POST /api/marketplace/purchase/product-multifamily
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "stripe",
  "paymentMethodId": "pm_1234567890",  // Stripe Payment Method ID
  "billingDetails": {
    "name": "John Smith",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "postalCode": "78701",
      "country": "US"
    }
  }
}

Response: 201 Created
{
  "purchaseId": "purchase-789",
  "productId": "product-multifamily",
  "productName": "Multi-Family Properties",
  "userId": "user-123",
  "transactionId": "ch_stripe_abc123",
  "paymentMethod": "stripe",
  "amount": 19.99,
  "currency": "USD",
  "status": "completed",
  "purchaseDate": "2025-10-20T14:30:00Z",
  "downloadUrl": "/api/marketplace/download/product-multifamily",
  "expiresAt": null  // Download never expires
}
```

#### Apple In-App Purchase (iOS)

```http
POST /api/marketplace/purchase/product-multifamily
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "apple-iap",
  "receiptData": "MIITtQYJKoZIhvcNAQ...",  // Base64-encoded App Store receipt
  "transactionId": "1000000123456789"
}

Response: 201 Created
{
  "purchaseId": "purchase-790",
  "productId": "product-multifamily",
  "productName": "Multi-Family Properties",
  "userId": "user-123",
  "transactionId": "1000000123456789",
  "paymentMethod": "apple-iap",
  "amount": 19.99,
  "currency": "USD",
  "status": "completed",
  "purchaseDate": "2025-10-20T14:30:00Z",
  "receiptVerified": true,
  "downloadUrl": "/api/marketplace/download/product-multifamily"
}
```

#### Google Play Billing (Android)

```http
POST /api/marketplace/purchase/product-multifamily
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "google-play",
  "purchaseToken": "abcdefghijklmnopqrstuvwxyz",
  "orderId": "GPA.1234-5678-9012-34567"
}

Response: 201 Created
{
  "purchaseId": "purchase-791",
  "productId": "product-multifamily",
  "productName": "Multi-Family Properties",
  "userId": "user-123",
  "transactionId": "GPA.1234-5678-9012-34567",
  "paymentMethod": "google-play",
  "amount": 19.99,
  "currency": "USD",
  "status": "completed",
  "purchaseDate": "2025-10-20T14:30:00Z",
  "tokenVerified": true,
  "downloadUrl": "/api/marketplace/download/product-multifamily"
}
```

---

### Get Purchase History

Retrieve all marketplace purchases for the authenticated user.

```http
GET /api/marketplace/purchases?limit=20&offset=0
Authorization: Bearer {token}

Query Parameters:
- status (optional): "completed" | "pending" | "failed" | "refunded"
- limit (optional): Number of results (default: 20)
- offset (optional): Pagination offset (default: 0)

Response: 200 OK
{
  "purchases": [
    {
      "purchaseId": "purchase-789",
      "productId": "product-multifamily",
      "productName": "Multi-Family Properties",
      "productType": "table",
      "amount": 19.99,
      "currency": "USD",
      "paymentMethod": "stripe",
      "transactionId": "ch_stripe_abc123",
      "status": "completed",
      "purchaseDate": "2025-10-20T14:30:00Z",
      "downloadedAt": "2025-10-20T14:31:15Z",
      "downloadUrl": "/api/marketplace/download/product-multifamily"
    },
    {
      "purchaseId": "purchase-690",
      "productId": "bundle-residential-complete",
      "productName": "Residential Complete Bundle",
      "productType": "bundle",
      "amount": 99.99,
      "currency": "USD",
      "paymentMethod": "apple-iap",
      "transactionId": "1000000987654321",
      "status": "completed",
      "purchaseDate": "2025-09-15T10:00:00Z",
      "includedProducts": [
        "product-multifamily",
        "product-condos",
        "product-mobile-homes",
        "product-historic-homes",
        "product-luxury"
      ],
      "downloadedAt": "2025-09-15T10:05:30Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "summary": {
    "totalPurchases": 2,
    "totalSpent": 119.98,
    "currency": "USD",
    "tablesOwned": 6  // 1 from individual purchase + 5 from bundle
  }
}
```

---

### Download Purchased Product

Download the CSV data file for a purchased marketplace product.

```http
POST /api/marketplace/download/product-multifamily
Authorization: Bearer {token}

Response: 200 OK
{
  "productId": "product-multifamily",
  "productName": "Multi-Family Properties",
  "downloadUrl": "https://cdn.smartinspector.pro/marketplace-data/user-123/table-multifamily.csv",
  "expiresAt": "2025-10-20T15:30:00Z",  // Signed URL expires in 1 hour
  "fileSize": 1572864,
  "format": "CSV",
  "checksum": "sha256:abc123def456...",  // For integrity verification
  "metadata": {
    "tableId": "table-multifamily",
    "version": "1.2.0",
    "itemCount": 15000,
    "lastUpdated": "2025-10-01T00:00:00Z"
  }
}

# Use the downloadUrl to fetch the actual CSV file
GET https://cdn.smartinspector.pro/marketplace-data/user-123/table-multifamily.csv

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="multifamily_properties.csv"

Section,System,Location,Component,Material,Condition,Comment
Exterior,Building Envelope,Unit A - Front,Entry Door,Steel,Acceptable,Functional at time of inspection.
Shared Systems,HVAC,Mechanical Room,Central Air Handler,Metal - Commercial Grade,Monitor,Minor wear noted; schedule preventive maintenance.
...
```

---

### Check Product Updates

Check if purchased products have newer versions available.

```http
GET /api/marketplace/updates
Authorization: Bearer {token}

Response: 200 OK
{
  "updates": [
    {
      "productId": "product-multifamily",
      "productName": "Multi-Family Properties",
      "currentVersion": "1.1.0",
      "latestVersion": "1.2.0",
      "updateAvailable": true,
      "releaseDate": "2025-10-01T00:00:00Z",
      "changeLog": [
        "Added 200 new inspection items for solar panel systems",
        "Updated shared HVAC components",
        "Fixed typos in 15 comment templates"
      ],
      "downloadUrl": "/api/marketplace/download/product-multifamily"
    }
  ],
  "totalUpdates": 1
}
```

---

### Marketplace Search

Search across all marketplace products.

```http
GET /api/marketplace/search?q=commercial+kitchen&limit=10
Authorization: Bearer {token}

Query Parameters:
- q (required): Search query
- category (optional): Filter by category
- limit (optional): Number of results (default: 10)

Response: 200 OK
{
  "query": "commercial kitchen",
  "results": [
    {
      "id": "product-restaurants",
      "name": "Restaurants & Food Service",
      "category": "commercial",
      "description": "Commercial kitchen equipment, health department compliance items...",
      "price": 34.99,
      "relevanceScore": 0.95,
      "highlights": [
        "Commercial <mark>kitchen</mark> equipment",
        "Health department compliance"
      ]
    },
    {
      "id": "product-hotels",
      "name": "Hotels & Hospitality",
      "category": "commercial",
      "description": "Guest rooms, common areas, commercial kitchens...",
      "price": 54.99,
      "relevanceScore": 0.78,
      "highlights": [
        "Commercial <mark>kitchens</mark>",
        "Laundry facilities"
      ]
    }
  ],
  "totalResults": 2
}
```

---

### Request Refund

Request a refund for a marketplace purchase (within 30 days).

```http
POST /api/marketplace/purchases/purchase-789/refund
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "product-not-as-described",  // or "technical-issues", "accidental-purchase", "other"
  "details": "The table doesn't include triplex inspections as advertised."
}

Response: 200 OK
{
  "refundId": "refund-456",
  "purchaseId": "purchase-789",
  "status": "pending",
  "amount": 19.99,
  "currency": "USD",
  "requestedAt": "2025-10-25T10:00:00Z",
  "estimatedProcessingTime": "3-5 business days",
  "message": "Your refund request has been submitted and will be reviewed within 24 hours."
}
```

---

### Error Responses

#### Product Not Found
```http
Response: 404 Not Found
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The requested product does not exist.",
    "productId": "product-invalid"
  }
}
```

#### Already Purchased
```http
Response: 409 Conflict
{
  "error": {
    "code": "ALREADY_PURCHASED",
    "message": "You have already purchased this product.",
    "productId": "product-multifamily",
    "purchaseDate": "2025-10-10T14:30:00Z",
    "downloadUrl": "/api/marketplace/download/product-multifamily"
  }
}
```

#### Payment Failed
```http
Response: 402 Payment Required
{
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment processing failed. Please check your payment method.",
    "details": "Card declined: insufficient funds",
    "stripeError": "card_declined"
  }
}
```

#### Not Purchased
```http
Response: 403 Forbidden
{
  "error": {
    "code": "NOT_PURCHASED",
    "message": "You must purchase this product before downloading.",
    "productId": "product-multifamily",
    "productUrl": "/api/marketplace/products/product-multifamily"
  }
}
```

#### Refund Window Expired
```http
Response: 400 Bad Request
{
  "error": {
    "code": "REFUND_WINDOW_EXPIRED",
    "message": "Refund requests must be submitted within 30 days of purchase.",
    "purchaseDate": "2025-08-01T10:00:00Z",
    "refundWindowExpired": "2025-08-31T10:00:00Z"
  }
}
```

---

## Internationalization API

### Get User Locale Settings
```http
GET /api/i18n/user/locale-settings
Authorization: Bearer {token}

Response:
{
  "userId": "user-123",
  "preferredLanguage": "en-US",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "temperatureUnit": "fahrenheit",
  "measurementSystem": "imperial",
  "currency": "USD",
  "timezone": "America/Chicago",
  "numberFormat": "en-US"
}
```

### Update Locale Settings
```http
PUT /api/i18n/user/locale-settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "preferredLanguage": "es-MX",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "temperatureUnit": "celsius",
  "measurementSystem": "metric",
  "currency": "MXN",
  "timezone": "America/Mexico_City"
}

Response: 200 OK
{
  "userId": "user-123",
  "preferredLanguage": "es-MX",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "24h",
  "temperatureUnit": "celsius",
  "measurementSystem": "metric",
  "currency": "MXN",
  "timezone": "America/Mexico_City",
  "updatedAt": "2025-10-25T10:30:00Z"
}
```

### Get Translations for Locale
```http
GET /api/i18n/translations/es-MX
Authorization: Bearer {token}

Response:
{
  "locale": "es-MX",
  "translations": {
    "app.title": "Smart Inspector Pro",
    "inspection.condition.acceptable": "Aceptable",
    "inspection.condition.monitor": "Monitorear",
    "inspection.condition.repair_replace": "Reparar/Reemplazar",
    "inspection.condition.safety_hazard": "Peligro de Seguridad",
    "inspection.condition.access_restricted": "Acceso Restringido",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar"
  },
  "lastUpdated": "2025-10-15T12:00:00Z"
}
```

### Get Regional Inspection Standards
```http
GET /api/i18n/inspection-standards/CA?region=ON
Authorization: Bearer {token}

Response:
{
  "countryCode": "CA",
  "regionCode": "ON",
  "standards": [
    {
      "id": "std-001",
      "standardName": "OAHI Standards of Practice",
      "organization": "Ontario Association of Home Inspectors",
      "requirements": {
        "structural": ["foundation", "framing", "roof"],
        "electrical": ["servicePanel", "wiring", "outlets"],
        "plumbing": ["waterSupply", "drainWasteVent", "hotWater"]
      },
      "mandatoryFields": [
        "inspectorLicense",
        "insurancePolicy",
        "clientSignature"
      ]
    }
  ]
}
```

---

## Rate Limits

Rate limits are enforced based on membership tier and endpoint type.

### Limits by Tier

| Endpoint Type | Starter | Professional | Business | Enterprise |
|--------------|---------|-------------|----------|------------|
| General API | 30/min | 60/min | 120/min | 300/min |
| Photo Upload | 25/min | 50/min | 100/min | 250/min |
| AI Analysis | 5/min | 10/min | 20/min | 50/min |
| Report Generation | 10/min | 20/min | 40/min | 100/min |
| Authentication | 3/5min | 5/5min | 10/5min | 20/5min |

### Rate Limit Headers
Every API response includes rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 2025-10-25T10:35:00Z
```

### 429 Too Many Requests Response
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 2025-10-25T10:35:00Z",
  "retryAfter": 120,  # seconds
  "limit": 60,
  "remaining": 0,
  "resetAt": "2025-10-25T10:35:00Z"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "propertyAddress",
        "message": "Property address is required"
      }
    ],
    "requestId": "req-abc123",
    "timestamp": "2025-10-25T10:40:00Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid JWT token |
| `AUTHORIZATION_FAILED` | 403 | User lacks permission for this action |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_QUOTA_EXCEEDED` | 402 | Monthly AI analysis limit reached |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Webhooks

### Configuring Webhooks
```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/smartinspector",
  "events": [
    "inspection.created",
    "inspection.completed",
    "report.generated",
    "photo.uploaded"
  ],
  "secret": "your-webhook-secret"
}

Response:
{
  "id": "webhook-123",
  "url": "https://your-app.com/webhooks/smartinspector",
  "events": ["inspection.created", "inspection.completed", "report.generated", "photo.uploaded"],
  "active": true,
  "createdAt": "2025-10-25T10:45:00Z"
}
```

### Webhook Payload Example
```json
{
  "id": "evt-abc123",
  "type": "inspection.completed",
  "data": {
    "inspectionId": "inspection-123",
    "propertyAddress": "123 Main St",
    "completedAt": "2025-10-25T15:00:00Z",
    "recordCount": 127,
    "photoCount": 342,
    "inspector": {
      "id": "user-456",
      "name": "John Smith"
    }
  },
  "timestamp": "2025-10-25T15:00:15Z"
}
```

### Webhook Signature Verification
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

---

## SDK & Client Libraries

### JavaScript/TypeScript
```bash
npm install @smartinspector/api-client
```

```typescript
import { SmartInspectorClient } from '@smartinspector/api-client';

const client = new SmartInspectorClient({
  apiKey: 'your-api-key',
  environment: 'production'  // 'development' | 'production'
});

// GraphQL query
const inspections = await client.inspections.list({
  status: 'in-progress',
  limit: 20
});

// Upload photo with AI analysis
const photo = await client.photos.upload({
  inspectionId: 'inspection-123',
  file: photoFile,
  enableAIAnalysis: true
});

// Real-time subscription
client.subscriptions.onInspectionUpdated('inspection-123', (data) => {
  console.log('Inspection updated:', data);
});
```

### React Native
```bash
npm install @smartinspector/react-native
```

```typescript
import { useInspection, usePhotoUpload } from '@smartinspector/react-native';

function InspectionScreen({ inspectionId }) {
  const { inspection, loading, error } = useInspection(inspectionId);
  const { uploadPhoto, uploading, progress } = usePhotoUpload();

  const handlePhotoCapture = async (photo) => {
    const result = await uploadPhoto({
      inspectionId,
      file: photo,
      enableAIAnalysis: true
    });
    console.log('AI Analysis:', result.aiAnalysis);
  };

  return (
    <View>
      <Text>{inspection.propertyAddress}</Text>
      {uploading && <ProgressBar progress={progress} />}
    </View>
  );
}
```

### Python
```bash
pip install smartinspector-sdk
```

```python
from smartinspector import SmartInspectorClient

client = SmartInspectorClient(api_key='your-api-key')

# List inspections
inspections = client.inspections.list(status='in-progress', limit=20)

# Upload photo
with open('photo.jpg', 'rb') as f:
    photo = client.photos.upload(
        inspection_id='inspection-123',
        file=f,
        enable_ai_analysis=True
    )
    print(f"AI Analysis: {photo['aiAnalysis']}")

# Generate report
report = client.reports.generate(
    inspection_id='inspection-123',
    template_id='template-456',
    language='en-US'
)
```

---

## API Versioning

**Current Version:** v1  
**Base URL:** `https://api.smartinspector.pro/v1`

### Breaking Changes Policy
- Major version changes (v1 → v2) for breaking changes
- Minimum 6 months notice before deprecation
- Deprecation warnings in response headers
- Legacy versions supported for 12 months after deprecation announcement

### Version Headers
```http
Accept: application/vnd.smartinspector.v1+json
```

---

## Support & Resources

**API Status:** https://status.smartinspector.pro  
**Developer Portal:** https://developers.smartinspector.pro  
**API Explorer:** https://api.smartinspector.pro/graphql  
**Support Email:** api-support@smartinspector.pro  
**Community Forum:** https://community.smartinspector.pro

---

**Last Updated:** October 2025  
**Version:** 1.0.0
