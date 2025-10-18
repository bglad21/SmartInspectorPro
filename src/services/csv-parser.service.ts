/**
 * CSV Parser Service
 * 
 * Provides CSV parsing and loading capabilities for Smart Inspector Pro.
 * Loads inspection data from Single_Family.csv into SQLite database.
 * 
 * Features:
 * - Parse CSV files with Papa Parse
 * - Load from app bundle or external storage
 * - Bulk insert into SQLite with progress tracking
 * - Type-safe parsing with validation
 * - Error handling and retry logic
 * 
 * @service
 */

import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import DB, { type CSVData } from './database.service';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * CSV row from Single_Family.csv
 */
interface CSVRow {
  Section: string;
  System: string;
  Location: string;
  Component: string;
  Material: string;
  Condition: 'Acceptable' | 'Monitor' | 'Repair/Replace' | 'Safety Hazard' | 'Access Restricted';
  Comment: string;
}

/**
 * CSV parsing result
 */
interface ParseResult {
  success: boolean;
  rowCount: number;
  errors: string[];
  data?: Omit<CSVData, 'id'>[];
}

/**
 * CSV loading progress
 */
interface LoadProgress {
  phase: 'reading' | 'parsing' | 'inserting' | 'complete' | 'error';
  totalRows: number;
  processedRows: number;
  percentage: number;
  message: string;
}

/**
 * CSV loading options
 */
interface LoadOptions {
  propertyType?: 'single-family' | 'multi-family' | 'commercial';
  clearExisting?: boolean;
  batchSize?: number;
  onProgress?: (progress: LoadProgress) => void;
}

/**
 * CSV statistics
 */
interface CSVStatistics {
  totalRecords: number;
  sections: string[];
  systems: string[];
  components: string[];
  materials: string[];
  conditions: {
    Acceptable: number;
    Monitor: number;
    'Repair/Replace': number;
    'Safety Hazard': number;
    'Access Restricted': number;
  };
}

// ============================================================================
// CSV PARSER SERVICE CLASS
// ============================================================================

class CSVParserService {
  private readonly CSV_FILE_NAME = 'single_family_sample.csv'; // Use sample for testing
  private readonly BATCH_SIZE = 500; // Insert 500 records at a time

  /**
   * Load CSV file from app bundle and insert into database
   * 
   * @param options Loading options with progress callback
   * @returns Promise<ParseResult>
   */
  async loadCSVData(options: LoadOptions = {}): Promise<ParseResult> {
    const {
      propertyType = 'single-family',
      clearExisting = false,
      batchSize = this.BATCH_SIZE,
      onProgress,
    } = options;

    try {
      // Phase 1: Read CSV file
      this.reportProgress(onProgress, {
        phase: 'reading',
        totalRows: 0,
        processedRows: 0,
        percentage: 0,
        message: 'Reading CSV file from app bundle...',
      });

      const csvContent = await this.readCSVFile();

      // Phase 2: Parse CSV
      this.reportProgress(onProgress, {
        phase: 'parsing',
        totalRows: 0,
        processedRows: 0,
        percentage: 10,
        message: 'Parsing CSV data...',
      });

      const parseResult = await this.parseCSV(csvContent, propertyType);

      if (!parseResult.success || !parseResult.data) {
        return parseResult;
      }

      // Clear existing data if requested
      if (clearExisting) {
        await this.clearCSVData();
      }

      // Phase 3: Insert into database
      const totalRows = parseResult.data.length;
      const batches = Math.ceil(totalRows / batchSize);

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalRows);
        const batch = parseResult.data.slice(start, end);

        await DB.bulkInsertCSVData(batch);

        const processedRows = end;
        const percentage = 10 + Math.floor((processedRows / totalRows) * 85); // 10% to 95%

        this.reportProgress(onProgress, {
          phase: 'inserting',
          totalRows,
          processedRows,
          percentage,
          message: `Inserting records ${processedRows} of ${totalRows}...`,
        });
      }

      // Phase 4: Complete
      this.reportProgress(onProgress, {
        phase: 'complete',
        totalRows,
        processedRows: totalRows,
        percentage: 100,
        message: `Successfully loaded ${totalRows} records`,
      });

      console.log(`[CSVParserService] Successfully loaded ${totalRows} records`);

