# Smart Inspector Pro - Migration Guide

**Document Version:** 1.1.0  
**Last Updated:** October 17, 2025  
**Status:** Pre-Development

## Overview
This guide covers data migration strategies, database upgrades, and version migrations for Smart Inspector Pro. Use this guide when:
- Setting up production infrastructure
- Migrating from development to production
- Upgrading between major versions
- Adding internationalization support
- Implementing database sharding
- Loading marketplace product data

**Version History:**
- **1.1.0** (Oct 17, 2025): Added dual CSV loading, marketplace product seeding
- **1.0.0** (Oct 16, 2025): Initial migration procedures

---

## Table of Contents
1. [Pre-Launch Migration Checklist](#pre-launch-migration-checklist)
2. [CSV Data Migration](#csv-data-migration)
3. [Database Schema Migrations](#database-schema-migrations)
4. [AWS Infrastructure Migration](#aws-infrastructure-migration)
5. [Internationalization Migration](#internationalization-migration)
6. [User Data Migration](#user-data-migration)
7. [Photo Storage Migration](#photo-storage-migration)
8. [Database Sharding Migration](#database-sharding-migration)
9. [Rollback Procedures](#rollback-procedures)
10. [Testing & Validation](#testing--validation)

---

## Pre-Launch Migration Checklist

### Phase 1: Development Environment Setup
- [ ] Set up AWS RDS PostgreSQL database (dev instance)
- [ ] Set up Redis ElastiCache cluster (dev instance)
- [ ] Create S3 bucket for development (`smart-inspector-dev`)
- [ ] Configure AWS Cognito User Pool (dev)
- [ ] Load `single_family_sample.csv` (2,504 items) for testing
- [ ] Run database schema migration scripts
- [ ] Verify API endpoints with Postman/GraphQL Playground
- [ ] Test authentication flow (signup, login, token refresh)
- [ ] Test photo upload to S3
- [ ] Test AI integration with OpenAI

### Phase 2: Staging Environment
- [ ] Clone production AWS infrastructure (staging instance)
- [ ] Load full `Single_Family.csv` (33,432 items)
- [ ] Create test user accounts (10-20 users)
- [ ] Seed test inspection data (50-100 inspections)
- [ ] Test offline sync functionality
- [ ] Load test API with 100 concurrent users
- [ ] Verify CloudFront CDN caching
- [ ] Test backup and restore procedures

### Phase 3: Production Launch
- [ ] Provision production RDS instance (db.t3.medium or higher)
- [ ] Set up Redis ElastiCache production cluster
- [ ] Create S3 bucket (`smart-inspector-production`)
- [ ] Configure CloudFront distribution
- [ ] Set up RDS automated backups (7-day retention)
- [ ] Configure AWS Backup for disaster recovery
- [ ] Enable CloudWatch monitoring and alarms
- [ ] Run final database migration scripts
- [ ] Load production CSV data
- [ ] Verify all services operational
- [ ] Test end-to-end user flows
- [ ] Launch! 🚀

---

## CSV Data Migration

### Loading Initial CSV Data

#### 1. Prepare CSV Files
```bash
# Verify CSV file integrity
md5sum Single_Family.csv
# Expected: 33,432 rows

# For testing, use sample data
head -2505 Single_Family.csv > single_family_sample.csv
```

#### 2. Create CSV Loading Script
```javascript
// backend/scripts/loadCSVData.js
const fs = require('fs');
const Papa = require('papaparse');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'smartinspector',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function loadCSVData(filePath, tableId) {
  const csvFile = fs.readFileSync(filePath, 'utf8');
  
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`Parsed ${results.data.length} rows`);
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        let inserted = 0;
        for (const row of results.data) {
          await client.query(`
            INSERT INTO inspection_items (
              table_id, section, system, location, component, material, condition, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            tableId,
            row.Section || '',
            row.System || '',
            row.Location || null,
            row.Component || '',
            row.Material || '',
            row.Condition || '',
            row.Comment || ''
          ]);
          
          inserted++;
          if (inserted % 1000 === 0) {
            console.log(`Inserted ${inserted} rows...`);
          }
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully loaded ${inserted} inspection items`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error loading CSV data:', error);
        throw error;
      } finally {
        client.release();
      }
    }
  });
}

// Create inspection data tables
async function createInspectionTables() {
  const client = await pool.connect();
  try {
    // 1. Free/Preview table (bundled with app)
    const sampleTable = await client.query(`
      INSERT INTO inspection_data_tables (
        user_id, name, description, table_type, category, item_count, file_size_kb,
        is_default, is_bundled, requires_membership, price_usd
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        'Single Family Home - Sample',
        'Preview inspection checklist (2,504 items) - bundled with app for free users',
        'free-preview',
        'single-family',
        2504,
        250,
        true,
        true,
        false,
        NULL
      ) RETURNING id
    `);
    
    // 2. Premium table (requires membership)
    const premiumTable = await client.query(`
      INSERT INTO inspection_data_tables (
        user_id, name, description, table_type, category, item_count, file_size_kb,
        is_default, is_bundled, requires_membership, price_usd
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        'Single Family Home - Complete',
        'Complete inspection checklist (33,432 items) - requires Professional membership or higher',
        'premium',
        'single-family',
        33432,
        3500,
        false,
        false,
        true,
        NULL
      ) RETURNING id
    `);
    
    return {
      sampleTableId: sampleTable.rows[0].id,
      premiumTableId: premiumTable.rows[0].id
    };
  } finally {
    client.release();
  }
}

// Run migration
(async () => {
  console.log('Starting CSV data migration...');
  
  const tables = await createInspectionTables();
  console.log(`Created sample table: ${tables.sampleTableId}`);
  console.log(`Created premium table: ${tables.premiumTableId}`);
  
  // Load sample data (bundled with app)
  console.log('\n📦 Loading sample data (single_family_sample.csv)...');
  await loadCSVData('./data/single_family_sample.csv', tables.sampleTableId);
  
  // Load full premium data
  console.log('\n💎 Loading premium data (Single_Family.csv)...');
  await loadCSVData('./data/Single_Family.csv', tables.premiumTableId);
  
  console.log('\n✅ CSV migration complete!');
  console.log(`  - Sample table: 2,504 items (bundled with app)`);
  console.log(`  - Premium table: 33,432 items (membership required)`);
  process.exit(0);
})();
```

#### 3. Run CSV Migration
```bash
# Development
node backend/scripts/loadCSVData.js

# Production (use PM2 for long-running process)
pm2 start backend/scripts/loadCSVData.js --name csv-migration
pm2 logs csv-migration
```

---

## Database Schema Migrations

### Using Node.js Migration Tool (Knex.js)

#### 1. Install Knex
```bash
npm install knex pg
npx knex init
```

#### 2. Configure Knex
```javascript
// knexfile.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: 5432,
      database: 'smartinspector_dev',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    }
  },
  
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.RDS_HOST,
      port: 5432,
      database: 'smartinspector',
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'knex_migrations'
    },
    pool: { min: 2, max: 10 }
  }
};
```

#### 3. Create Migration: Initial Schema
```bash
npx knex migrate:make initial_schema
```

```javascript
// database/migrations/001_initial_schema.js
exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100);
      table.string('last_name', 100);
      table.string('business_name', 255);
      table.string('phone', 20);
      table.text('address');
      table.string('membership_tier', 50);
      table.timestamps(true, true);
    })
    .createTable('inspections', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').references('users.id').onDelete('CASCADE');
      table.text('property_address').notNullable();
      table.jsonb('property_details');
      table.string('status', 50).notNullable();
      table.timestamp('scheduled_date');
      table.timestamps(true, true);
      table.index(['user_id', 'status']);
    })
    // ... add all other tables
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('inspections')
    .dropTableIfExists('users');
};
```

#### 4. Create Migration: Add i18n Tables
```bash
npx knex migrate:make add_i18n_tables
```

```javascript
// database/migrations/002_add_i18n_tables.js
exports.up = function(knex) {
  return knex.schema
    .createTable('translations', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('translation_key', 255).notNullable();
      table.string('locale', 10).notNullable();
      table.text('translated_text').notNullable();
      table.string('context', 255);
      table.timestamps(true, true);
      table.unique(['translation_key', 'locale']);
      table.index('locale');
      table.index('translation_key');
    })
    .createTable('locale_settings', (table) => {
      table.uuid('user_id').primary().references('users.id').onDelete('CASCADE');
      table.string('preferred_language', 10).defaultTo('en-US');
      table.string('date_format', 20).defaultTo('MM/DD/YYYY');
      table.string('time_format', 10).defaultTo('12h');
      table.string('temperature_unit', 10).defaultTo('fahrenheit');
      table.string('measurement_system', 20).defaultTo('imperial');
      table.string('currency', 3).defaultTo('USD');
      table.string('timezone', 50).defaultTo('America/New_York');
      table.string('number_format', 20).defaultTo('en-US');
      table.timestamps(true, true);
    })
    .createTable('regional_configs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('country_code', 2).notNullable();
      table.string('region_code', 10);
      table.string('config_key', 100).notNullable();
      table.jsonb('config_value').notNullable();
      table.timestamps(true, true);
      table.unique(['country_code', 'region_code', 'config_key']);
      table.index(['country_code']);
      table.index(['country_code', 'region_code']);
    })
    .createTable('inspection_standards', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('country_code', 2).notNullable();
      table.string('region_code', 10);
      table.string('standard_name', 255).notNullable();
      table.jsonb('requirements').notNullable();
      table.jsonb('mandatory_fields');
      table.timestamps(true, true);
      table.index(['country_code']);
      table.index(['country_code', 'region_code']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('inspection_standards')
    .dropTableIfExists('regional_configs')
    .dropTableIfExists('locale_settings')
    .dropTableIfExists('translations');
};
```

#### 5. Run Migrations
```bash
# Development
npx knex migrate:latest

# Production
NODE_ENV=production npx knex migrate:latest

# Check migration status
npx knex migrate:status

# Rollback last migration
npx knex migrate:rollback
```

---

## AWS Infrastructure Migration

### Development → Staging → Production

#### 1. RDS Database Migration

**Create RDS Snapshot (Development)**
```bash
aws rds create-db-snapshot \
  --db-instance-identifier sip-dev-postgres \
  --db-snapshot-identifier sip-dev-snapshot-$(date +%Y%m%d)
```

**Restore to Staging**
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sip-staging-postgres \
  --db-snapshot-identifier sip-dev-snapshot-20251020 \
  --db-instance-class db.t3.medium

# Wait for instance to be available
aws rds wait db-instance-available \
  --db-instance-identifier sip-staging-postgres
```

**Copy to Production (Using pg_dump)**
```bash
# Export from staging
pg_dump -h sip-staging-postgres.xxxx.rds.amazonaws.com \
  -U postgres -d smartinspector \
  --clean --if-exists --no-owner --no-acl \
  > smartinspector_backup_$(date +%Y%m%d).sql

# Import to production
psql -h sip-production-postgres.xxxx.rds.amazonaws.com \
  -U postgres -d smartinspector \
  < smartinspector_backup_20251020.sql
```

#### 2. S3 Data Migration

**Sync Development → Production**
```bash
# Sync photos (excluding thumbnails, regenerate those)
aws s3 sync \
  s3://smart-inspector-dev/photos/original/ \
  s3://smart-inspector-production/photos/original/ \
  --exclude "*/thumbnails/*" \
  --storage-class INTELLIGENT_TIERING

# Verify sync
aws s3 ls s3://smart-inspector-production/photos/original/ --recursive --summarize
```

#### 3. Redis Cache Migration

Redis data is ephemeral (sessions, rate limits). No migration needed.

**Flush development cache before production launch:**
```bash
redis-cli -h smart-inspector-cache-dev.xxxx.cache.amazonaws.com FLUSHALL
```

---

## Internationalization Migration

### Adding i18n Support to Existing Database

#### 1. Run i18n Migration
```bash
npx knex migrate:latest  # Runs 002_add_i18n_tables.js
```

#### 2. Seed Translation Data
```javascript
// database/seeds/01_seed_translations.js
exports.seed = async function(knex) {
  await knex('translations').del();
  
  const translations = [
    // English (US)
    { translation_key: 'inspection.condition.acceptable', locale: 'en-US', translated_text: 'Acceptable' },
    { translation_key: 'inspection.condition.monitor', locale: 'en-US', translated_text: 'Monitor' },
    { translation_key: 'inspection.condition.repair_replace', locale: 'en-US', translated_text: 'Repair/Replace' },
    { translation_key: 'inspection.condition.safety_hazard', locale: 'en-US', translated_text: 'Safety Hazard' },
    { translation_key: 'inspection.condition.access_restricted', locale: 'en-US', translated_text: 'Access Restricted' },
    
    // Spanish (Mexico)
    { translation_key: 'inspection.condition.acceptable', locale: 'es-MX', translated_text: 'Aceptable' },
    { translation_key: 'inspection.condition.monitor', locale: 'es-MX', translated_text: 'Monitorear' },
    { translation_key: 'inspection.condition.repair_replace', locale: 'es-MX', translated_text: 'Reparar/Reemplazar' },
    { translation_key: 'inspection.condition.safety_hazard', locale: 'es-MX', translated_text: 'Peligro de Seguridad' },
    { translation_key: 'inspection.condition.access_restricted', locale: 'es-MX', translated_text: 'Acceso Restringido' },
    
    // French (Canada)
    { translation_key: 'inspection.condition.acceptable', locale: 'fr-CA', translated_text: 'Acceptable' },
    { translation_key: 'inspection.condition.monitor', locale: 'fr-CA', translated_text: 'Surveiller' },
    { translation_key: 'inspection.condition.repair_replace', locale: 'fr-CA', translated_text: 'Réparer/Remplacer' },
    { translation_key: 'inspection.condition.safety_hazard', locale: 'fr-CA', translated_text: 'Danger pour la sécurité' },
    { translation_key: 'inspection.condition.access_restricted', locale: 'fr-CA', translated_text: 'Accès restreint' }
  ];
  
  await knex('translations').insert(translations);
};

// Run seed
npx knex seed:run
```

#### 3. Create Default Locale Settings for Existing Users
```sql
-- Add locale settings for all existing users
INSERT INTO locale_settings (user_id, preferred_language, date_format, time_format, temperature_unit, measurement_system, currency, timezone)
SELECT 
  id,
  'en-US',
  'MM/DD/YYYY',
  '12h',
  'fahrenheit',
  'imperial',
  'USD',
  'America/New_York'
FROM users
ON CONFLICT (user_id) DO NOTHING;
```

#### 4. Load Regional Inspection Standards
```javascript
// database/seeds/02_seed_inspection_standards.js
exports.seed = async function(knex) {
  await knex('inspection_standards').del();
  
  const standards = [
    {
      country_code: 'US',
      region_code: null,
      standard_name: 'ASHI Standards of Practice',
      requirements: JSON.stringify({
        structural: ['foundation', 'framing', 'roof'],
        electrical: ['service_panel', 'wiring', 'outlets'],
        plumbing: ['water_supply', 'drain_waste_vent', 'hot_water'],
        hvac: ['heating_system', 'cooling_system', 'ductwork']
      }),
      mandatory_fields: JSON.stringify(['inspector_license', 'insurance_policy'])
    },
    {
      country_code: 'CA',
      region_code: 'ON',
      standard_name: 'OAHI Standards of Practice',
      requirements: JSON.stringify({
        structural: ['foundation', 'framing', 'roof'],
        electrical: ['service_panel', 'wiring', 'outlets'],
        plumbing: ['water_supply', 'drain_waste_vent', 'hot_water']
      }),
      mandatory_fields: JSON.stringify(['inspector_license', 'insurance_policy', 'client_signature'])
    },
    {
      country_code: 'GB',
      region_code: null,
      standard_name: 'RICS HomeBuyer Report',
      requirements: JSON.stringify({
        condition_ratings: ['1', '2', '3'],  // UK uses 1-3 rating system
        energy_performance: ['epc_required'],
        legal_requirements: ['property_information_form']
      }),
      mandatory_fields: JSON.stringify(['surveyor_registration', 'professional_indemnity'])
    }
  ];
  
  await knex('inspection_standards').insert(standards);
};
```

---

## User Data Migration

### Migrating from Development to Production

#### 1. Export User Data (Excluding Passwords)
```javascript
// backend/scripts/exportUsers.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ /* dev connection */ });

async function exportUsers() {
  const result = await pool.query(`
    SELECT 
      id, email, first_name, last_name, business_name, 
      phone, address, membership_tier, created_at
    FROM users
    WHERE email NOT LIKE '%@test.com'  -- Exclude test users
  `);
  
  fs.writeFileSync('users_export.json', JSON.stringify(result.rows, null, 2));
  console.log(`Exported ${result.rows.length} users`);
}

exportUsers();
```

#### 2. Import Users to Production
```javascript
// backend/scripts/importUsers.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ /* production connection */ });

async function importUsers() {
  const users = JSON.parse(fs.readFileSync('users_export.json', 'utf8'));
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const user of users) {
      // Insert user (they'll need to reset password)
      await client.query(`
        INSERT INTO users (
          id, email, first_name, last_name, business_name, 
          phone, address, membership_tier, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        user.id, user.email, user.first_name, user.last_name,
        user.business_name, user.phone, user.address,
        user.membership_tier, user.created_at
      ]);
      
      // Create Cognito user
      await createCognitoUser(user.email, user.first_name, user.last_name);
    }
    
    await client.query('COMMIT');
    console.log(`✅ Imported ${users.length} users`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
}
```

---

## Photo Storage Migration

### Optimizing S3 Storage Structure

#### 1. Migrate to New Folder Structure
```bash
# Old structure: photos/{userId}/{photoId}.jpg
# New structure: photos/{type}/{userId}/{inspectionId}/{photoId}.jpg

aws s3 sync \
  s3://smart-inspector-production/photos/ \
  s3://smart-inspector-production-new/photos/original/ \
  --dryrun  # Test first!

# Run actual migration
aws s3 sync \
  s3://smart-inspector-production/photos/ \
  s3://smart-inspector-production-new/photos/original/
```

#### 2. Generate Thumbnails for Existing Photos
```javascript
// backend/scripts/generateThumbnails.js
const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

async function generateThumbnails() {
  const photos = await s3.listObjectsV2({
    Bucket: 'smart-inspector-production',
    Prefix: 'photos/original/'
  }).promise();
  
  for (const photo of photos.Contents) {
    if (photo.Key.includes('thumbnail')) continue;
    
    const originalPhoto = await s3.getObject({
      Bucket: 'smart-inspector-production',
      Key: photo.Key
    }).promise();
    
    const thumbnail = await sharp(originalPhoto.Body)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const thumbnailKey = photo.Key.replace('/original/', '/thumbnails/');
    
    await s3.putObject({
      Bucket: 'smart-inspector-production',
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg'
    }).promise();
    
    console.log(`Generated thumbnail: ${thumbnailKey}`);
  }
}
```

---

## Database Sharding Migration

### Implementing Sharding at 2,000+ Users

#### 1. Create Shard Databases
```sql
-- On new RDS instance: shard-0
CREATE DATABASE smartinspector_shard_0;

-- On new RDS instance: shard-1
CREATE DATABASE smartinspector_shard_1;

-- Run schema migrations on each shard
NODE_ENV=shard0 npx knex migrate:latest
NODE_ENV=shard1 npx knex migrate:latest
```

#### 2. Migrate Users to Shards
```javascript
// backend/scripts/migrateToShards.js
async function migrateToShards() {
  const users = await primaryDB.query('SELECT * FROM users ORDER BY id');
  
  for (let i = 0; i < users.rows.length; i++) {
    const user = users.rows[i];
    const shardId = i % 2;  // Round-robin distribution
    const shardDB = shardId === 0 ? shard0DB : shard1DB;
    
    // Copy user to shard
    await shardDB.query(`INSERT INTO users VALUES ($1, ...)`, [user.id, ...]);
    
    // Copy all related data
    await migrateInspections(user.id, shardDB);
    await migrateRecords(user.id, shardDB);
    await migratePhotos(user.id, shardDB);
    
    console.log(`Migrated user ${user.id} to shard ${shardId}`);
  }
}
```

---

## Rollback Procedures

### Emergency Rollback Steps

#### 1. Database Rollback
```bash
# Rollback last migration
npx knex migrate:rollback

# Rollback all migrations
npx knex migrate:rollback --all

# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sip-production-postgres \
  --db-snapshot-identifier sip-prod-snapshot-20251020
```

#### 2. S3 Rollback (Enable Versioning)
```bash
# Enable versioning (before migration)
aws s3api put-bucket-versioning \
  --bucket smart-inspector-production \
  --versioning-configuration Status=Enabled

# Restore previous version
aws s3api list-object-versions \
  --bucket smart-inspector-production \
  --prefix photos/original/user-123/photo-456.jpg

aws s3api get-object \
  --bucket smart-inspector-production \
  --key photos/original/user-123/photo-456.jpg \
  --version-id {previous-version-id} \
  photo-restored.jpg
```

---

## Testing & Validation

### Post-Migration Validation Checklist

#### Database Integrity Checks
```sql
-- Verify row counts
SELECT 
  'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'inspections', COUNT(*) FROM inspections
UNION ALL
SELECT 'inspection_records', COUNT(*) FROM inspection_records
UNION ALL
SELECT 'photos', COUNT(*) FROM inspection_photos;

-- Check for orphaned records
SELECT COUNT(*) FROM inspections WHERE user_id NOT IN (SELECT id FROM users);
SELECT COUNT(*) FROM inspection_records WHERE inspection_id NOT IN (SELECT id FROM inspections);

-- Verify i18n data
SELECT locale, COUNT(*) FROM translations GROUP BY locale;
SELECT COUNT(*) FROM locale_settings;
```

#### API Health Check
```bash
# Test authentication
curl -X POST https://api.smartinspector.pro/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test inspection list
curl https://api.smartinspector.pro/v1/inspections \
  -H "Authorization: Bearer {token}"

# Test GraphQL endpoint
curl https://api.smartinspector.pro/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id email } }"}'
```

#### Performance Testing
```bash
# Load test with Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer {token}" \
  https://api.smartinspector.pro/v1/inspections

# Expected: <200ms response time, 0% error rate
```

---

**Migration Support:** migrations@smartinspector.pro  
**Last Updated:** October 2025  
**Version:** 1.0.0
