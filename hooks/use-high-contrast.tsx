"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface HighContrastContextType {
  isHighContrast: boolean
  toggleHighContrast: () => void
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined)

export function HighContrastProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Load high contrast preference from localStorage
    const stored = localStorage.getItem('high-contrast')
    if (stored === 'true') {
      setIsHighContrast(true)
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  const toggleHighContrast = () => {
    const newValue = !isHighContrast
    setIsHighContrast(newValue)
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
      localStorage.setItem('high-contrast', 'true')
    } else {
      document.documentElement.classList.remove('high-contrast')
      localStorage.setItem('high-contrast', 'false')
    }
  }

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  )
}

export function useHighContrast() {
  const context = useContext(HighContrastContext)
  if (context === undefined) {
    throw new Error('useHighContrast must be used within a HighContrastProvider')
  }
  return context
}