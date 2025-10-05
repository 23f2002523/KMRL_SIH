"use client"

import { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, TruckIcon, ExclamationTriangleIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { useGlobalSearch } from '@/hooks/use-global-search'
import { cn } from '@/lib/utils'

const getResultIcon = (type: string) => {
  switch (type) {
    case 'train':
      return TruckIcon
    case 'alert':
      return ExclamationTriangleIcon
    case 'report':
      return DocumentTextIcon
    case 'schedule':
      return ClockIcon
    default:
      return MagnifyingGlassIcon
  }
}

const getResultColor = (type: string) => {
  switch (type) {
    case 'train':
      return 'text-blue-500'
    case 'alert':
      return 'text-red-500'
    case 'report':
      return 'text-green-500'
    case 'schedule':
      return 'text-purple-500'
    default:
      return 'text-gray-500'
  }
}

export function GlobalSearchBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isSearching, 
    performSearch, 
    clearSearch, 
    navigateToResult 
  } = useGlobalSearch()

  // Handle input changes with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery)
        performSearch(localQuery)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [localQuery, searchQuery, setSearchQuery, performSearch])

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && searchResults.length > 0) {
      navigateToResult(searchResults[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    setIsOpen(true)
    
    if (!value.trim()) {
      clearSearch()
      setIsOpen(false)
    }
  }

  const handleResultClick = (result: any) => {
    navigateToResult(result)
    setIsOpen(false)
    setLocalQuery('')
  }

  const handleInputFocus = () => {
    if (localQuery.trim() || searchResults.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search trains, alerts, reports..."
          value={localQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (localQuery.trim() || searchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                Search Results
              </div>
              {searchResults.map((result) => {
                const IconComponent = getResultIcon(result.type)
                const iconColor = getResultColor(result.type)
                
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </>
          ) : localQuery.trim() ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No results found for "{localQuery}"
            </div>
          ) : null}
          
          {/* Quick Actions */}
          {localQuery.trim() && !isSearching && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Quick Actions
                </div>
                <button
                  onClick={() => handleResultClick({ 
                    id: 'search-all', 
                    title: `Search all sections for "${localQuery}"`, 
                    description: 'Advanced search across all modules',
                    type: 'train',
                    route: '/operator/dashboard',
                    metadata: { globalSearch: localQuery }
                  })}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Search all sections for "{localQuery}"
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}