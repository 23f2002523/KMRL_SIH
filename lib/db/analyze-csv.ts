// Analyze uploaded CSV data structure
import Database from 'better-sqlite3';

const db = new Database('./train-database.sqlite');

console.log('🔍 Analyzing uploaded CSV data structure...\n');

// Get the first few records to understand structure
const records = db.prepare(`
  SELECT 
    column_data,
    data_type,
    row_index
  FROM document_data_records 
  ORDER BY row_index ASC 
  LIMIT 10
`).all();

console.log('📊 Sample data records:');
records.forEach((record: any, index: number) => {
  console.log(`\nRecord ${index + 1} (Row ${record.row_index}):`);
  try {
    const data = JSON.parse(record.column_data);
    console.log('Columns:', Object.keys(data));
    console.log('Values:', Object.values(data));
    console.log('Data type:', record.data_type);
  } catch (e) {
    console.log('Raw data:', record.column_data);
  }
});

// Get all unique columns from the data
console.log('\n📋 All unique columns found:');
const allRecords = db.prepare('SELECT column_data FROM document_data_records').all();
const allColumns = new Set<string>();

allRecords.forEach((record: any) => {
  try {
    const data = JSON.parse(record.column_data);
    Object.keys(data).forEach(key => allColumns.add(key));
  } catch (e) {
    // Skip invalid JSON
  }
});

Array.from(allColumns).forEach((col, index) => {
  console.log(`${index + 1}. ${col}`);
});

db.close();
console.log('\n✅ Analysis completed!');