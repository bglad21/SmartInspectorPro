/**
 * Database Service
 *
 * Provides SQLite database operations for Smart Inspector Pro.
 * Implements offline-first architecture with local storage and sync queue.
 *
 * Features:
 * - Database initialization and migrations
 * - CRUD operations for all tables
 * - Transaction support
 * - Sync queue management
 * - CSV data loading
 * - Indexed queries for performance
 *
 * @service
 */

import SQLite, {
  type ResultSet,
  type SQLiteDatabase,
} from 'react-native-sqlite-storage';

// Enable promise API and debugging
SQLite.DEBUG(process.env.NODE_ENV === 'development');
SQLite.enablePromise(true);

const DATABASE_NAME = 'SmartInspectorPro.db';
const DATABASE_VERSION = 1;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User data (synced from Cognito)
 */
export interface User {
  id: string; // Cognito user ID
  username: string;
  email: string;
  businessName: string;
  membershipTier: 'professional' | 'enterprise';
  groups: string; // JSON array of groups
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

/**
 * Inspection metadata
 */
export interface Inspection {
  id: string; // UUID
  userId: string;
  propertyAddress: string;
  propertyType: 'single-family' | 'multi-family' | 'commercial';
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  scheduledDate: string;
  completedDate: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  workflowId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

/**
 * Individual inspection record (photo + condition)
 */
export interface InspectionRecord {
  id: string; // UUID
  inspectionId: string;
  section: string;
  system: string;
  location: string | null;
  component: string;
  material: string;
  condition:
    | 'Acceptable'
    | 'Monitor'
    | 'Repair/Replace'
    | 'Safety Hazard'
    | 'Access Restricted';
  comment: string;
  photoUri: string | null; // Local file path or S3 URL
  photoS3Key: string | null; // S3 object key
  aiAnalysisData: string | null; // JSON with AI predictions
  sequenceNumber: number; // Order in inspection
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

/**
 * Custom workflow configuration
 */
export interface Workflow {
  id: string; // UUID
  userId: string;
  name: string;
  description: string | null;
  propertyType: 'single-family' | 'multi-family' | 'commercial';
  filterConfig: string; // JSON with section/system/component filters
  isDefault: number; // 0 or 1 (SQLite boolean)
  isShared: number; // 0 or 1
  sharedCode: string | null; // For sharing workflows
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

/**
 * CSV data from Single_Family.csv (hierarchical inspection data)
 */
export interface CSVData {
  id: number; // Auto-increment
  section: string;
  system: string;
  location: string | null;
  component: string;
  material: string;
  condition:
    | 'Acceptable'
    | 'Monitor'
    | 'Repair/Replace'
    | 'Safety Hazard'
    | 'Access Restricted';
  comment: string;
  propertyType: 'single-family' | 'multi-family' | 'commercial';
}

/**
 * Sync queue for offline changes
 */
export interface SyncQueueItem {
  id: number; // Auto-increment
  tableName: string;
  recordId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: string; // JSON serialized record
  createdAt: string;
  attempts: number;
  lastAttemptAt: string | null;
  error: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  users: number;
  inspections: number;
  inspectionRecords: number;
  workflows: number;
  csvData: number;
  syncQueuePending: number;
}

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

class DatabaseService {
  private db: SQLiteDatabase | null = null;

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    try {
      console.log('[DatabaseService] Initializing database...');

      // Open database
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });

      console.log('[DatabaseService] Database opened successfully');

      // Create tables
      await this.createTables();

      // Create indexes
      await this.createIndexes();

