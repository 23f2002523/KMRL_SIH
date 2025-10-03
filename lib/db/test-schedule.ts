async function testScheduleAPI() {
  try {
    console.log('🧪 Testing Schedule API...')
    
    // Test the schedule API endpoint
    const response = await fetch('http://localhost:3002/api/operator/schedule', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoib3BlcmF0b3JAa21ybC5jby5pbiIsIm5hbWUiOiJUcmFpbiBPcGVyYXRvciIsInJvbGUiOiJPcGVyYXRvciIsImlhdCI6MTc1OTQ2MzY0NiwiZXhwIjoxNzU5NTUwMDQ2fQ.T6I_eM11t4iPkxyAA6EMznP3ERwjDFPQzEMb9u_l490'
      }
    })
    
    console.log(`📡 Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Schedule API Response:')
      console.log(`   - Total Trains: ${data.totalTrains}`)
      console.log(`   - Active Trains: ${data.activeTrains}`)
      console.log(`   - Maintenance Trains: ${data.maintenanceTrains}`)
      console.log(`   - Train Schedules: ${data.trainSchedules?.length || 0}`)
      console.log(`   - Maintenance Windows: ${data.maintenanceWindows?.length || 0}`)
      
      if (data.trainSchedules && data.trainSchedules.length > 0) {
        console.log('\n📅 Sample Train Schedule:')
        const sample = data.trainSchedules[0]
        console.log(`   - Train: ${sample.trainId} (${sample.trainName})`)
        console.log(`   - Route: ${sample.route}`)
        console.log(`   - Date: ${sample.date}`)
        console.log(`   - Time: ${sample.departureTime} - ${sample.arrivalTime}`)
        console.log(`   - Status: ${sample.status}`)
      }
      
      if (data.maintenanceWindows && data.maintenanceWindows.length > 0) {
        console.log('\n🔧 Sample Maintenance Window:')
        const sample = data.maintenanceWindows[0]
        console.log(`   - Train: ${sample.trainId} (${sample.trainName})`)
        console.log(`   - Type: ${sample.type}`)
        console.log(`   - Date: ${sample.scheduledDate}`)
        console.log(`   - Duration: ${sample.duration}`)
        console.log(`   - Priority: ${sample.priority}`)
        console.log(`   - Status: ${sample.status}`)
      }
    } else {
      const error = await response.text()
      console.log('❌ API Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testScheduleAPI()