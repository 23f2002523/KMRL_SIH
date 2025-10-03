async function testShiftsAPI() {
  try {
    console.log('🧪 Testing Shifts API...')
    
    // Test the shifts API endpoint with the operator token
    const response = await fetch('http://localhost:3002/api/operator/shifts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoib3BlcmF0b3JAa21ybC5jby5pbiIsIm5hbWUiOiJUcmFpbiBPcGVyYXRvciIsInJvbGUiOiJPcGVyYXRvciIsImlhdCI6MTc1OTQ2MzY0NiwiZXhwIjoxNzU5NTUwMDQ2fQ.T6I_eM11t4iPkxyAA6EMznP3ERwjDFPQzEMb9u_l490'
      }
    })
    
    console.log(`📡 Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Shifts API Response:')
      console.log(`   - Total Operators: ${data.totalOperators}`)
      console.log(`   - Active Shifts: ${data.activeShifts}`)
      console.log(`   - Completed Shifts: ${data.completedShifts}`)
      console.log(`   - Current Shifts: ${data.currentShifts?.length || 0}`)
      console.log(`   - Shift Handovers: ${data.shiftHandovers?.length || 0}`)
      console.log(`   - Shift Reports: ${data.shiftReports?.length || 0}`)
      
      if (data.currentShifts && data.currentShifts.length > 0) {
        console.log('\n📅 Sample Current Shift:')
        const sample = data.currentShifts[0]
        console.log(`   - Operator: ${sample.operatorName}`)
        console.log(`   - Position: ${sample.position}`)
        console.log(`   - Location: ${sample.location}`)
        console.log(`   - Shift Time: ${sample.startTime} - ${sample.endTime}`)
        console.log(`   - Status: ${sample.status}`)
        console.log(`   - Trains: ${sample.trainsAssigned?.join(', ')}`)
      }
      
      if (data.shiftHandovers && data.shiftHandovers.length > 0) {
        console.log('\n🔄 Sample Handover:')
        const sample = data.shiftHandovers[0]
        console.log(`   - From: ${sample.fromOperator}`)
        console.log(`   - To: ${sample.toOperator}`)
        console.log(`   - Date: ${sample.shiftDate}`)
        console.log(`   - Status: ${sample.status}`)
        console.log(`   - Notes: ${sample.maintenanceNotes}`)
      }
      
    } else {
      const error = await response.text()
      console.log('❌ API Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testShiftsAPI()