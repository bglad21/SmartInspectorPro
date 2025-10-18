/**
 * CSV Parser Test Script
 * 
 * Tests the CSV parser service to ensure it can:
 * 1. Initialize the database
 * 2. Load CSV data from file
 * 3. Query and validate loaded data
 * 4. Generate statistics
 */

import DB from '../services/database.service';
import CSVParser, { type LoadProgress } from '../services/csv-parser.service';

async function testCSVParser() {
  console.log('='.repeat(60));
  console.log('CSV Parser Service Test');
  console.log('='.repeat(60));

  try {
    // Step 1: Initialize database
    console.log('\n[1] Initializing database...');
    await DB.initialize();
    console.log('✅ Database initialized');

    // Step 2: Check if data already loaded
    console.log('\n[2] Checking current data status...');
    const recommendation = await CSVParser.getLoadingRecommendation();
    console.log(`   - Should Load: ${recommendation.shouldLoad}`);
    console.log(`   - Reason: ${recommendation.reason}`);
    console.log(`   - Record Count: ${recommendation.recordCount}`);

    // Step 3: Load CSV data with progress tracking
    console.log('\n[3] Loading CSV data...');
    
    const progressCallback = (progress: LoadProgress) => {
      console.log(
        `   [${progress.phase.toUpperCase()}] ${progress.percentage}% - ${progress.message}`
      );
    };

    const result = await CSVParser.loadCSVData({
      propertyType: 'single-family',
      clearExisting: true, // Clear existing data for fresh load
      batchSize: 500,
      onProgress: progressCallback,
    });

    if (result.success) {
      console.log(`✅ Successfully loaded ${result.rowCount} records`);
      if (result.errors.length > 0) {
        console.log(`⚠️  Warnings: ${result.errors.length} rows had validation errors`);
        result.errors.slice(0, 5).forEach((error) => {
          console.log(`   - ${error}`);
        });
      }
    } else {
      console.log('❌ Failed to load CSV data');
      result.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
      return;
    }

    // Step 4: Get statistics
    console.log('\n[4] Generating statistics...');
    const stats = await CSVParser.getStatistics();
    console.log(`   - Total Records: ${stats.totalRecords}`);
    console.log(`   - Sections: ${stats.sections.length} (${stats.sections.join(', ')})`);
    console.log(`   - Systems: ${stats.systems.length}`);
    console.log(`   - Components: ${stats.components.length}`);
    console.log(`   - Materials: ${stats.materials.length}`);
    console.log('   - Conditions:');
    console.log(`      * Acceptable: ${stats.conditions.Acceptable}`);
    console.log(`      * Monitor: ${stats.conditions.Monitor}`);
    console.log(`      * Repair/Replace: ${stats.conditions['Repair/Replace']}`);
    console.log(`      * Safety Hazard: ${stats.conditions['Safety Hazard']}`);
    console.log(`      * Access Restricted: ${stats.conditions['Access Restricted']}`);

    // Step 5: Test hierarchical queries
    console.log('\n[5] Testing hierarchical queries...');
    
    const sections = await DB.getDistinctSections('single-family');
    console.log(`   - Found ${sections.length} sections`);
    
    if (sections.length > 0) {
      const firstSection = sections[0];
      console.log(`   - Testing with section: "${firstSection}"`);
      
      const systems = await DB.getDistinctSystems(firstSection, 'single-family');
      console.log(`   - Found ${systems.length} systems in "${firstSection}"`);
      
      if (systems.length > 0) {
        const firstSystem = systems[0];
        console.log(`   - Testing with system: "${firstSystem}"`);
        
        const components = await DB.getDistinctComponents(firstSection, firstSystem, 'single-family');
        console.log(`   - Found ${components.length} components in "${firstSection}" → "${firstSystem}"`);
        
        if (components.length > 0) {
          const firstComponent = components[0];
          console.log(`   - Testing with component: "${firstComponent}"`);
          
          const materials = await DB.getDistinctMaterials(
            firstSection,
            firstSystem,
            firstComponent,
            'single-family'
          );
          console.log(
            `   - Found ${materials.length} materials in "${firstSection}" → "${firstSystem}" → "${firstComponent}"`
          );
          console.log(`   - Materials: ${materials.join(', ')}`);
        }
      }
    }

    // Step 6: Get sample data
    console.log('\n[6] Getting sample data...');
    const sampleData = await CSVParser.getSampleData(5, 'single-family');
    console.log(`   - Retrieved ${sampleData.length} sample records`);
    
    if (sampleData.length > 0) {
      const sample = sampleData[0];
      console.log('   - Sample Record:');
      console.log(`      * Section: ${sample.section}`);
      console.log(`      * System: ${sample.system}`);
      console.log(`      * Location: ${sample.location || 'N/A'}`);
      console.log(`      * Component: ${sample.component}`);
      console.log(`      * Material: ${sample.material}`);
      console.log(`      * Condition: ${sample.condition}`);
      console.log(`      * Comment: ${sample.comment.substring(0, 60)}...`);
    }

    // Step 7: Verify database statistics match
    console.log('\n[7] Verifying database integrity...');
    const dbStats = await DB.getStatistics();
    console.log(`   - Database total records: ${dbStats.csvData}`);
    console.log(`   - CSV parser total records: ${stats.totalRecords}`);
    
    if (dbStats.csvData === stats.totalRecords) {
      console.log('✅ Database integrity verified - counts match');
    } else {
      console.log('❌ Database integrity issue - counts do not match');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Clean up
    await DB.close();
  }
}

// Run tests
testCSVParser().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export default testCSVParser;
