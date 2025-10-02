// Script to check uploaded documents in database
import Database from 'better-sqlite3';
import path from 'path';

// Path to the SQLite database file
const dbPath = path.join(process.cwd(), 'train-database.sqlite');

try {
  // Open the database
  const db = new Database(dbPath);
  
  console.log('🔍 Checking uploaded documents in database...\n');
  
  // Check if upload tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%document%'").all() as Array<{name: string}>;
  console.log('📋 Upload-related tables:');
  tables.forEach(table => console.log(`   - ${table.name}`));
  
  if (tables.length === 0) {
    console.log('❌ No upload tables found in database!');
    db.close();
    process.exit(0);
  }
  
  // Check uploaded_documents table
  console.log('\n📄 UPLOADED DOCUMENTS:');
  const documents = db.prepare('SELECT * FROM uploaded_documents ORDER BY created_at DESC').all();
  
  if (documents.length === 0) {
    console.log('   No documents uploaded yet.');
  } else {
    documents.forEach((doc: any, index: number) => {
      console.log(`\n   ${index + 1}. Document ID: ${doc.document_id}`);
      console.log(`      File: ${doc.original_name} (${doc.file_type})`);
      console.log(`      Size: ${(doc.file_size / 1024).toFixed(2)} KB`);
      console.log(`      Status: ${doc.processing_status}`);
      console.log(`      Records Processed: ${doc.records_processed || 0}`);
      console.log(`      Uploaded: ${new Date(doc.created_at * 1000).toLocaleString()}`);
      if (doc.error_message) {
        console.log(`      Error: ${doc.error_message}`);
      }
    });
  }
  
  // Check document_data_records table
  console.log('\n📊 PARSED DATA RECORDS:');
  const records = db.prepare('SELECT COUNT(*) as count FROM document_data_records').get() as { count: number };
  console.log(`   Total parsed records: ${records.count}`);
  
  if (records.count > 0) {
    // Show sample records
    const sampleRecords = db.prepare(`
      SELECT 
        dr.*,
        ud.original_name 
      FROM document_data_records dr
      JOIN uploaded_documents ud ON dr.document_id = ud.document_id
      ORDER BY dr.created_at DESC 
      LIMIT 5
    `).all();
    
    console.log('\n   📋 Sample parsed records:');
    sampleRecords.forEach((record: any, index: number) => {
      console.log(`\n      ${index + 1}. Record ID: ${record.record_id}`);
      console.log(`         From file: ${record.original_name}`);
      console.log(`         Row: ${record.row_index}`);
      console.log(`         Data type: ${record.data_type}`);
      console.log(`         Valid: ${record.is_valid ? 'Yes' : 'No'}`);
      
      // Parse and show column data (first 100 chars)
      try {
        const columnData = JSON.parse(record.column_data);
        const dataPreview = JSON.stringify(columnData).substring(0, 100) + '...';
        console.log(`         Data: ${dataPreview}`);
      } catch (e) {
        console.log(`         Data: ${record.column_data.substring(0, 100)}...`);
      }
    });
  }
  
  // Show user upload statistics
  console.log('\n👥 UPLOAD STATISTICS BY USER:');
  const userStats = db.prepare(`
    SELECT 
      tu.name,
      tu.email,
      COUNT(ud.document_id) as upload_count,
      SUM(ud.file_size) as total_size
    FROM train_users tu
    LEFT JOIN uploaded_documents ud ON tu.user_id = ud.uploaded_by
    GROUP BY tu.user_id, tu.name, tu.email
    HAVING upload_count > 0
    ORDER BY upload_count DESC
  `).all();
  
  if (userStats.length === 0) {
    console.log('   No users have uploaded files yet.');
  } else {
    userStats.forEach((stat: any, index: number) => {
      console.log(`   ${index + 1}. ${stat.name} (${stat.email})`);
      console.log(`      Uploads: ${stat.upload_count}`);
      console.log(`      Total size: ${(stat.total_size / 1024 / 1024).toFixed(2)} MB`);
    });
  }
  
  console.log('\n✅ Database check completed!');
  
  db.close();
} catch (error) {
  console.error('❌ Error checking database:', error);
}