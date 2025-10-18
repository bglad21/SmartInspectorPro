# Backend Directory

Node.js/Express.js backend API server for Smart Inspector Pro.

## Structure

### `routes/` - API Routes

Express route definitions organized by feature.

**Routes:**

- `auth.routes.ts` - Authentication endpoints (login, register, refresh)
- `inspections.routes.ts` - Inspection CRUD operations
- `workflows.routes.ts` - Workflow management
- `ai.routes.ts` - OpenAI GPT-4 Vision integration
- `storage.routes.ts` - AWS S3 photo uploads
- `reports.routes.ts` - PDF report generation
- `team.routes.ts` - Team collaboration features

### `controllers/` - Request Handlers

Business logic for handling HTTP requests.

**Controllers:**

- `auth.controller.ts` - User authentication logic
- `inspections.controller.ts` - Inspection operations
- `ai.controller.ts` - AI photo analysis
- `storage.controller.ts` - S3 upload/download

### `models/` - Database Models

PostgreSQL database models (using Sequelize or TypeORM).

**Models:**

- `User.model.ts` - User account data
- `Inspection.model.ts` - Inspection records
- `InspectionRecord.model.ts` - Individual inspection items
- `Workflow.model.ts` - Custom workflows
- `Team.model.ts` - Team collaboration

### `middleware/` - Express Middleware

Custom middleware for authentication, validation, error handling.

**Middleware:**

- `auth.middleware.ts` - JWT token validation (Cognito)
- `errorHandler.middleware.ts` - Global error handler
- `validation.middleware.ts` - Request validation (Joi/Zod)
- `rateLimit.middleware.ts` - Rate limiting for AI endpoints

### `services/` - External Services

Integration with external APIs and services.

**Services:**

- `cognito.service.ts` - AWS Cognito authentication
- `s3.service.ts` - AWS S3 storage operations
- `openai.service.ts` - OpenAI GPT-4 API client
- `email.service.ts` - Email notifications (SES)
- `cache.service.ts` - Redis caching

## API Structure

### Route Definition

```typescript
// routes/inspections.routes.ts
import { Router } from 'express';
import { InspectionsController } from '../controllers/inspections.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new InspectionsController();

router.get('/', authMiddleware, controller.getInspections);
router.post('/', authMiddleware, controller.createInspection);
router.get('/:id', authMiddleware, controller.getInspectionById);
router.put('/:id', authMiddleware, controller.updateInspection);
router.delete('/:id', authMiddleware, controller.deleteInspection);

export default router;
```

### Controller Pattern

```typescript
// controllers/inspections.controller.ts
import { Request, Response, NextFunction } from 'express';
import { InspectionService } from '../services/inspection.service';

export class InspectionsController {
  private service: InspectionService;

  constructor() {
    this.service = new InspectionService();
  }

  getInspections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // From auth middleware
      const inspections = await this.service.getInspectionsByUser(userId);
      res.json(inspections);
    } catch (error) {
      next(error);
    }
  };

  // More methods...
}
```

### Middleware Example

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify Cognito JWT token
    const decoded = jwt.verify(token, process.env.COGNITO_PUBLIC_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Environment Variables

Create `.env` file in backend root:

```bash
# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=xxxxx
COGNITO_REGION=us-east-1

# AWS S3
S3_BUCKET_NAME=smart-inspector-photos
S3_REGION=us-east-1

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Database
DATABASE_URL=postgresql://user:password@host:5432/smartinspector

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

## Best Practices

1. **Error Handling** - Use try/catch and centralized error middleware
2. **Validation** - Validate all input with Joi or Zod
3. **Authentication** - Verify Cognito JWT tokens on protected routes
4. **Rate Limiting** - Protect expensive endpoints (AI, file uploads)
5. **Logging** - Use Winston or Pino for structured logging
6. **Security** - Use helmet, cors, and secure headers
