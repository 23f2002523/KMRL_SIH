'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { libreTranslateService } from '@/lib/libre-translate-service'

type Language = 'en' | 'ml'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (text: string) => Promise<string>
  tSync: (text: string) => string
  isTranslating: boolean
  translationQueue: number
  clearCache: () => void
  cacheStats: () => { totalEntries: number, totalLanguages: number, cacheSize: string }
  isServiceAvailable: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationQueue, setTranslationQueue] = useState(0)
  const [isServiceAvailable, setIsServiceAvailable] = useState(true)
  const [syncCache, setSyncCache] = useState<{ [key: string]: string }>({})
  const [isClient, setIsClient] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [lastRequestTime, setLastRequestTime] = useState(0)

  // Initialize client state and language from localStorage
  useEffect(() => {
    try {
      setIsClient(true)
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage && ['en', 'ml'].includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error)
    }
  }, [])

  // Check service availability on mount
  useEffect(() => {
    const checkService = async () => {
      const available = await libreTranslateService.checkAvailability()
      setIsServiceAvailable(available)
      if (!available) {
        console.warn('LibreTranslate service is not available. Falling back to original text.')
      }
    }
    checkService()
  }, [])

  const setLanguage = (lang: Language) => {
    console.log(`Language changing from ${language} to ${lang}`)
    setLanguageState(lang)
    try {
      localStorage.setItem('language', lang)
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
    }
    
    // Clear pending translation queue when language changes
    setTranslationQueue(0)
    setIsTranslating(false)
    
    console.log(`Language changed to: ${lang}`)
  }

  // Async translation function with throttling
  const t = async (text: string): Promise<string> => {
    if (language === 'en' || !text || !isServiceAvailable || !isClient) {
      return text
    }

    // Check if we already have this translation cached
    const cacheKey = `${language}-${text}`
    if (syncCache[cacheKey]) {
      return syncCache[cacheKey]
    }

    // Simple throttling: limit to 5 requests per 200ms window
    const now = Date.now()
    if (now - lastRequestTime < 200 && requestCount >= 5) {
      console.warn('Translation throttled, using original text:', text.substring(0, 30))
      return text
    }

    if (now - lastRequestTime >= 200) {
      setRequestCount(1)
      setLastRequestTime(now)
    } else {
      setRequestCount(prev => prev + 1)
    }

    try {
      setIsTranslating(true)
      setTranslationQueue(prev => prev + 1)

      const result = await libreTranslateService.translate({
        text,
        targetLang: language,
        sourceLang: 'en'
      })

      // Update sync cache for future tSync calls
      setSyncCache(prev => ({
        ...prev,
        [cacheKey]: result
      }))

      return result
    } catch (error) {
      console.warn('Translation failed, using fallback text:', error instanceof Error ? error.message : String(error))
      return text
    } finally {
      setIsTranslating(false)
      setTranslationQueue(prev => Math.max(0, prev - 1))
    }
  }

  // Synchronous translation function (uses cache)
  const tSync = (text: string): string => {
    if (language === 'en' || !text) {
      return text
    }

    const cacheKey = `${language}-${text}`
    const cached = syncCache[cacheKey]
    
    if (cached) {
      return cached
    }

    // If not in cache, trigger async translation for future use
    t(text).then(result => {
      setSyncCache(prev => ({
        ...prev,
        [cacheKey]: result
      }))
    }).catch(console.error)

    // Return original text for now
    return text
  }

  const clearCache = () => {
    libreTranslateService.clearCache()
    setSyncCache({})
    console.log('All translation caches cleared')
  }

  const cacheStats = () => {
    const serviceStats = libreTranslateService.getCacheStats()
    const syncCacheSize = Object.keys(syncCache).length
    
    return {
      ...serviceStats,
      syncCacheEntries: syncCacheSize
    }
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    tSync,
    isTranslating,
    translationQueue,
    clearCache,
    cacheStats,
    isServiceAvailable
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Export for backward compatibility
export default useLanguage