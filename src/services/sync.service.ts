/**
 * Offline Sync Service
 *
 * Manages synchronization between local SQLite database and backend PostgreSQL.
 * Implements offline-first architecture with automatic background sync,
 * conflict resolution, retry logic, and delta sync.
 *
 * Features:
 * - Background sync scheduling with auto-start
 * - Network connectivity monitoring with NetInfo
 * - Sync queue processing with batch operations
 * - Conflict resolution (last-write-wins strategy)
 * - Exponential backoff retry logic
 * - Delta sync (only changed records)
 * - Graceful error handling
 * - Progress tracking and status reporting
 * - Manual sync trigger support
 *
 * @service
 */

import NetInfo, {
  type NetInfoState,
  type NetInfoSubscription,
} from '@react-native-community/netinfo';
import DB, {type SyncQueueItem} from './database.service';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Sync status for individual records
 */
export type SyncStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

/**
 * Network connectivity state
 */
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

/**
 * Sync configuration options
 */
export interface SyncConfig {
  autoStartEnabled: boolean;
  syncIntervalMinutes: number;
  maxRetries: number;
  initialRetryDelayMs: number;
  maxRetryDelayMs: number;
  batchSize: number;
}

/**
 * Sync progress information
 */
export interface SyncProgress {
  phase:
    | 'idle'
    | 'checking-network'
    | 'fetching-queue'
    | 'syncing'
    | 'complete'
    | 'error';
  totalItems: number;
  processedItems: number;
  successCount: number;
  failedCount: number;
  percentage: number;
  message: string;
  currentItem?: {
    tableName: string;
    recordId: string;
    operation: string;
  };
}

/**
 * Sync result summary
 */
export interface SyncResult {
  success: boolean;
  totalItems: number;
  successCount: number;
  failedCount: number;
  duration: number; // milliseconds
  errors: Array<{
    item: SyncQueueItem;
    error: string;
  }>;
}

/**
 * Progress callback type
 */
export type SyncProgressCallback = (progress: SyncProgress) => void;

// ============================================================================
// SYNC SERVICE CLASS
// ============================================================================

