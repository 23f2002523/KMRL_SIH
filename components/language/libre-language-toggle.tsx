'use client'

import React from 'react'
import { useLanguage } from '@/hooks/use-libre-translate'
import { Globe, Loader2, CheckCircle2, AlertCircle, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const languages = [
  { code: 'en', name: 'English', icon: <Languages className="w-4 h-4" /> },
  { code: 'ml', name: 'മലയാളം', icon: <Globe className="w-4 h-4" /> },
] as const

export function LibreLanguageToggle() {
  const { 
    language, 
    setLanguage, 
    isTranslating, 
    translationQueue, 
    clearCache, 
    cacheStats, 
    isServiceAvailable 
  } = useLanguage()

  const currentLanguage = languages.find(lang => lang.code === language)
  const stats = cacheStats()

  const handleLanguageChange = (langCode: 'en' | 'ml') => {
    console.log(`Language toggle clicked: ${language} -> ${langCode}`)
    if (langCode !== language) {
      setLanguage(langCode)
    }
  }

  const getStatusIcon = () => {
    if (!isServiceAvailable) {
      return <AlertCircle className="h-3 w-3 text-red-500" />
    }
    if (isTranslating || translationQueue > 0) {
      return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
    }
    return <CheckCircle2 className="h-3 w-3 text-green-500" />
  }

  const getStatusText = () => {
    if (!isServiceAvailable) {
      return 'Service unavailable'
    }
    if (isTranslating || translationQueue > 0) {
      return `Translating${translationQueue > 0 ? ` (${translationQueue} in queue)` : '...'}`
    }
    return 'Ready'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 min-w-[120px]"
          disabled={isTranslating && translationQueue > 5}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.name}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.icon}
          </span>
          {getStatusIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Language Selection */}
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Select Language
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{lang.icon}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Status Information */}
        <div className="px-2 py-1.5 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={`text-xs ${
                !isServiceAvailable ? 'text-red-600' : 
                isTranslating ? 'text-blue-600' : 'text-green-600'
              }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Provider:</span>
            <span className="text-xs font-medium">LibreTranslate</span>
          </div>
          
          {stats.totalEntries > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cache:</span>
                <span className="text-xs">{stats.totalEntries} entries</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="text-xs">{stats.cacheSize}</span>
              </div>
            </>
          )}
        </div>

        <DropdownMenuSeparator />
        
        {/* Cache Management */}
        <DropdownMenuItem
          onClick={clearCache}
          disabled={stats.totalEntries === 0}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Clear Translation Cache
        </DropdownMenuItem>
        
        {/* Service Info */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
          <div className="flex items-center justify-between">
            <span>Powered by LibreTranslate</span>
            <div className="flex items-center gap-1">
              {isServiceAvailable ? (
                <span className="text-green-600">●</span>
              ) : (
                <span className="text-red-600">●</span>
              )}
              <span className="text-xs">
                {isServiceAvailable ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LibreLanguageToggle