'use client'

import React from 'react'
import { useLanguage } from '@/hooks/use-libre-translate'
import { TranslatedText } from './libre-translated-text'

export function TranslationDebug() {
  const { language, setLanguage, isTranslating, translationQueue, isServiceAvailable } = useLanguage()

  const testStrings = [
    'Dashboard',
    'Settings', 
    'Profile',
    'MetroMind AI',
    'Welcome to KMRL'
  ]

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
      <h3 className="text-lg font-semibold">Translation Debug Panel</h3>
      
      <div className="space-y-2">
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>Service Available:</strong> {isServiceAvailable ? 'Yes' : 'No'}</p>
        <p><strong>Translating:</strong> {isTranslating ? 'Yes' : 'No'}</p>
        <p><strong>Queue:</strong> {translationQueue}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Language Controls:</h4>
        <div className="space-x-2">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('ml')}
            className={`px-3 py-1 rounded ${language === 'ml' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Malayalam
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Test Translations:</h4>
        <div className="space-y-1">
          {testStrings.map((text, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{text}:</span>
              <TranslatedText 
                text={text} 
                className="font-medium"
                showLoading={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}