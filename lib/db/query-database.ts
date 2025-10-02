// Simple script to query actual database data
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
  
  // Query users table
  console.log('\n👥 Users in database:');
  const users = db.prepare('SELECT id, name, email, role FROM train_users').all();
  users.forEach((user: any) => {
    console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
  });
  
  // Query train schedules
  console.log('\n🚄 Train schedules in database:');
  const schedules = db.prepare('SELECT * FROM train_schedules LIMIT 5').all();
  schedules.forEach((schedule: any) => {
    console.log(`   - Train ${schedule.train_number}: ${schedule.origin} → ${schedule.destination} at ${schedule.departure_time}`);
  });
  
  // Query train status
  console.log('\n📊 Current train status:');
  const statuses = db.prepare('SELECT * FROM train_status LIMIT 5').all();
  statuses.forEach((status: any) => {
    console.log(`   - Train ${status.train_number}: ${status.current_status} (${status.current_location})`);
  });
  
  // Query maintenance records
  console.log('\n🔧 Recent maintenance records:');
  const maintenance = db.prepare('SELECT * FROM maintenance_records LIMIT 3').all();
  maintenance.forEach((record: any) => {
    console.log(`   - Train ${record.train_number}: ${record.maintenance_type} - ${record.status}`);
  });
  
  // Query incidents
  console.log('\n⚠️  Recent incidents:');
  const incidents = db.prepare('SELECT * FROM incidents LIMIT 3').all();
  incidents.forEach((incident: any) => {
    console.log(`   - ${incident.incident_type}: ${incident.description} - Priority: ${incident.priority}`);
  });
  
  console.log('\n✅ Database query completed successfully!');
  
  db.close();
} catch (error) {
  console.error('❌ Error querying database:', error);
}