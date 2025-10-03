import Database from 'better-sqlite3';

const db = new Database('./train-database.sqlite');

try {
  console.log('🔍 Checking train_users table...\n');
  
  // Check table structure
  const tableInfo = db.prepare("PRAGMA table_info(train_users)").all();
  console.log('📋 Table structure:');
  tableInfo.forEach((col: any) => console.log(`   - ${col.name} (${col.type})`));
  
  // Check users
  const users = db.prepare('SELECT * FROM train_users').all();
  console.log('\n👥 Users in database:');
  users.forEach((user: any) => {
    console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
  });
  
  console.log(`\n✅ Found ${users.length} users in database`);
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  db.close();
}