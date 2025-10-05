"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'train' | 'alert' | 'report' | 'schedule'
  route: string
  metadata?: any
}

interface GlobalSearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  performSearch: (query: string) => Promise<void>
  clearSearch: () => void
  navigateToResult: (result: SearchResult) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined)

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // Simulate API call - replace with actual search API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock search results based on query
      const mockResults: SearchResult[] = []
      
      // Search in trains
      if (query.toLowerCase().includes('train') || /^[A-Z0-9]{3,}$/i.test(query)) {
        mockResults.push({
          id: 'train-001',
          title: `Train ${query.toUpperCase()}`,
          description: 'View train details, status, and schedule',
          type: 'train',
          route: '/operator/trains',
          metadata: { trainId: query.toUpperCase() }
        })
      }
      
      // Search in alerts
      if (query.toLowerCase().includes('alert') || query.toLowerCase().includes('maintenance')) {
        mockResults.push({
          id: 'alerts-001',
          title: 'Active Alerts',
          description: `Search results for "${query}" in alerts`,
          type: 'alert',
          route: '/operator/alerts',
          metadata: { searchTerm: query }
        })
      }
      
      // Search in reports
      if (query.toLowerCase().includes('report') || query.toLowerCase().includes('analytics')) {
        mockResults.push({
          id: 'reports-001',
          title: 'System Reports',
          description: `Find reports related to "${query}"`,
          type: 'report',
          route: '/operator/reports',
          metadata: { searchTerm: query }
        })
      }
      
      // Search in schedule
      if (query.toLowerCase().includes('schedule') || query.toLowerCase().includes('timetable')) {
        mockResults.push({
          id: 'schedule-001',
          title: 'Train Schedule',
          description: `Schedule information for "${query}"`,
          type: 'schedule',
          route: '/operator/schedule',
          metadata: { searchTerm: query }
        })
      }
      
      // General dashboard search
      if (query.toLowerCase().includes('dashboard') || query.toLowerCase().includes('overview')) {
        mockResults.push({
          id: 'dashboard-001',
          title: 'Dashboard Overview',
          description: 'Main operator dashboard',
          type: 'train',
          route: '/operator/dashboard',
          metadata: {}
        })
      }

      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const navigateToResult = useCallback((result: SearchResult) => {
    // Store search context for the target page
    if (result.metadata?.searchTerm) {
      sessionStorage.setItem('searchContext', JSON.stringify({
        query: result.metadata.searchTerm,
        timestamp: Date.now()
      }))
    }
    
    router.push(result.route)
    clearSearch()
  }, [router, clearSearch])

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
    navigateToResult,
  }

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider')
  }
  return context
}