      console.log('[DatabaseService] Database initialized successfully');
    } catch (error) {
      console.error('[DatabaseService] Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  private getDB(): SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Create all database tables
   */
  private async createTables(): Promise<void> {
    const db = this.getDB();

    // Users table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        businessName TEXT NOT NULL,
        membershipTier TEXT NOT NULL CHECK(membershipTier IN ('professional', 'enterprise')),
        groups TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncedAt TEXT
      );
    `);

    // Inspections table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        propertyAddress TEXT NOT NULL,
        propertyType TEXT NOT NULL CHECK(propertyType IN ('single-family', 'multi-family', 'commercial')),
        clientName TEXT NOT NULL,
        clientEmail TEXT,
        clientPhone TEXT,
        scheduledDate TEXT NOT NULL,
        completedDate TEXT,
        status TEXT NOT NULL CHECK(status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
        workflowId TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE SET NULL
      );
    `);

    // InspectionRecords table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS inspectionRecords (
        id TEXT PRIMARY KEY,
        inspectionId TEXT NOT NULL,
        section TEXT NOT NULL,
        system TEXT NOT NULL,
        location TEXT,
        component TEXT NOT NULL,
        material TEXT NOT NULL,
        condition TEXT NOT NULL CHECK(condition IN ('Acceptable', 'Monitor', 'Repair/Replace', 'Safety Hazard', 'Access Restricted')),
        comment TEXT NOT NULL,
        photoUri TEXT,
        photoS3Key TEXT,
        aiAnalysisData TEXT,
        sequenceNumber INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncedAt TEXT,
        FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
      );
    `);

    // Workflows table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        propertyType TEXT NOT NULL CHECK(propertyType IN ('single-family', 'multi-family', 'commercial')),
        filterConfig TEXT NOT NULL DEFAULT '{}',
        isDefault INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
        isShared INTEGER NOT NULL DEFAULT 0 CHECK(isShared IN (0, 1)),
        sharedCode TEXT UNIQUE,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        syncedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // CSVData table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS csvData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        system TEXT NOT NULL,
        location TEXT,
        component TEXT NOT NULL,
        material TEXT NOT NULL,
        condition TEXT NOT NULL CHECK(condition IN ('Acceptable', 'Monitor', 'Repair/Replace', 'Safety Hazard', 'Access Restricted')),
        comment TEXT NOT NULL,
        propertyType TEXT NOT NULL CHECK(propertyType IN ('single-family', 'multi-family', 'commercial'))
      );
    `);

    // SyncQueue table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS syncQueue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tableName TEXT NOT NULL,
        recordId TEXT NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        lastAttemptAt TEXT,
        error TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed', 'failed'))
      );
    `);

    console.log('[DatabaseService] Tables created successfully');
  }

  /**
   * Create indexes for frequently queried columns
   */
  private async createIndexes(): Promise<void> {
    const db = this.getDB();

    // Users indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    );

    // Inspections indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspections_userId ON inspections(userId);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspections_scheduledDate ON inspections(scheduledDate);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspections_syncedAt ON inspections(syncedAt);',
    );

    // InspectionRecords indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspectionRecords_inspectionId ON inspectionRecords(inspectionId);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspectionRecords_section ON inspectionRecords(section);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspectionRecords_condition ON inspectionRecords(condition);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_inspectionRecords_syncedAt ON inspectionRecords(syncedAt);',
    );

    // Workflows indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_workflows_userId ON workflows(userId);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_workflows_propertyType ON workflows(propertyType);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_workflows_sharedCode ON workflows(sharedCode);',
    );

    // CSVData indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_csvData_section ON csvData(section);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_csvData_system ON csvData(system);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_csvData_component ON csvData(component);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_csvData_propertyType ON csvData(propertyType);',
    );

    // SyncQueue indexes
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_syncQueue_status ON syncQueue(status);',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_syncQueue_tableName ON syncQueue(tableName);',
    );

    console.log('[DatabaseService] Indexes created successfully');
  }

  // ============================================================================
  // USERS CRUD OPERATIONS
  // ============================================================================

  /**
   * Insert or update user
   */
  async upsertUser(
    user: Omit<User, 'createdAt' | 'updatedAt' | 'syncedAt'>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `INSERT INTO users (id, username, email, businessName, membershipTier, groups, createdAt, updatedAt, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
       ON CONFLICT(id) DO UPDATE SET
         username = excluded.username,
         email = excluded.email,
         businessName = excluded.businessName,
         membershipTier = excluded.membershipTier,
         groups = excluded.groups,
         updatedAt = excluded.updatedAt;`,
      [
        user.id,
        user.username,
        user.email,
        user.businessName,
        user.membershipTier,
        user.groups,
        now,
        now,
      ],
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const db = this.getDB();
    const [result] = await db.executeSql('SELECT * FROM users WHERE id = ?;', [
      userId,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0) as User;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      'SELECT * FROM users WHERE username = ?;',
      [username],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0) as User;
  }

  // ============================================================================
  // INSPECTIONS CRUD OPERATIONS
  // ============================================================================

  /**
   * Create inspection
   */
  async createInspection(
    inspection: Omit<Inspection, 'createdAt' | 'updatedAt' | 'syncedAt'>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `INSERT INTO inspections (
        id, userId, propertyAddress, propertyType, clientName, clientEmail, clientPhone,
        scheduledDate, completedDate, status, workflowId, notes, createdAt, updatedAt, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        inspection.id,
        inspection.userId,
        inspection.propertyAddress,
        inspection.propertyType,
        inspection.clientName,
        inspection.clientEmail,
        inspection.clientPhone,
        inspection.scheduledDate,
        inspection.completedDate,
        inspection.status,
        inspection.workflowId,
        inspection.notes,
        now,
        now,
      ],
    );

