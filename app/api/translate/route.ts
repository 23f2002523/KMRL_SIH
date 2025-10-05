import { NextRequest, NextResponse } from 'next/server'

// Mock translation dictionary for demonstration
const mockTranslations: { [key: string]: { [target: string]: string } } = {
  // English to Malayalam translations
  'MetroMind AI': { 'ml': 'മെട്രോമൈൻഡ് എഐ' },
  'Dashboard': { 'ml': 'ഡാഷ്ബോർഡ്' },
  'Upload': { 'ml': 'അപ്‌ലോഡ്' },
  'AI Insights': { 'ml': 'എഐ വിശകലനങ്ങൾ' },
  'Alerts': { 'ml': 'മുന്നറിയിപ്പുകൾ' },
  'Simulation': { 'ml': 'അനുകരണം' },
  'Reports': { 'ml': 'റിപ്പോർട്ടുകൾ' },
  'Conflict Alerts': { 'ml': 'വൈരുദ്ധ്യ മുന്നറിയിപ്പുകൾ' },
  'AI-detected issues with consolidated operational conflicts': { 'ml': 'സംയോജിത പ്രവർത്തന വൈരുദ്ध്യങ്ങളുമായി എഐ കണ്ടെത്തിയ പ്രശ്നങ്ങൾ' },
  'Refresh Alerts': { 'ml': 'മുന്നറിയിപ്പുകൾ പുതുക്കുക' },
  'Active': { 'ml': 'സജീവം' },
  'Critical': { 'ml': 'അതിഗുരുതരം' },
  'Acknowledged': { 'ml': 'അംഗീകരിച്ചു' },
  'All Alerts': { 'ml': 'എല്ലാ മുന്നറിയിപ്പുകൾ' },
  'Impact Assessment': { 'ml': 'സ്വാധീന വിലയിരുത്തൽ' },
  'Detected': { 'ml': 'കണ്ടെത്തി' },
  'Acknowledge': { 'ml': 'അംഗീകരിക്കുക' },
  'Override': { 'ml': 'അധികാരം മറികടക്കുക' },
  'Overridden': { 'ml': 'അധികാരം മറികടന്നു' },
  'Resolved': { 'ml': 'പരിഹരിച്ചു' },
  
  // Add more translations as needed
  'Welcome': { 'ml': 'സ്വാഗതം' },
  'Loading': { 'ml': 'ലോഡിംഗ്' },
  'Error': { 'ml': 'പിശക്' },
  'Success': { 'ml': 'വിജയം' },
  'Cancel': { 'ml': 'റദ്ദാക്കുക' },
  'Save': { 'ml': 'സേവ് ചെയ്യുക' },
  'Delete': { 'ml': 'ഇല്ലാതാക്കുക' },
  'Edit': { 'ml': 'എഡിറ്റ് ചെയ്യുക' },
  'Search': { 'ml': 'തിരയുക' },
  'Settings': { 'ml': 'ക്രമീകരണങ്ങൾ' },
  
  // Dashboard specific translations
  'Welcome, Train Operator': { 'ml': 'സ്വാഗതം, ട്രെയിൻ ഓപ്പറേറ്റര്' },
  'KMRL Train Operations Dashboard - Monitor & Control Your Assigned Fleet': { 'ml': 'കെഎംആർഎൽ ട്രെയിൻ ഓപ്പറേഷൻസ് ഡാഷ്ബോർഡ് - നിങ്ങളുടെ നിയുക്ത ഫ്ലീറ്റ് നിരീക്ഷിക്കുകയും നിയന്ത്രിക്കുകയും ചെയ്യുക' },
  'Total Trainsets': { 'ml': 'മൊത്തം ട്രെയിൻസെറ്റുകൾ' },
  'Ready for Service': { 'ml': 'സേവനത്തിന് തയ്യാർ' },
  'Standby': { 'ml': 'സ്റ്റാൻഡ്ബൈ' },
  'In Maintenance': { 'ml': 'അറ്റകുറ്റപ്പണിയിൽ' },
  'AI Predicted': { 'ml': 'AI പ്രവചിച്ചത്' },
  'Tonight\'s Induction Priority': { 'ml': 'ഇന്ന് രാത്രിയുടെ ഇൻഡക്ഷൻ മുൻഗണന' },
  'Induction Predictions for': { 'ml': 'ഇൻഡക്ഷൻ പ്രവചനങ്ങൾ' },
  'Rank': { 'ml': 'റാങ്ക്' },
  'Train ID': { 'ml': 'ട്രെയിൻ ഐഡി' },
  'Status': { 'ml': 'സ്ഥിതി' },
  'Confidence': { 'ml': 'ആത്മവിശ്വാസം' },
  'Reason Tags': { 'ml': 'കാരണ ടാഗുകൾ' },
  'Service': { 'ml': 'സേവനം' },
  'Today': { 'ml': 'ഇന്ന്' },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, source = 'en', target = 'ml' } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    console.log(`Mock Translation: "${text}" (${source} → ${target})`)

    // If translating to same language, return original
    if (source === target) {
      return NextResponse.json({
        translatedText: text,
        source: source,
        target: target,
        provider: 'mock-translation-service'
      })
    }

    // Look up in mock dictionary
    const translation = mockTranslations[text]?.[target]
    
    if (translation) {
      console.log(`Translation found: "${translation}"`)
      return NextResponse.json({
        translatedText: translation,
        source: source,
        target: target,
        provider: 'mock-translation-service'
      })
    }

    // For unknown text, return with [ML] prefix to indicate it would be translated
    const mockTranslation = target === 'ml' ? `[ML] ${text}` : text
    
    console.log(`No translation found, using mock: "${mockTranslation}"`)
    return NextResponse.json({
      translatedText: mockTranslation,
      source: source,
      target: target,
      provider: 'mock-translation-service'
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'ok',
    service: 'Mock Translation Service',
    description: 'Demo translation service for Malayalam and other languages',
    supportedLanguages: ['en', 'ml'],
    availableTranslations: Object.keys(mockTranslations).length
  })
}