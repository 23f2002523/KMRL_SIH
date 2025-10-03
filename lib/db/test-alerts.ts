import Database from 'better-sqlite3';

const db = new Database('./train-database.sqlite');

try {
  console.log('🚨 Testing Alert Generation from Train_maintenance data...\n');
  
  // Get maintenance records
  const records = db.prepare('SELECT * FROM document_data_records ORDER BY created_at DESC').all();
  console.log(`📊 Found ${records.length} maintenance records\n`);
  
  let alertCount = { critical: 0, upcoming: 0, aiPredicted: 0 };
  
  records.slice(0, 5).forEach((record: any, index) => {
    try {
      const columnData = JSON.parse(record.column_data);
      
      // Skip header row
      if (record.row_index === 2 && columnData._0 === 'Train ID') {
        return;
      }
      
      const trainId = columnData._0;
      const nextDueDate = columnData._2;
      const maintenanceType = columnData._3;
      const statusRaw = columnData._4;
      
      if (!trainId || trainId === 'Train ID') return;
      
      console.log(`🚄 Processing: ${trainId}`);
      console.log(`   Next Due: ${nextDueDate}`);
      console.log(`   Type: ${maintenanceType}`);
      console.log(`   Status: ${statusRaw}`);
      
      // Calculate days until maintenance
      const nextDue = new Date(nextDueDate);
      const today = new Date();
      const timeDiff = nextDue.getTime() - today.getTime();
      const daysUntilMaintenance = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      console.log(`   Days until due: ${daysUntilMaintenance}`);
      
      // Check for critical alerts
      if (daysUntilMaintenance < 0 || statusRaw === 'Overdue') {
        console.log(`   🚨 CRITICAL ALERT: ${Math.abs(daysUntilMaintenance)} days overdue!`);
        alertCount.critical++;
      }
      
      // Check for upcoming alerts
      if (daysUntilMaintenance > 0 && daysUntilMaintenance <= 30) {
        console.log(`   ⚠️ UPCOMING ALERT: Due in ${daysUntilMaintenance} days`);
        alertCount.upcoming++;
      }
      
      // Check for AI prediction alerts
      if (maintenanceType.toLowerCase().includes('engine') || 
          maintenanceType.toLowerCase().includes('brake') ||
          maintenanceType.toLowerCase().includes('electrical')) {
        console.log(`   🤖 AI PREDICTION ALERT: High-risk maintenance type detected`);
        alertCount.aiPredicted++;
      }
      
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error processing record ${index}:`, error);
    }
  });
  
  console.log('📈 ALERT SUMMARY:');
  console.log(`   🚨 Critical Overdue: ${alertCount.critical}`);
  console.log(`   ⚠️ Upcoming Due: ${alertCount.upcoming}`);
  console.log(`   🤖 AI Predicted: ${alertCount.aiPredicted}`);
  console.log(`   📊 Total Alerts: ${alertCount.critical + alertCount.upcoming + alertCount.aiPredicted}`);
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  db.close();
}