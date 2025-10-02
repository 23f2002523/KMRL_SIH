// Fixed script to query actual database data with correct column names
import Database from 'better-sqlite3';
import path from 'path';

// Path to the SQLite database file
const dbPath = path.join(process.cwd(), 'train-database.sqlite');

try {
  // Open the database
  const db = new Database(dbPath);
  
  console.log('🔍 Database file found at:', dbPath);
  console.log('📊 Database size:', (db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get() as any).size, 'bytes');
  
  // Query all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{name: string}>;
  console.log('\n📋 Tables in database:');
  tables.forEach(table => console.log(`   - ${table.name}`));
  
  // First, let's check the structure of train_users table
  console.log('\n🔍 Checking train_users table structure:');
  const userTableInfo = db.prepare("PRAGMA table_info(train_users)").all();
  console.log('Columns in train_users:', userTableInfo.map((col: any) => col.name).join(', '));
  
  // Query users table with correct columns
  if (userTableInfo.length > 0) {
    console.log('\n👥 Users in database:');
    const users = db.prepare('SELECT * FROM train_users LIMIT 5').all();
    users.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. User:`, JSON.stringify(user, null, 2));
    });
  }
  
  // Check other tables structure
  const importantTables = ['trainsets', 'system_alerts', 'cleaning_slots', 'job_cards'];
  
  for (const tableName of importantTables) {
    const tableExists = tables.find(t => t.name === tableName);
    if (tableExists) {
      console.log(`\n🔍 ${tableName} table structure:`);
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
      console.log(`Columns: ${tableInfo.map((col: any) => col.name).join(', ')}`);
      
      const sampleData = db.prepare(`SELECT * FROM ${tableName} LIMIT 3`).all();
      if (sampleData.length > 0) {
        console.log(`Sample data:`);
        sampleData.forEach((row: any, index: number) => {
          console.log(`   ${index + 1}.`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('   No data found in this table');
      }
    }
  }
  
  console.log('\n✅ Database query completed successfully!');
  
  db.close();
} catch (error) {
  console.error('❌ Error querying database:', error);
}