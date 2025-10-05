"use client"

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/use-libre-translate'
import { Loader2 } from 'lucide-react'

interface TranslatedTextProps {
  text: string
  fallback?: string
  className?: string
  showLoader?: boolean
  element?: keyof JSX.IntrinsicElements
}

// Component for individual text translation with loading
export function TranslatedText({ 
  text, 
  fallback, 
  className = '', 
  showLoader = true,
  element: Element = 'span'
}: TranslatedTextProps) {
  const { t, language: currentLanguage, isTranslating } = useLanguage()
  const [translatedText, setTranslatedText] = useState<string>(fallback || text)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en') {
        setTranslatedText(fallback || text)
        return
      }

      setLoading(true)
      try {
        const result = await t(text)
        setTranslatedText(result)
      } catch (error) {
        console.error('Translation error:', error)
        setTranslatedText(fallback || text)
      } finally {
        setLoading(false)
      }
    }

    translateText()
  }, [text, fallback, currentLanguage, t])

  if (loading && showLoader) {
    return (
      <Element className={`${className} inline-flex items-center gap-1`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        {fallback || text}
      </Element>
    )
  }

  return <Element className={className}>{translatedText}</Element>
}

interface TranslatedContentProps {
  children: string
  className?: string
  showLoader?: boolean
}

// Component for translating large content blocks
export function TranslatedContent({ children, className = '', showLoader = true }: TranslatedContentProps) {
  const { language: currentLanguage } = useLanguage()
  const [translatedContent, setTranslatedContent] = useState<string>(children)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const translateContent = async () => {
      if (currentLanguage === 'en') {
        setTranslatedContent(children)
        return
      }

      setLoading(true)
      try {
        const { libreTranslateService } = await import('@/lib/libre-translate-service')
        const result = await libreTranslateService.translate({
          text: children,
          targetLang: currentLanguage,
          sourceLang: 'en'
        })
        setTranslatedContent(result)
      } catch (error) {
        console.error('Content translation error:', error)
        setTranslatedContent(children)
      } finally {
        setLoading(false)
      }
    }

    translateContent()
  }, [children, currentLanguage])

  if (loading && showLoader) {
    return (
      <div className={`${className} opacity-70`}>
        <div className="inline-flex items-center gap-2 mb-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Translating...</span>
        </div>
        <div>{children}</div>
      </div>
    )
  }

  return <div className={className}>{translatedContent}</div>
}

interface BatchTranslatedProps {
  texts: string[]
  render: (translations: { [key: string]: string }, loading: boolean) => React.ReactNode
}

// Component for batch translation with render prop pattern
export function BatchTranslated({ texts, render }: BatchTranslatedProps) {
  const { language: currentLanguage } = useLanguage()
  const [translations, setTranslations] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const translateBatch = async () => {
      if (currentLanguage === 'en') {
        const englishTranslations: { [key: string]: string } = {}
        texts.forEach(text => {
          englishTranslations[text] = text
        })
        setTranslations(englishTranslations)
        return
      }

      setLoading(true)
      try {
        const { libreTranslateService } = await import('@/lib/libre-translate-service')
        const requests = texts.map(text => ({
          text,
          targetLang: currentLanguage as 'ml',
          sourceLang: 'en' as const
        }))
        
        const results = await libreTranslateService.translateBatch(requests)
        
        const newTranslations: { [key: string]: string } = {}
        texts.forEach((text, index) => {
          newTranslations[text] = results[index]
        })
        
        setTranslations(newTranslations)
      } catch (error) {
        console.error('Batch translation error:', error)
        // Fallback to original texts
        const fallbackTranslations: { [key: string]: string } = {}
        texts.forEach(text => {
          fallbackTranslations[text] = text
        })
        setTranslations(fallbackTranslations)
      } finally {
        setLoading(false)
      }
    }

    translateBatch()
  }, [texts, currentLanguage])

  return <>{render(translations, loading)}</>
}

// HOC for wrapping components with translation
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>,
  textExtractor: (props: P) => string[]
) {
  return function TranslatedComponent(props: P) {
    const texts = textExtractor(props)
    
    return (
      <BatchTranslated
        texts={texts}
        render={(translations, loading) => (
          <div className={loading ? 'opacity-70' : ''}>
            <Component {...props} translations={translations} />
          </div>
        )}
      />
    )
  }
}

export default TranslatedText