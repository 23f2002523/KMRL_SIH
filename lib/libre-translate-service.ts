interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string
  }
}

interface TranslationRequest {
  text: string
  targetLang: string
  sourceLang?: string
}

class LibreTranslateService {
  private cache: TranslationCache = {}
  private pendingRequests: Map<string, Promise<string>> = new Map()
  private apiEndpoint = '/api/translate' // Use our proxy API

  private async translateWithProxy(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    try {
      // Map language codes for LibreTranslate
      const langMap: { [key: string]: string } = {
        'ml': 'ml', // Malayalam
        'en': 'en', // English
        'hi': 'hi', // Hindi
        'ta': 'ta', // Tamil
        'te': 'te', // Telugu
        'kn': 'kn', // Kannada
      }

      const sourceLangCode = langMap[sourceLang] || sourceLang
      const targetLangCode = langMap[targetLang] || targetLang

      console.log(`Translating with LibreTranslate Proxy: ${text.substring(0, 50)}... (${sourceLangCode} → ${targetLangCode})`)

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          source: sourceLangCode,
          target: targetLangCode
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Translation API error: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      
      if (data && data.translatedText) {
        console.log(`Translation successful: ${data.translatedText.substring(0, 50)}...`)
        return data.translatedText
      }
      
      throw new Error('Invalid response format from translation API')
    } catch (error) {
      console.warn(`LibreTranslate proxy failed:`, error)
      throw error
    }
  }

  private getCacheKey(text: string, targetLang: string, sourceLang: string): string {
    return `${sourceLang}-${targetLang}-${text.substring(0, 100)}`
  }

  async translate({ text, targetLang, sourceLang = 'en' }: TranslationRequest): Promise<string> {
    // Return original text if same language
    if (sourceLang === targetLang) {
      return text
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, targetLang, sourceLang)
    if (this.cache[text] && this.cache[text][targetLang]) {
      console.log(`Cache hit for: ${text.substring(0, 30)}...`)
      return this.cache[text][targetLang]
    }

    // Check if translation is already in progress
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Translation in progress for: ${text.substring(0, 30)}...`)
      return this.pendingRequests.get(cacheKey)!
    }

    // Start translation
    const translationPromise = this.performTranslation(text, targetLang, sourceLang)
    this.pendingRequests.set(cacheKey, translationPromise)

    try {
      const result = await translationPromise
      
      // Cache the result
      if (!this.cache[text]) {
        this.cache[text] = {}
      }
      this.cache[text][targetLang] = result
      
      return result
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  private async performTranslation(text: string, targetLang: string, sourceLang: string): Promise<string> {
    try {
      // Handle empty or very short text
      if (!text || text.trim().length === 0) {
        return text
      }

      // Handle numbers, emails, URLs - don't translate
      if (/^[\d\s\-\+\(\)\.]+$/.test(text) || 
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text) ||
          /^https?:\/\//.test(text)) {
        return text
      }

      const result = await this.translateWithProxy(text, targetLang, sourceLang)
      
      if (result && result.trim()) {
        return result.trim()
      }
      
      // Fallback to original text
      return text
    } catch (error) {
      console.error('Translation failed:', error)
      return text
    }
  }

  // Batch translation for better performance
  async translateBatch(requests: TranslationRequest[]): Promise<string[]> {
    const promises = requests.map(request => this.translate(request))
    return Promise.all(promises)
  }

  // Clear cache if needed
  clearCache(): void {
    this.cache = {}
    this.pendingRequests.clear()
    console.log('Translation cache cleared')
  }

  // Get cache stats
  getCacheStats(): { totalEntries: number, totalLanguages: number, cacheSize: string } {
    const totalEntries = Object.keys(this.cache).length
    const allLanguages = new Set<string>()
    
    Object.values(this.cache).forEach(translations => {
      Object.keys(translations).forEach(lang => allLanguages.add(lang))
    })

    // Calculate approximate cache size
    const cacheSize = new Blob([JSON.stringify(this.cache)]).size
    const cacheSizeFormatted = cacheSize > 1024 * 1024 
      ? `${(cacheSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(cacheSize / 1024).toFixed(2)} KB`

    return {
      totalEntries,
      totalLanguages: allLanguages.size,
      cacheSize: cacheSizeFormatted
    }
  }

  // Check if service is available
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET'
      })
      return response.ok
    } catch (error) {
      console.error('LibreTranslate availability check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const libreTranslateService = new LibreTranslateService()
export default LibreTranslateService