    // Add to sync queue
    await this.addToSyncQueue(
      'inspections',
      inspection.id,
      'INSERT',
      inspection,
    );
  }

  /**
   * Update inspection
   */
  async updateInspection(
    id: string,
    updates: Partial<Inspection>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'syncedAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return;
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.executeSql(
      `UPDATE inspections SET ${fields.join(', ')} WHERE id = ?;`,
      values,
    );

    // Add to sync queue
    await this.addToSyncQueue('inspections', id, 'UPDATE', {
      ...updates,
      updatedAt: now,
    });
  }

  /**
   * Get inspection by ID
   */
  async getInspectionById(id: string): Promise<Inspection | null> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      'SELECT * FROM inspections WHERE id = ?;',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0) as Inspection;
  }

  /**
   * Get inspections by user ID
   */
  async getInspectionsByUserId(
    userId: string,
    status?: string,
  ): Promise<Inspection[]> {
    const db = this.getDB();
    let query = 'SELECT * FROM inspections WHERE userId = ?';
    const params: unknown[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY scheduledDate DESC;';

    const [result] = await db.executeSql(query, params);

    const inspections: Inspection[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      inspections.push(result.rows.item(i) as Inspection);
    }

    return inspections;
  }

  /**
   * Delete inspection
   */
  async deleteInspection(id: string): Promise<void> {
    const db = this.getDB();

    await db.executeSql('DELETE FROM inspections WHERE id = ?;', [id]);

    // Add to sync queue
    await this.addToSyncQueue('inspections', id, 'DELETE', { id });
  }

  // ============================================================================
  // INSPECTION RECORDS CRUD OPERATIONS
  // ============================================================================

  /**
   * Create inspection record
   */
  async createInspectionRecord(
    record: Omit<InspectionRecord, 'createdAt' | 'updatedAt' | 'syncedAt'>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `INSERT INTO inspectionRecords (
        id, inspectionId, section, system, location, component, material, condition,
        comment, photoUri, photoS3Key, aiAnalysisData, sequenceNumber, createdAt, updatedAt, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        record.id,
        record.inspectionId,
        record.section,
        record.system,
        record.location,
        record.component,
        record.material,
        record.condition,
        record.comment,
        record.photoUri,
        record.photoS3Key,
        record.aiAnalysisData,
        record.sequenceNumber,
        now,
        now,
      ],
    );

    // Add to sync queue
    await this.addToSyncQueue('inspectionRecords', record.id, 'INSERT', record);
  }

  /**
   * Update inspection record
   */
  async updateInspectionRecord(
    id: string,
    updates: Partial<InspectionRecord>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'syncedAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return;
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.executeSql(
      `UPDATE inspectionRecords SET ${fields.join(', ')} WHERE id = ?;`,
      values,
    );

    // Add to sync queue
    await this.addToSyncQueue('inspectionRecords', id, 'UPDATE', {
      ...updates,
      updatedAt: now,
    });
  }

  /**
   * Get inspection records by inspection ID
   */
  async getInspectionRecords(
    inspectionId: string,
  ): Promise<InspectionRecord[]> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      'SELECT * FROM inspectionRecords WHERE inspectionId = ? ORDER BY sequenceNumber ASC;',
      [inspectionId],
    );

    const records: InspectionRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      records.push(result.rows.item(i) as InspectionRecord);
    }

    return records;
  }

  /**
   * Delete inspection record
   */
  async deleteInspectionRecord(id: string): Promise<void> {
    const db = this.getDB();

    await db.executeSql('DELETE FROM inspectionRecords WHERE id = ?;', [id]);

    // Add to sync queue
    await this.addToSyncQueue('inspectionRecords', id, 'DELETE', { id });
  }

  // ============================================================================
  // WORKFLOWS CRUD OPERATIONS
  // ============================================================================

  /**
   * Create workflow
   */
  async createWorkflow(
    workflow: Omit<Workflow, 'createdAt' | 'updatedAt' | 'syncedAt'>,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `INSERT INTO workflows (
        id, userId, name, description, propertyType, filterConfig, isDefault, isShared,
        sharedCode, createdAt, updatedAt, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        workflow.id,
        workflow.userId,
        workflow.name,
        workflow.description,
        workflow.propertyType,
        workflow.filterConfig,
        workflow.isDefault,
        workflow.isShared,
        workflow.sharedCode,
        now,
        now,
      ],
    );

    // Add to sync queue
    await this.addToSyncQueue('workflows', workflow.id, 'INSERT', workflow);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'syncedAt') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return;
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.executeSql(
      `UPDATE workflows SET ${fields.join(', ')} WHERE id = ?;`,
      values,
    );

    // Add to sync queue
    await this.addToSyncQueue('workflows', id, 'UPDATE', {
      ...updates,
      updatedAt: now,
    });
  }

  /**
   * Get workflows by user ID
   */
  async getWorkflowsByUserId(userId: string): Promise<Workflow[]> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      'SELECT * FROM workflows WHERE userId = ? ORDER BY isDefault DESC, name ASC;',
      [userId],
    );

    const workflows: Workflow[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      workflows.push(result.rows.item(i) as Workflow);
    }

    return workflows;
  }

  /**
   * Get workflow by shared code
   */
  async getWorkflowBySharedCode(sharedCode: string): Promise<Workflow | null> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      'SELECT * FROM workflows WHERE sharedCode = ?;',
      [sharedCode],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows.item(0) as Workflow;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const db = this.getDB();

    await db.executeSql('DELETE FROM workflows WHERE id = ?;', [id]);

    // Add to sync queue
    await this.addToSyncQueue('workflows', id, 'DELETE', { id });
  }

  // ============================================================================
  // CSV DATA OPERATIONS
  // ============================================================================

  /**
   * Bulk insert CSV data (for initial data load)
   */
  async bulkInsertCSVData(data: Omit<CSVData, 'id'>[]): Promise<void> {
    const db = this.getDB();

    // Use transaction for bulk insert
    await db.transaction(async tx => {
      for (const row of data) {
        await tx.executeSql(
          `INSERT INTO csvData (section, system, location, component, material, condition, comment, propertyType)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            row.section,
            row.system,
            row.location,
            row.component,
            row.material,
            row.condition,
            row.comment,
            row.propertyType,
          ],
        );
      }
    });

    console.log(`[DatabaseService] Inserted ${data.length} CSV records`);
  }

  /**
   * Query CSV data with filters
   */
  async queryCSVData(filters: {
    section?: string;
    system?: string;
    component?: string;
    material?: string;
    propertyType?: string;
  }): Promise<CSVData[]> {
    const db = this.getDB();

    let query = 'SELECT * FROM csvData WHERE 1=1';
    const params: unknown[] = [];

    if (filters.section) {
      query += ' AND section = ?';
      params.push(filters.section);
    }

    if (filters.system) {
      query += ' AND system = ?';
      params.push(filters.system);
    }

    if (filters.component) {
      query += ' AND component = ?';
      params.push(filters.component);
    }

    if (filters.material) {
      query += ' AND material = ?';
      params.push(filters.material);
    }

    if (filters.propertyType) {
      query += ' AND propertyType = ?';
      params.push(filters.propertyType);
    }

    query += ' ORDER BY section, system, component, material;';

    const [result] = await db.executeSql(query, params);

    const data: CSVData[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i) as CSVData);
    }

    return data;
  }

  /**
   * Get distinct sections
   */
  async getDistinctSections(propertyType?: string): Promise<string[]> {
    const db = this.getDB();
    let query = 'SELECT DISTINCT section FROM csvData';
    const params: unknown[] = [];

    if (propertyType) {
      query += ' WHERE propertyType = ?';
      params.push(propertyType);
    }

    query += ' ORDER BY section;';

    const [result] = await db.executeSql(query, params);

    const sections: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      sections.push(result.rows.item(i).section);
    }

    return sections;
  }

  /**
   * Get distinct systems for a section
   */
  async getDistinctSystems(
    section: string,
    propertyType?: string,
  ): Promise<string[]> {
    const db = this.getDB();
    let query = 'SELECT DISTINCT system FROM csvData WHERE section = ?';
    const params: unknown[] = [section];

    if (propertyType) {
      query += ' AND propertyType = ?';
      params.push(propertyType);
    }

    query += ' ORDER BY system;';

    const [result] = await db.executeSql(query, params);

    const systems: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      systems.push(result.rows.item(i).system);
    }

    return systems;
  }

  /**
   * Get distinct components for a section and system
   */
  async getDistinctComponents(
    section: string,
    system: string,
    propertyType?: string,
  ): Promise<string[]> {
    const db = this.getDB();
    let query =
      'SELECT DISTINCT component FROM csvData WHERE section = ? AND system = ?';
    const params: unknown[] = [section, system];

    if (propertyType) {
      query += ' AND propertyType = ?';
      params.push(propertyType);
    }

    query += ' ORDER BY component;';

    const [result] = await db.executeSql(query, params);

    const components: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      components.push(result.rows.item(i).component);
    }

    return components;
  }

  /**
   * Get distinct materials for a component
   */
  async getDistinctMaterials(
    section: string,
    system: string,
    component: string,
    propertyType?: string,
  ): Promise<string[]> {
    const db = this.getDB();
    let query =
      'SELECT DISTINCT material FROM csvData WHERE section = ? AND system = ? AND component = ?';
    const params: unknown[] = [section, system, component];

    if (propertyType) {
      query += ' AND propertyType = ?';
      params.push(propertyType);
    }

    query += ' ORDER BY material;';

    const [result] = await db.executeSql(query, params);

    const materials: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      materials.push(result.rows.item(i).material);
    }

    return materials;
  }

  /**
   * Get comments for a specific combination
   */
  async getComments(
    section: string,
    system: string,
    component: string,
    material: string,
    condition: string,
    propertyType?: string,
  ): Promise<string[]> {
    const db = this.getDB();
    let query = `SELECT DISTINCT comment FROM csvData
                 WHERE section = ? AND system = ? AND component = ? AND material = ? AND condition = ?`;
    const params: unknown[] = [section, system, component, material, condition];

    if (propertyType) {
      query += ' AND propertyType = ?';
      params.push(propertyType);
    }

    query += ';';

    const [result] = await db.executeSql(query, params);

    const comments: string[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      comments.push(result.rows.item(i).comment);
    }

    return comments;
  }

  // ============================================================================
  // SYNC QUEUE OPERATIONS
  // ============================================================================

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    data: unknown,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `INSERT INTO syncQueue (tableName, recordId, operation, data, createdAt, attempts, status)
       VALUES (?, ?, ?, ?, ?, 0, 'pending');`,
      [tableName, recordId, operation, JSON.stringify(data), now],
    );
  }

  /**
   * Get pending sync queue items
   */
  async getPendingSyncItems(limit: number = 100): Promise<SyncQueueItem[]> {
    const db = this.getDB();
    const [result] = await db.executeSql(
      `SELECT * FROM syncQueue WHERE status = 'pending' ORDER BY createdAt ASC LIMIT ?;`,
      [limit],
    );

    const items: SyncQueueItem[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i) as SyncQueueItem);
    }

    return items;
  }

  /**
   * Update sync queue item status
   */
  async updateSyncQueueItem(
    id: number,
    status: 'in-progress' | 'completed' | 'failed',
    error?: string,
  ): Promise<void> {
    const db = this.getDB();
    const now = new Date().toISOString();

    await db.executeSql(
      `UPDATE syncQueue SET status = ?, lastAttemptAt = ?, attempts = attempts + 1, error = ? WHERE id = ?;`,
      [status, now, error || null, id],
    );
  }

  /**
   * Delete completed sync queue items
   */
  async cleanupSyncQueue(): Promise<void> {
    const db = this.getDB();

    await db.executeSql(`DELETE FROM syncQueue WHERE status = 'completed';`);
  }

  /**
   * Get sync queue count by status
   */
  async getSyncQueueCount(status?: string): Promise<number> {
    const db = this.getDB();
    let query = 'SELECT COUNT(*) as count FROM syncQueue';
    const params: unknown[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const [result] = await db.executeSql(query, params);

    return result.rows.item(0).count as number;
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<DatabaseStats> {
    const db = this.getDB();

    const [usersResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM users;',
    );
    const [inspectionsResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM inspections;',
    );
    const [recordsResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM inspectionRecords;',
    );
    const [workflowsResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM workflows;',
    );
    const [csvResult] = await db.executeSql(
      'SELECT COUNT(*) as count FROM csvData;',
    );
    const [syncResult] = await db.executeSql(
      "SELECT COUNT(*) as count FROM syncQueue WHERE status = 'pending';",
    );

    return {
      users: usersResult.rows.item(0).count,
      inspections: inspectionsResult.rows.item(0).count,
      inspectionRecords: recordsResult.rows.item(0).count,
      workflows: workflowsResult.rows.item(0).count,
      csvData: csvResult.rows.item(0).count,
      syncQueuePending: syncResult.rows.item(0).count,
    };
  }

  /**
   * Execute raw SQL (for debugging and advanced queries)
   */
  async executeSql(sql: string, params?: unknown[]): Promise<ResultSet[]> {
    const db = this.getDB();
    return db.executeSql(sql, params);
  }

  /**
   * Clear all data (for testing/development only)
   */
  async clearAllData(): Promise<void> {
    const db = this.getDB();

    await db.transaction(async tx => {
      await tx.executeSql('DELETE FROM syncQueue;');
      await tx.executeSql('DELETE FROM inspectionRecords;');
      await tx.executeSql('DELETE FROM inspections;');
      await tx.executeSql('DELETE FROM workflows;');
      await tx.executeSql('DELETE FROM csvData;');
      await tx.executeSql('DELETE FROM users;');
    });

    console.log('[DatabaseService] All data cleared');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('[DatabaseService] Database closed');
    }
  }
}

// Export singleton instance
export const DB = new DatabaseService();

export default DB;
