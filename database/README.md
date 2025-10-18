# Database Directory

Database migrations and schema management for PostgreSQL.

## Structure

### `migrations/` - Database Migrations

Version-controlled database schema changes.

**Migration Files:**

- `001_create_users_table.sql` - Users table
- `002_create_inspections_table.sql` - Inspections table
- `003_create_inspection_records_table.sql` - Individual inspection items
- `004_create_workflows_table.sql` - Custom workflows
- `005_create_teams_table.sql` - Team collaboration
- `006_add_indexes.sql` - Performance indexes

## Migration Pattern

### SQL Migration Example

```sql
-- 001_create_users_table.sql
-- UP Migration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  membership_tier VARCHAR(50) NOT NULL DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_cognito_id ON users(cognito_id);
CREATE INDEX idx_users_email ON users(email);

-- DOWN Migration
-- DROP TABLE users;
```

### Using Migration Tool (Node.js)

```typescript
// Example using node-pg-migrate or similar
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder) {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    cognito_id: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    business_name: { type: 'varchar(255)' },
    membership_tier: {
      type: 'varchar(50)',
      notNull: true,
      default: 'professional',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('users', 'cognito_id');
  pgm.createIndex('users', 'email');
}

export async function down(pgm: MigrationBuilder) {
  pgm.dropTable('users');
}
```

## Core Tables

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  cognito_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  membership_tier VARCHAR(50) DEFAULT 'professional',
  ai_quota_remaining INT DEFAULT 500,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Inspections Table

```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  property_address TEXT NOT NULL,
  scheduled_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'scheduled',
  workflow_id UUID REFERENCES workflows(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Inspection Records Table

```sql
CREATE TABLE inspection_records (
  id UUID PRIMARY KEY,
  inspection_id UUID REFERENCES inspections(id),
  photo_url TEXT,
  section VARCHAR(255),
  system VARCHAR(255),
  location VARCHAR(255),
  component VARCHAR(255),
  material VARCHAR(255),
  condition VARCHAR(50),
  comments TEXT,
  ai_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### Workflows Table

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  base_table VARCHAR(100) DEFAULT 'Single_Family',
  filters JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Migration Commands

```bash
# Run all pending migrations
npm run migrate up

# Rollback last migration
npm run migrate down

# Create new migration
npm run migrate create add_new_column
```

## Environment Setup

### PostgreSQL Connection

```bash
# .env
DATABASE_URL=postgresql://username:password@localhost:5432/smartinspector
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### AWS RDS Production

```bash
DATABASE_URL=postgresql://admin:password@smartinspector.xxxxx.us-east-1.rds.amazonaws.com:5432/smartinspector
```

## Best Practices

1. **Versioned Migrations** - Number migrations sequentially (001, 002, 003)
2. **Atomic Changes** - One migration per logical change
3. **Rollback Support** - Always provide DOWN migration
4. **Indexes** - Add indexes for foreign keys and query columns
5. **Data Types** - Use appropriate types (UUID for IDs, JSONB for flexible data)
6. **Constraints** - Use NOT NULL, UNIQUE, FOREIGN KEY constraints
7. **Timestamps** - Always include created_at and updated_at
