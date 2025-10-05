"use client"

import React from 'react'
import { useLanguage } from '@/hooks/use-dynamic-language'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Loader2 } from 'lucide-react'

export function DynamicLanguageToggle() {
  const { currentLanguage, setLanguage, isTranslating, translationError } = useLanguage()

  const handleLanguageChange = () => {
    const newLang = currentLanguage === 'en' ? 'ml' : 'en'
    setLanguage(newLang)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLanguageChange}
        className="flex items-center gap-2 h-8 px-3"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Globe className="h-3 w-3" />
        )}
        
        <span className="font-medium">
          {currentLanguage.toUpperCase()}
        </span>
        
        <span className="text-xs text-gray-500">
          →
        </span>
        
        <span className="text-xs text-gray-600">
          {currentLanguage === 'en' ? 'ML' : 'EN'}
        </span>
      </Button>

      {isTranslating && (
        <Badge variant="secondary" className="text-xs">
          Translating...
        </Badge>
      )}

      {translationError && (
        <Badge variant="destructive" className="text-xs">
          Error
        </Badge>
      )}
    </div>
  )
}

interface LanguageStatusProps {
  showCacheStats?: boolean
}

export function LanguageStatus({ showCacheStats = false }: LanguageStatusProps) {
  const { currentLanguage, isTranslating, translationError } = useLanguage()
  const [cacheStats, setCacheStats] = React.useState<{
    totalEntries: number
    totalLanguages: number
  } | null>(null)

  React.useEffect(() => {
    if (showCacheStats) {
      import('@/lib/libre-translate-service').then(({ libreTranslateService }) => {
        setCacheStats(libreTranslateService.getCacheStats())
      })
    }
  }, [showCacheStats, currentLanguage])

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          translationError ? 'bg-red-500' : 
          isTranslating ? 'bg-yellow-500 animate-pulse' : 
          'bg-green-500'
        }`} />
        <span>
          {translationError ? 'Translation Error' :
           isTranslating ? 'Translating...' :
           `Language: ${currentLanguage.toUpperCase()}`}
        </span>
      </div>

      {showCacheStats && cacheStats && (
        <div className="text-xs text-gray-400">
          Cache: {cacheStats.totalEntries} entries
        </div>
      )}
    </div>
  )
}

export default DynamicLanguageToggle