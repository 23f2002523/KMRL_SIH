// Test script to clean and process existing uploaded data
import Database from 'better-sqlite3';
import { processRecords, generateProcessingSummary } from '@/lib/data-cleaning';
import { insertCleanedData } from '@/lib/db-insertion';

async function processExistingData() {
  const db = new Database('./train-database.sqlite');
  
  console.log('🔄 Processing existing uploaded CSV data...\n');

  try {
    // Get all uploaded CSV data
    const records = db.prepare(`
      SELECT 
        dr.column_data,
        dr.row_index,
        ud.original_name
      FROM document_data_records dr
      JOIN uploaded_documents ud ON dr.document_id = ud.document_id
      WHERE ud.file_type = 'csv'
      ORDER BY dr.row_index ASC
    `).all();

    console.log(`📊 Found ${records.length} records to process`);

    if (records.length === 0) {
      console.log('No CSV data found to process.');
      return;
    }

    // Convert to format expected by cleaning functions
    const rawRecords = records.map((record: any) => {
      try {
        return JSON.parse(record.column_data);
      } catch (e) {
        console.log(`Skipping invalid JSON in record ${record.row_index}`);
        return null;
      }
    }).filter(record => record !== null);

    console.log(`📋 Valid records to process: ${rawRecords.length}`);

    // Determine data type (for our current data, it should be maintenance)
    const dataType = 'maintenance'; // We know our uploaded data is maintenance data

    // Clean and process the data
    console.log('\n🧹 Cleaning data...');
    const cleanedRecords = processRecords(rawRecords, dataType);
    const summary = generateProcessingSummary(cleanedRecords);

    console.log('\n📈 Processing Summary:');
    console.log(`   Total records: ${summary.totalRecords}`);
    console.log(`   Valid records: ${summary.validRecords} (${summary.validPercentage}%)`);
    console.log(`   Invalid records: ${summary.invalidRecords}`);
    
    if (Object.keys(summary.errorTypes).length > 0) {
      console.log('\n   Error types:');
      Object.entries(summary.errorTypes).forEach(([errorType, count]) => {
        console.log(`     - ${errorType}: ${count}`);
      });
    }

    // Show some sample cleaned data
    console.log('\n📋 Sample cleaned records:');
    cleanedRecords.slice(0, 3).forEach((record, index) => {
      console.log(`\n   Record ${index + 1}:`);
      console.log(`     Valid: ${record.isValid}`);
      console.log(`     Original:`, record.original);
      console.log(`     Cleaned:`, record.cleaned);
      if (record.errors.length > 0) {
        console.log(`     Errors:`, record.errors);
      }
    });

    // Insert into main database tables
    console.log('\n💾 Inserting into main database tables...');
    const insertionResult = await insertCleanedData(cleanedRecords, dataType);

    console.log('\n✅ Insertion Results:');
    console.log(`   Success: ${insertionResult.success}`);
    console.log(`   Inserted: ${insertionResult.insertedCount}`);
    console.log(`   Skipped: ${insertionResult.skippedCount}`);
    console.log(`   Details:`, insertionResult.details);
    
    if (insertionResult.errors.length > 0) {
      console.log('\n   Errors:');
      insertionResult.errors.forEach((error, index) => {
        console.log(`     ${index + 1}. ${error}`);
      });
    }

    console.log('\n🎉 Processing completed!');

  } catch (error) {
    console.error('❌ Error processing data:', error);
  } finally {
    db.close();
  }
}

// Run the processing
processExistingData().catch(console.error);