class SyncService {
  private syncInProgress: boolean = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private netInfoUnsubscribe: NetInfoSubscription | null = null;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: null,
    type: 'unknown',
  };
  private progressCallbacks: Set<SyncProgressCallback> = new Set();

  private config: SyncConfig = {
    autoStartEnabled: true,
    syncIntervalMinutes: 5,
    maxRetries: 5,
    initialRetryDelayMs: 1000, // 1 second
    maxRetryDelayMs: 60000, // 1 minute
    batchSize: 50,
  };

  // ============================================================================
  // INITIALIZATION & LIFECYCLE
  // ============================================================================

  /**
   * Initialize sync service with network monitoring
   */
  async initialize(customConfig?: Partial<SyncConfig>): Promise<void> {
    try {
      console.log('[SyncService] Initializing sync service...');

      // Merge custom config
      if (customConfig) {
        this.config = {...this.config, ...customConfig};
      }

      // Start network monitoring
      this.startNetworkMonitoring();

      // Start auto sync if enabled
      if (this.config.autoStartEnabled) {
        await this.startAutoSync();
      }

      console.log('[SyncService] Sync service initialized successfully');
    } catch (error) {
      console.error('[SyncService] Failed to initialize sync service:', error);
      throw error;
    }
  }

  /**
   * Start automatic background sync
   */
  async startAutoSync(): Promise<void> {
    if (this.syncTimer) {
      console.log(
        '[SyncService] Auto sync already running, stopping existing timer',
      );
      this.stopAutoSync();
    }

    console.log(
      `[SyncService] Starting auto sync (interval: ${this.config.syncIntervalMinutes} minutes)`,
    );

    // Set up recurring sync
    this.syncTimer = setInterval(() => {
      this.syncAll().catch(error => {
        console.error('[SyncService] Auto sync failed:', error);
      });
    }, this.config.syncIntervalMinutes * 60 * 1000);

    // Perform initial sync
    await this.syncAll();
  }

  /**
   * Stop automatic background sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('[SyncService] Auto sync stopped');
    }
  }

  /**
   * Start network connectivity monitoring
   */
  private startNetworkMonitoring(): void {
    this.netInfoUnsubscribe = NetInfo.addEventListener(
      (state: NetInfoState) => {
        const wasConnected = this.networkState.isConnected;
        this.networkState = {
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
        };

        console.log(
          `[SyncService] Network state changed: ${JSON.stringify(this.networkState)}`,
        );

        // Trigger sync when connection is restored
        if (!wasConnected && this.networkState.isConnected) {
          console.log(
            '[SyncService] Connection restored, triggering sync...',
          );
          this.syncAll().catch(error => {
            console.error('[SyncService] Connection restore sync failed:', error);
          });
        }
      },
    );
  }

  /**
   * Stop network monitoring
   */
  private stopNetworkMonitoring(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
      console.log('[SyncService] Network monitoring stopped');
    }
  }

  /**
   * Cleanup and shutdown sync service
   */
  async shutdown(): Promise<void> {
    console.log('[SyncService] Shutting down sync service...');

    // Stop auto sync
    this.stopAutoSync();

    // Stop network monitoring
    this.stopNetworkMonitoring();

    // Wait for current sync to complete
    let attempts = 0;
    while (this.syncInProgress && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    // Clear callbacks
    this.progressCallbacks.clear();

    console.log('[SyncService] Sync service shut down');
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  /**
   * Register progress callback
   */
  onProgress(callback: SyncProgressCallback): () => void {
    this.progressCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Report progress to all registered callbacks
   */
  private reportProgress(progress: SyncProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('[SyncService] Progress callback error:', error);
      }
    });
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  /**
   * Perform full synchronization of all pending items
   */
  async syncAll(onProgress?: SyncProgressCallback): Promise<SyncResult> {
    // Register temporary progress callback if provided
    const unsubscribe = onProgress ? this.onProgress(onProgress) : null;

    try {
      // Check if sync is already in progress
      if (this.syncInProgress) {
        console.log('[SyncService] Sync already in progress, skipping...');
        throw new Error('Sync already in progress');
      }

      const startTime = Date.now();
      this.syncInProgress = true;

      // Report initial progress
      this.reportProgress({
        phase: 'checking-network',
        totalItems: 0,
        processedItems: 0,
        successCount: 0,
        failedCount: 0,
        percentage: 0,
        message: 'Checking network connectivity...',
      });

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('[SyncService] No internet connection, skipping sync');
        throw new Error('No internet connection available');
      }

      // Fetch pending sync queue items
      this.reportProgress({
        phase: 'fetching-queue',
        totalItems: 0,
        processedItems: 0,
        successCount: 0,
        failedCount: 0,
        percentage: 5,
        message: 'Fetching pending sync items...',
      });

      const pendingItems = await DB.getPendingSyncItems(this.config.batchSize);

      if (pendingItems.length === 0) {
        console.log('[SyncService] No items to sync');
        const result: SyncResult = {
          success: true,
          totalItems: 0,
          successCount: 0,
          failedCount: 0,
          duration: Date.now() - startTime,
          errors: [],
        };

        this.reportProgress({
          phase: 'complete',
          totalItems: 0,
          processedItems: 0,
          successCount: 0,
          failedCount: 0,
          percentage: 100,
          message: 'No items to sync',
        });

        return result;
      }

      console.log(`[SyncService] Processing ${pendingItems.length} items...`);

      // Process sync items
      const result = await this.processSyncBatch(pendingItems);

      // Report completion
      const duration = Date.now() - startTime;
      this.reportProgress({
        phase: 'complete',
        totalItems: result.totalItems,
        processedItems: result.totalItems,
        successCount: result.successCount,
        failedCount: result.failedCount,
        percentage: 100,
        message: `Sync completed: ${result.successCount} succeeded, ${result.failedCount} failed (${Math.round(duration / 1000)}s)`,
      });

      console.log(
        `[SyncService] Sync completed: ${result.successCount}/${result.totalItems} succeeded in ${duration}ms`,
      );

      return result;
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);

      this.reportProgress({
        phase: 'error',
        totalItems: 0,
        processedItems: 0,
        successCount: 0,
        failedCount: 0,
        percentage: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      throw error;
    } finally {
      this.syncInProgress = false;

      // Unsubscribe temporary callback
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }

  /**
   * Process a batch of sync items
   */
  private async processSyncBatch(
    items: SyncQueueItem[],
  ): Promise<SyncResult> {
    const totalItems = items.length;
    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{item: SyncQueueItem; error: string}> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.reportProgress({
        phase: 'syncing',
        totalItems,
        processedItems: i,
        successCount,
        failedCount,
        percentage: 10 + Math.floor((i / totalItems) * 85),
        message: `Syncing ${item.tableName} ${item.operation}...`,
        currentItem: {
          tableName: item.tableName,
          recordId: item.recordId,
          operation: item.operation,
        },
      });

      try {
        await this.syncItem(item);
        successCount++;

        // Mark as completed and remove from queue
        if (item.id) {
          await DB.updateSyncQueueItem(item.id, 'completed');
        }
        console.log(
          `[SyncService] ✅ Synced ${item.tableName}:${item.recordId} (${item.operation})`,
        );
      } catch (error) {
        failedCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({item, error: errorMessage});

        // Apply retry logic
        const shouldRetry = await this.handleSyncError(item, errorMessage);

        if (shouldRetry) {
          console.log(
            `[SyncService] ⏳ Will retry ${item.tableName}:${item.recordId} later`,
          );
        } else {
          console.error(
            `[SyncService] ❌ Failed ${item.tableName}:${item.recordId} (max retries exceeded)`,
          );
        }
      }
    }

    return {
      success: failedCount === 0,
      totalItems,
      successCount,
      failedCount,
      duration: 0, // Will be set by caller
      errors,
    };
  }

  /**
   * Sync a single item to backend (MOCK - will be replaced with API calls)
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Mark as in-progress
    if (item.id) {
      await DB.updateSyncQueueItem(item.id, 'in-progress');
    }

    // Parse data
    const data = JSON.parse(item.data);

    // MOCK IMPLEMENTATION - Replace with actual API calls
    // TODO: Integrate with backend API client
    console.log(
      `[SyncService] MOCK: Syncing ${item.tableName} ${item.operation}`,
      {
        recordId: item.recordId,
        operation: item.operation,
        dataKeys: Object.keys(data),
      },
    );

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate 90% success rate (for testing)
    if (Math.random() < 0.1) {
      throw new Error('MOCK: Random API failure (10% chance)');
    }

    // REAL IMPLEMENTATION WOULD BE:
    /*
    switch (item.tableName) {
      case 'inspections':
        if (item.operation === 'INSERT') {
          await apiClient.post('/api/inspections', data);
        } else if (item.operation === 'UPDATE') {
          await apiClient.put(`/api/inspections/${item.recordId}`, data);
        } else if (item.operation === 'DELETE') {
          await apiClient.delete(`/api/inspections/${item.recordId}`);
        }
        break;

      case 'inspectionRecords':
        if (item.operation === 'INSERT') {
          await apiClient.post('/api/inspection-records', data);
        } else if (item.operation === 'UPDATE') {
          await apiClient.put(`/api/inspection-records/${item.recordId}`, data);
        } else if (item.operation === 'DELETE') {
          await apiClient.delete(`/api/inspection-records/${item.recordId}`);
        }
        break;

      case 'workflows':
        if (item.operation === 'INSERT') {
          await apiClient.post('/api/workflows', data);
        } else if (item.operation === 'UPDATE') {
          await apiClient.put(`/api/workflows/${item.recordId}`, data);
        } else if (item.operation === 'DELETE') {
          await apiClient.delete(`/api/workflows/${item.recordId}`);
        }
        break;

      default:
        throw new Error(`Unsupported table: ${item.tableName}`);
    }

    // Update local record's syncedAt timestamp
    await this.updateLocalRecordSyncStatus(item.tableName, item.recordId);
    */
  }

  /**
   * Handle sync error with retry logic (exponential backoff)
   */
  private async handleSyncError(
    item: SyncQueueItem,
    error: string,
  ): Promise<boolean> {
    const newAttempts = item.attempts + 1;

    // Check if max retries exceeded
    if (newAttempts >= this.config.maxRetries) {
      if (item.id) {
        await DB.updateSyncQueueItem(item.id, 'failed', error);
      }
      return false; // Don't retry
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.config.initialRetryDelayMs * Math.pow(2, item.attempts),
      this.config.maxRetryDelayMs,
    );

    console.log(
      `[SyncService] Retry ${newAttempts}/${this.config.maxRetries} for ${item.tableName}:${item.recordId} (delay: ${delay}ms)`,
    );

    // Update item with error and new attempt count
    // Note: DB.updateSyncQueueItem only accepts 'in-progress', 'completed', or 'failed'
    // For retry, we mark as 'failed' temporarily, then the next sync will pick it up
    if (item.id) {
      await DB.updateSyncQueueItem(item.id, 'failed', error);
    }

    // Schedule retry (in real app, might use background task scheduler)
    setTimeout(() => {
      this.syncAll().catch(err => {
        console.error('[SyncService] Retry sync failed:', err);
      });
    }, delay);

    return true; // Will retry
  }

  /**
   * Update local record's syncedAt timestamp after successful sync
   * 
   * TODO: Implement when integrating with backend API:
   * 
   * ```typescript
   * const now = new Date().toISOString();
   * switch (tableName) {
   *   case 'inspections':
   *     await DB.executeSql(
   *       'UPDATE inspections SET syncedAt = ? WHERE id = ?',
   *       [now, recordId]
   *     );
   *     break;
   *   case 'inspectionRecords':
   *     await DB.executeSql(
   *       'UPDATE inspectionRecords SET syncedAt = ? WHERE id = ?',
   *       [now, recordId]
   *     );
   *     break;
   *   case 'workflows':
   *     await DB.executeSql(
   *       'UPDATE workflows SET syncedAt = ? WHERE id = ?',
   *       [now, recordId]
   *     );
   *     break;
   * }
   * ```
   */

  // ============================================================================
  // DELTA SYNC
  // ============================================================================

  /**
   * Sync only records modified since last sync (delta sync)
   */
  async syncDelta(sinceTimestamp: string): Promise<SyncResult> {
    console.log(
      `[SyncService] Starting delta sync (since: ${sinceTimestamp})...`,
    );

    // Get items modified since timestamp
    const items = await this.getDeltaSyncItems(sinceTimestamp);

    if (items.length === 0) {
      console.log('[SyncService] No delta changes to sync');
      return {
        success: true,
        totalItems: 0,
        successCount: 0,
        failedCount: 0,
        duration: 0,
        errors: [],
      };
    }

    console.log(
      `[SyncService] Delta sync: ${items.length} items modified since ${sinceTimestamp}`,
    );

    // Process delta items
    return this.processSyncBatch(items);
  }

  /**
   * Get sync queue items created since a specific timestamp
   */
  private async getDeltaSyncItems(
    sinceTimestamp: string,
  ): Promise<SyncQueueItem[]> {
    const results = await DB.executeSql(
      `SELECT * FROM syncQueue 
       WHERE status = 'pending' 
       AND createdAt > ? 
       ORDER BY createdAt ASC 
       LIMIT ?`,
      [sinceTimestamp, this.config.batchSize],
    );

    const items: SyncQueueItem[] = [];
    const rows = results[0].rows;

    for (let i = 0; i < rows.length; i++) {
      items.push(rows.item(i) as SyncQueueItem);
    }

    return items;
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  /**
   * Resolve sync conflict using last-write-wins strategy
   */
  async resolveConflict(
    localItem: SyncQueueItem,
    remoteUpdatedAt: string,
  ): Promise<'local' | 'remote'> {
    // Parse local item data to get updatedAt timestamp
    const localData = JSON.parse(localItem.data);
    const localUpdatedAt = localData.updatedAt || localItem.createdAt;

    // Compare timestamps (last-write-wins)
    const localTime = new Date(localUpdatedAt).getTime();
    const remoteTime = new Date(remoteUpdatedAt).getTime();

    if (localTime > remoteTime) {
      console.log(
        `[SyncService] Conflict resolved: local wins (${localUpdatedAt} > ${remoteUpdatedAt})`,
      );
      return 'local';
    } else {
      console.log(
        `[SyncService] Conflict resolved: remote wins (${remoteUpdatedAt} >= ${localUpdatedAt})`,
      );
      return 'remote';
    }
  }

  // ============================================================================
  // STATUS & DIAGNOSTICS
  // ============================================================================

  /**
   * Get current sync service status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    networkState: NetworkState;
    syncInProgress: boolean;
    config: SyncConfig;
    pendingItems: number;
    failedItems: number;
  }> {
    const pendingItems = await DB.getSyncQueueCount('pending');
    const failedItems = await DB.getSyncQueueCount('failed');

    return {
      isRunning: this.syncTimer !== null,
      networkState: this.networkState,
      syncInProgress: this.syncInProgress,
      config: this.config,
      pendingItems,
      failedItems,
    };
  }

  /**
   * Get sync statistics
   */
  async getStatistics(): Promise<{
    totalPending: number;
    totalFailed: number;
    totalCompleted: number;
    byTable: Record<string, {pending: number; failed: number}>;
  }> {
    const [pendingResult] = await DB.executeSql(
      "SELECT COUNT(*) as count FROM syncQueue WHERE status = 'pending'",
    );
    const [failedResult] = await DB.executeSql(
      "SELECT COUNT(*) as count FROM syncQueue WHERE status = 'failed'",
    );
    const [completedResult] = await DB.executeSql(
      "SELECT COUNT(*) as count FROM syncQueue WHERE status = 'completed'",
    );

    // Get counts by table
    const [byTableResult] = await DB.executeSql(
      `SELECT tableName, status, COUNT(*) as count 
       FROM syncQueue 
       WHERE status IN ('pending', 'failed') 
       GROUP BY tableName, status`,
    );

    const byTable: Record<string, {pending: number; failed: number}> = {};
    for (let i = 0; i < byTableResult.rows.length; i++) {
      const row = byTableResult.rows.item(i);
      if (!byTable[row.tableName]) {
        byTable[row.tableName] = {pending: 0, failed: 0};
      }
      if (row.status === 'pending') {
        byTable[row.tableName].pending = row.count;
      } else if (row.status === 'failed') {
        byTable[row.tableName].failed = row.count;
      }
    }

    return {
      totalPending: pendingResult.rows.item(0).count,
      totalFailed: failedResult.rows.item(0).count,
      totalCompleted: completedResult.rows.item(0).count,
      byTable,
    };
  }

  /**
   * Clean up old completed sync queue items
   */
  async cleanupCompleted(): Promise<number> {
    const [countResult] = await DB.executeSql(
      "SELECT COUNT(*) as count FROM syncQueue WHERE status = 'completed'",
    );
    const count = countResult.rows.item(0).count;

    await DB.cleanupSyncQueue();

    console.log(`[SyncService] Cleaned up ${count} completed sync items`);
    return count;
  }

  /**
   * Retry all failed sync items
   */
  async retryFailed(): Promise<void> {
    console.log('[SyncService] Retrying all failed items...');

    await DB.executeSql(
      "UPDATE syncQueue SET status = 'pending', attempts = 0, error = NULL WHERE status = 'failed'",
    );

    // Trigger sync
    await this.syncAll();
  }

  /**
   * Get network state
   */
  getNetworkState(): NetworkState {
    return this.networkState;
  }

  /**
   * Check if currently syncing
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instance
export const SyncServiceInstance = new SyncService();

export default SyncServiceInstance;
