import Database from 'better-sqlite3';

const db = new Database('./train-database.sqlite');

console.log('🔍 Verifying data insertion results...\n');

// Check job cards created
const jobCards = db.prepare('SELECT COUNT(*) as count FROM job_cards').get() as { count: number };
console.log('📋 Job Cards created:', jobCards.count);

// Check system alerts created
const alerts = db.prepare('SELECT COUNT(*) as count FROM system_alerts').get() as { count: number };
console.log('⚠️  System Alerts created:', alerts.count);

// Check trainsets
const trainsets = db.prepare('SELECT COUNT(*) as count FROM trainsets').get() as { count: number };
console.log('🚄 Total Trainsets:', trainsets.count);

// Show sample job cards
console.log('\n📋 Sample Job Cards:');
const sampleJobCards = db.prepare('SELECT * FROM job_cards ORDER BY created_at DESC LIMIT 5').all();
sampleJobCards.forEach((job: any, index: number) => {
  console.log(`\n   ${index + 1}. Job Card ID: ${job.jobcard_id}`);
  console.log(`      Train: ${job.trainset_id}`);
  console.log(`      Description: ${job.description}`);
  console.log(`      Status: ${job.status}`);
  console.log(`      Raised: ${new Date(job.raised_date).toLocaleDateString()}`);
});

// Show sample alerts
console.log('\n⚠️  Sample System Alerts:');
const sampleAlerts = db.prepare('SELECT * FROM system_alerts ORDER BY created_at DESC LIMIT 3').all();
sampleAlerts.forEach((alert: any, index: number) => {
  console.log(`\n   ${index + 1}. Alert ID: ${alert.alert_id}`);
  console.log(`      Type: ${alert.type}`);
  console.log(`      Title: ${alert.title}`);
  console.log(`      Message: ${alert.message.substring(0, 100)}...`);
});

db.close();
console.log('\n✅ Verification completed!');