      return {
        success: true,
        rowCount: totalRows,
        errors: [],
        data: parseResult.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.reportProgress(onProgress, {
        phase: 'error',
        totalRows: 0,
        processedRows: 0,
        percentage: 0,
        message: `Error: ${errorMessage}`,
      });

      console.error('[CSVParserService] Failed to load CSV data:', error);

      return {
        success: false,
        rowCount: 0,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Read CSV file from app bundle
   * 
   * @returns Promise<string> - CSV file content
   */
  private async readCSVFile(): Promise<string> {
    try {
      // Try to read from app bundle (iOS) or assets (Android)
      let csvPath: string;

      if (RNFS.MainBundlePath) {
        // iOS: Read from main bundle
        csvPath = `${RNFS.MainBundlePath}/${this.CSV_FILE_NAME}`;
      } else {
        // Android: Read from assets
        csvPath = `${RNFS.DocumentDirectoryPath}/../${this.CSV_FILE_NAME}`;
      }

      // Check if file exists
      const exists = await RNFS.exists(csvPath);
      if (!exists) {
        // Fallback: Try Docs folder (development)
        csvPath = `${RNFS.DocumentDirectoryPath}/../../Docs/${this.CSV_FILE_NAME}`;
        const docsExists = await RNFS.exists(csvPath);
        
        if (!docsExists) {
          throw new Error(`CSV file not found: ${this.CSV_FILE_NAME}`);
        }
      }

      console.log(`[CSVParserService] Reading CSV from: ${csvPath}`);

      const content = await RNFS.readFile(csvPath, 'utf8');
      
      console.log(`[CSVParserService] Read ${content.length} bytes`);

      return content;
    } catch (error) {
      console.error('[CSVParserService] Failed to read CSV file:', error);
      throw error;
    }
  }

  /**
   * Parse CSV content into typed objects
   * 
   * @param csvContent CSV file content as string
   * @param propertyType Property type to assign to all records
   * @returns Promise<ParseResult>
   */
  private async parseCSV(
    csvContent: string,
    propertyType: 'single-family' | 'multi-family' | 'commercial'
  ): Promise<ParseResult> {
    return new Promise((resolve) => {
      const errors: string[] = [];
      const validData: Omit<CSVData, 'id'>[] = [];

      Papa.parse<CSVRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          console.log(`[CSVParserService] Parsed ${results.data.length} rows`);

          // Validate and transform each row
          results.data.forEach((row, index) => {
            try {
              const validatedRow = this.validateAndTransformRow(row, propertyType);
              validData.push(validatedRow);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errors.push(`Row ${index + 2}: ${errorMessage}`); // +2 for header and 0-index
            }
          });

          // Report parsing errors (if any)
          if (results.errors.length > 0) {
            results.errors.forEach((error) => {
              errors.push(`Parse error: ${error.message}`);
            });
          }

          console.log(`[CSVParserService] Validated ${validData.length} records, ${errors.length} errors`);

          resolve({
            success: errors.length === 0 || validData.length > 0,
            rowCount: validData.length,
            errors,
            data: validData,
          });
        },
        error: (error: Error) => {
          console.error('[CSVParserService] Papa Parse error:', error);
          resolve({
            success: false,
            rowCount: 0,
            errors: [error.message],
          });
        },
      });
    });
  }

  /**
   * Validate and transform CSV row to database format
   * 
   * @param row CSV row data
   * @param propertyType Property type
   * @returns Validated CSVData object
   */
  private validateAndTransformRow(
    row: CSVRow,
    propertyType: 'single-family' | 'multi-family' | 'commercial'
  ): Omit<CSVData, 'id'> {
    // Validate required fields
    if (!row.Section || row.Section === '') {
      throw new Error('Section is required');
    }

    if (!row.System || row.System === '') {
      throw new Error('System is required');
    }

    if (!row.Component || row.Component === '') {
      throw new Error('Component is required');
    }

    if (!row.Material || row.Material === '') {
      throw new Error('Material is required');
    }

    if (!row.Condition) {
      throw new Error('Condition is required');
    }

    if (!row.Comment || row.Comment === '') {
      throw new Error('Comment is required');
    }

    // Validate condition enum
    const validConditions = ['Acceptable', 'Monitor', 'Repair/Replace', 'Safety Hazard', 'Access Restricted'];
    if (!validConditions.includes(row.Condition)) {
      throw new Error(`Invalid condition: ${row.Condition}`);
    }

    // Transform "Null" location to null
    const location = row.Location === 'Null' ? null : row.Location;

    return {
      section: row.Section,
      system: row.System,
      location,
      component: row.Component,
      material: row.Material,
      condition: row.Condition as CSVData['condition'],
      comment: row.Comment,
      propertyType,
    };
  }

  /**
   * Report progress to callback
   */
  private reportProgress(
    callback: ((progress: LoadProgress) => void) | undefined,
    progress: LoadProgress
  ): void {
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Clear all CSV data from database
   */
  private async clearCSVData(): Promise<void> {
    console.log('[CSVParserService] Clearing existing CSV data...');
    await DB.executeSql('DELETE FROM csvData;');
  }

  /**
   * Get CSV data statistics
   */
  async getStatistics(): Promise<CSVStatistics> {
    const [countResult] = await DB.executeSql('SELECT COUNT(*) as count FROM csvData;');
    const totalRecords = countResult.rows.item(0).count;

    const sections = await DB.getDistinctSections();

    // Get all distinct values
    const [systemsResult] = await DB.executeSql('SELECT DISTINCT system FROM csvData ORDER BY system;');
    const systems: string[] = [];
    for (let i = 0; i < systemsResult.rows.length; i++) {
      systems.push(systemsResult.rows.item(i).system);
    }

    const [componentsResult] = await DB.executeSql('SELECT DISTINCT component FROM csvData ORDER BY component;');
    const components: string[] = [];
    for (let i = 0; i < componentsResult.rows.length; i++) {
      components.push(componentsResult.rows.item(i).component);
    }

    const [materialsResult] = await DB.executeSql('SELECT DISTINCT material FROM csvData ORDER BY material;');
    const materials: string[] = [];
    for (let i = 0; i < materialsResult.rows.length; i++) {
      materials.push(materialsResult.rows.item(i).material);
    }

    // Get condition counts
    const [conditionsResult] = await DB.executeSql(`
      SELECT 
        condition,
        COUNT(*) as count
      FROM csvData
      GROUP BY condition;
    `);

    const conditions = {
      Acceptable: 0,
      Monitor: 0,
      'Repair/Replace': 0,
      'Safety Hazard': 0,
      'Access Restricted': 0,
    };

    for (let i = 0; i < conditionsResult.rows.length; i++) {
      const row = conditionsResult.rows.item(i);
      conditions[row.condition as keyof typeof conditions] = row.count;
    }

    return {
      totalRecords,
      sections,
      systems,
      components,
      materials,
      conditions,
    };
  }

  /**
   * Check if CSV data is loaded
   */
  async isDataLoaded(): Promise<boolean> {
    const [result] = await DB.executeSql('SELECT COUNT(*) as count FROM csvData;');
    const count = result.rows.item(0).count;
    return count > 0;
  }

  /**
   * Get data loading recommendation
   */
  async getLoadingRecommendation(): Promise<{
    shouldLoad: boolean;
    reason: string;
    recordCount: number;
  }> {
    const isLoaded = await this.isDataLoaded();
    
    if (!isLoaded) {
      return {
        shouldLoad: true,
        reason: 'No CSV data found in database. Load data to enable inspection workflows.',
        recordCount: 0,
      };
    }

    const [result] = await DB.executeSql('SELECT COUNT(*) as count FROM csvData;');
    const count = result.rows.item(0).count;

    return {
      shouldLoad: false,
      reason: `CSV data already loaded with ${count} records.`,
      recordCount: count,
    };
  }

  /**
   * Export CSV data to file (for backup or sharing)
   */
  async exportToCSV(filePath: string, propertyType?: string): Promise<boolean> {
    try {
      console.log(`[CSVParserService] Exporting CSV data to: ${filePath}`);

      // Query data from database
      const data = await DB.queryCSVData({ propertyType });

      // Convert to CSV format
      const csvRows = data.map((row) => ({
        Section: row.section,
        System: row.system,
        Location: row.location || 'Null',
        Component: row.component,
        Material: row.material,
        Condition: row.condition,
        Comment: row.comment,
      }));

      // Generate CSV content with Papa Parse
      const csvContent = Papa.unparse(csvRows, {
        header: true,
        columns: ['Section', 'System', 'Location', 'Component', 'Material', 'Condition', 'Comment'],
      });

      // Write to file
      await RNFS.writeFile(filePath, csvContent, 'utf8');

      console.log(`[CSVParserService] Exported ${data.length} records`);

      return true;
    } catch (error) {
      console.error('[CSVParserService] Failed to export CSV:', error);
      return false;
    }
  }

  /**
   * Validate CSV file before loading
   */
  async validateCSVFile(filePath: string): Promise<{
    valid: boolean;
    errors: string[];
    rowCount: number;
  }> {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      const parseResult = await this.parseCSV(content, 'single-family');

      return {
        valid: parseResult.success,
        errors: parseResult.errors,
        rowCount: parseResult.rowCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        valid: false,
        errors: [errorMessage],
        rowCount: 0,
      };
    }
  }

  /**
   * Get sample CSV data for preview (first N records)
   */
  async getSampleData(limit: number = 10, propertyType?: string): Promise<CSVData[]> {
    let query = 'SELECT * FROM csvData';
    const params: unknown[] = [];

    if (propertyType) {
      query += ' WHERE propertyType = ?';
      params.push(propertyType);
    }

    query += ` LIMIT ${limit};`;

    const [result] = await DB.executeSql(query, params);

    const data: CSVData[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      data.push(result.rows.item(i) as CSVData);
    }

    return data;
  }
}

// Export singleton instance
export const CSVParser = new CSVParserService();

export default CSVParser;

// Export types
export type {
  CSVRow,
  ParseResult,
  LoadProgress,
  LoadOptions,
  CSVStatistics,
};
