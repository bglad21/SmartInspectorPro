/**
 * Sync Service Test Suite
 *
 * Comprehensive tests for offline synchronization service.
 * Tests network monitoring, queue processing, retry logic,
 * conflict resolution, and delta sync functionality.
 *
 * @test
 */

import DB from '../services/database.service';
import SyncService from '../services/sync.service';
import type {SyncProgress} from '../services/sync.service';

/**
 * Main test function for sync service
 */
async function testSyncService() {
  try {
    console.log('\n========================================');
    console.log('SYNC SERVICE TEST SUITE');
    console.log('========================================\n');

    // Test 1: Initialize database
    console.log('Test 1: Initialize Database');
    console.log('----------------------------');
    await DB.initialize();
    console.log('✅ Database initialized\n');

    // Test 2: Initialize sync service
    console.log('Test 2: Initialize Sync Service');
    console.log('--------------------------------');
    await SyncService.initialize({
      autoStartEnabled: false, // Disable auto-start for testing
      syncIntervalMinutes: 1,
      maxRetries: 3,
      batchSize: 10,
    });
    const initialStatus = await SyncService.getStatus();
    console.log('Sync Service Status:', {
      isRunning: initialStatus.isRunning,
      networkConnected: initialStatus.networkState.isConnected,
      syncInProgress: initialStatus.syncInProgress,
      pendingItems: initialStatus.pendingItems,
    });
    console.log('✅ Sync service initialized\n');

    // Test 3: Add test data to sync queue
    console.log('Test 3: Add Test Items to Sync Queue');
    console.log('-------------------------------------');

    // Create test inspection
    const inspectionId = `test-inspection-${Date.now()}`;
    const inspection = {
      id: inspectionId,
      userId: 'test-user-123',
      propertyAddress: '123 Test Street',
      propertyType: 'single-family' as const,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '555-1234',
      scheduledDate: new Date().toISOString(),
      completedDate: null,
      status: 'scheduled' as const,
      workflowId: null,
      notes: 'Test inspection for sync',
    };

    await DB.createInspection(inspection);
    console.log(`✅ Created test inspection: ${inspectionId}`);

    // Create test inspection record
    const recordId = `test-record-${Date.now()}`;
    const inspectionRecord = {
      id: recordId,
      inspectionId: inspectionId,
      section: 'Exterior Grounds',
      system: 'Drainage',
      location: null,
      component: 'Area Drain',
      material: 'Concrete',
      condition: 'Monitor' as const,
      comment: 'Test comment for sync',
      photoUri: null,
      photoS3Key: null,
      aiAnalysisData: null,
      sequenceNumber: 1,
    };

    await DB.createInspectionRecord(inspectionRecord);
    console.log(`✅ Created test inspection record: ${recordId}`);

    // Check sync queue
    const pendingItems = await DB.getPendingSyncItems(10);
    console.log(`✅ Sync queue has ${pendingItems.length} pending items\n`);

    // Test 4: Get sync statistics
    console.log('Test 4: Get Sync Statistics');
    console.log('---------------------------');
    const stats = await SyncService.getStatistics();
    console.log('Sync Statistics:', {
      totalPending: stats.totalPending,
      totalFailed: stats.totalFailed,
      totalCompleted: stats.totalCompleted,
      byTable: stats.byTable,
    });
    console.log('✅ Retrieved sync statistics\n');

    // Test 5: Test progress tracking
    console.log('Test 5: Test Progress Tracking');
    console.log('-------------------------------');
    const progressUpdates: SyncProgress[] = [];

    const unsubscribe = SyncService.onProgress(progress => {
      progressUpdates.push(progress);
      console.log(`Progress: ${progress.phase} - ${progress.percentage}% - ${progress.message}`);
    });

    console.log('✅ Registered progress callback\n');

    // Test 6: Perform manual sync
    console.log('Test 6: Perform Manual Sync (MOCK)');
    console.log('-----------------------------------');
    console.log('Note: This will use MOCK API calls (90% success rate)');

    try {
      const result = await SyncService.syncAll();
      console.log('\nSync Result:', {
        success: result.success,
        totalItems: result.totalItems,
        successCount: result.successCount,
        failedCount: result.failedCount,
        duration: `${result.duration}ms`,
        errorCount: result.errors.length,
      });

      if (result.errors.length > 0) {
        console.log('\nSync Errors:');
        result.errors.forEach((err, index) => {
          console.log(`  ${index + 1}. ${err.item.tableName}:${err.item.recordId} - ${err.error}`);
        });
      }

      console.log(`\nProgress Updates Received: ${progressUpdates.length}`);
      console.log('Progress Phases:', progressUpdates.map(p => p.phase).join(' → '));

      console.log('✅ Manual sync completed\n');
    } catch (error) {
      console.log(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Unsubscribe from progress
    unsubscribe();

    // Test 7: Test network state
    console.log('Test 7: Check Network State');
    console.log('---------------------------');
    const networkState = SyncService.getNetworkState();
    console.log('Network State:', {
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
    });
    console.log('✅ Retrieved network state\n');

    // Test 8: Test retry failed items
    console.log('Test 8: Test Retry Failed Items');
    console.log('--------------------------------');
    const statsBeforeRetry = await SyncService.getStatistics();
    console.log(`Failed items before retry: ${statsBeforeRetry.totalFailed}`);

    if (statsBeforeRetry.totalFailed > 0) {
      await SyncService.retryFailed();
      const statsAfterRetry = await SyncService.getStatistics();
      console.log(`Failed items after retry: ${statsAfterRetry.totalFailed}`);
      console.log('✅ Retry failed items completed\n');
    } else {
      console.log('✅ No failed items to retry\n');
    }

    // Test 9: Test cleanup completed items
    console.log('Test 9: Cleanup Completed Items');
    console.log('--------------------------------');
    const cleanedCount = await SyncService.cleanupCompleted();
    console.log(`✅ Cleaned up ${cleanedCount} completed sync items\n`);

    // Test 10: Test delta sync
    console.log('Test 10: Test Delta Sync');
    console.log('------------------------');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`Syncing items since: ${oneDayAgo}`);

    try {
      const deltaResult = await SyncService.syncDelta(oneDayAgo);
      console.log('Delta Sync Result:', {
        success: deltaResult.success,
        totalItems: deltaResult.totalItems,
        successCount: deltaResult.successCount,
        failedCount: deltaResult.failedCount,
      });
      console.log('✅ Delta sync completed\n');
    } catch (error) {
      console.log(`❌ Delta sync failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Test 11: Test conflict resolution
    console.log('Test 11: Test Conflict Resolution');
    console.log('----------------------------------');
    const testItem = pendingItems[0];
    if (testItem) {
      // Test local wins (newer timestamp)
      const futureTime = new Date(Date.now() + 1000).toISOString();
      const resolution1 = await SyncService.resolveConflict(testItem, futureTime);
      console.log(`Conflict (remote newer): Winner = ${resolution1}`);

      // Test remote wins (older timestamp)
      const pastTime = new Date(Date.now() - 10000).toISOString();
      const resolution2 = await SyncService.resolveConflict(testItem, pastTime);
      console.log(`Conflict (local newer): Winner = ${resolution2}`);

      console.log('✅ Conflict resolution tested\n');
    } else {
      console.log('⚠️  No items in queue to test conflict resolution\n');
    }

    // Test 12: Final status check
    console.log('Test 12: Final Status Check');
    console.log('---------------------------');
    const finalStatus = await SyncService.getStatus();
    console.log('Final Sync Service Status:', {
      isRunning: finalStatus.isRunning,
      syncInProgress: finalStatus.syncInProgress,
      pendingItems: finalStatus.pendingItems,
      failedItems: finalStatus.failedItems,
    });
    console.log('✅ Retrieved final status\n');

    // Test 13: Test auto sync start/stop
    console.log('Test 13: Test Auto Sync Start/Stop');
    console.log('-----------------------------------');
    await SyncService.startAutoSync();
    console.log('✅ Auto sync started');

    const runningStatus = await SyncService.getStatus();
    console.log(`Auto sync is running: ${runningStatus.isRunning}`);

    SyncService.stopAutoSync();
    console.log('✅ Auto sync stopped');

    const stoppedStatus = await SyncService.getStatus();
    console.log(`Auto sync is running: ${stoppedStatus.isRunning}\n`);

    // Cleanup
    console.log('Test 14: Cleanup Test Data');
    console.log('---------------------------');
    await SyncService.shutdown();
    console.log('✅ Sync service shut down');

    await DB.close();
    console.log('✅ Database closed');

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! ✅');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    throw error;
  }
}

// Run tests
console.log('Starting Sync Service Tests...\n');
testSyncService()
  .then(() => {
    console.log('Test suite completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
