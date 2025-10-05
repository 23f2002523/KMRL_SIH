'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/use-libre-translate'
import { Loader2 } from 'lucide-react'

interface TranslatedTextProps {
  text: string
  className?: string
  fallbackText?: string
  showLoading?: boolean
}

export function TranslatedText({ 
  text, 
  className = '', 
  fallbackText = text, 
  showLoading = true 
}: TranslatedTextProps) {
  const { t, language, isServiceAvailable } = useLanguage()
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'en' || !isServiceAvailable) {
      setTranslatedText(text)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    // Add a small delay to batch translation requests and spread them out
    const delay = Math.random() * 300 + 50 // Random delay between 50-350ms
    const timeoutId = setTimeout(async () => {
      try {
        const result = await t(text)
        if (isMounted) {
          setTranslatedText(result)
        }
      } catch (error) {
        console.warn('TranslatedText component error:', error instanceof Error ? error.message : String(error))
        if (isMounted) {
          setTranslatedText(fallbackText)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }, delay)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [text, language, t, fallbackText, isServiceAvailable])

  if (isLoading && showLoading) {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="opacity-70">{text}</span>
      </span>
    )
  }

  return <span className={className}>{translatedText}</span>
}

interface TranslatedContentProps {
  children: React.ReactNode
  texts: string[]
  className?: string
}

export function TranslatedContent({ 
  children, 
  texts, 
  className = '' 
}: TranslatedContentProps) {
  const { t, language, isServiceAvailable } = useLanguage()
  const [translations, setTranslations] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'en' || !texts.length || !isServiceAvailable) {
      const defaultTranslations = texts.reduce((acc, text) => {
        acc[text] = text
        return acc
      }, {} as { [key: string]: string })
      setTranslations(defaultTranslations)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const translateTexts = async () => {
      try {
        const results = await Promise.all(texts.map(text => t(text)))
        
        if (isMounted) {
          const translationMap = texts.reduce((acc, text, index) => {
            acc[text] = results[index] || text
            return acc
          }, {} as { [key: string]: string })
          
          setTranslations(translationMap)
        }
      } catch (error) {
        console.error('Batch translation failed:', error)
        if (isMounted) {
          const fallbackTranslations = texts.reduce((acc, text) => {
            acc[text] = text
            return acc
          }, {} as { [key: string]: string })
          setTranslations(fallbackTranslations)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    translateTexts()

    return () => {
      isMounted = false
    }
  }, [texts, language, t, isServiceAvailable])

  // Clone children and replace text nodes with translated versions
  const translateChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return translations[child] || child
      }
      
      if (React.isValidElement(child) && child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: translateChildren(child.props.children)
        })
      }
      
      return child
    })
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <div className="opacity-70">{children}</div>
      </div>
    )
  }

  return <div className={className}>{translateChildren(children)}</div>
}

interface BatchTranslatedProps {
  items: Array<{
    key: string
    text: string
    component?: React.ComponentType<{ children: React.ReactNode, className?: string }>
    className?: string
  }>
  className?: string
}

export function BatchTranslated({ items, className = '' }: BatchTranslatedProps) {
  const { t, language, isServiceAvailable } = useLanguage()
  const [translations, setTranslations] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'en' || !items.length || !isServiceAvailable) {
      const defaultTranslations = items.reduce((acc, item) => {
        acc[item.key] = item.text
        return acc
      }, {} as { [key: string]: string })
      setTranslations(defaultTranslations)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const translateItems = async () => {
      try {
        const texts = items.map(item => item.text)
        const results = await Promise.all(texts.map(text => t(text)))
        
        if (isMounted) {
          const translationMap = items.reduce((acc, item, index) => {
            acc[item.key] = results[index] || item.text
            return acc
          }, {} as { [key: string]: string })
          
          setTranslations(translationMap)
        }
      } catch (error) {
        console.error('Batch translation failed:', error)
        if (isMounted) {
          const fallbackTranslations = items.reduce((acc, item) => {
            acc[item.key] = item.text
            return acc
          }, {} as { [key: string]: string })
          setTranslations(fallbackTranslations)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    translateItems()

    return () => {
      isMounted = false
    }
  }, [items, language, t, isServiceAvailable])

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="opacity-70">Loading translations...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      {items.map((item) => {
        const Component = item.component || 'span'
        const translatedText = translations[item.key] || item.text
        
        return (
          <Component key={item.key} className={item.className}>
            {translatedText}
          </Component>
        )
      })}
    </div>
  )
}

export default TranslatedText