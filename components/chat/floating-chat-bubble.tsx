'use client'

import React, { useState } from 'react'
import { MessageCircle, X, Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FloatingChatBubbleProps {
  onToggleChat: () => void
  isChatOpen: boolean
  unreadCount?: number
  isTyping?: boolean
}

export function FloatingChatBubble({ 
  onToggleChat, 
  isChatOpen, 
  unreadCount = 0,
  isTyping = false 
}: FloatingChatBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  console.log('FloatingChatBubble render:', { isChatOpen, unreadCount })

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Chatbot clicked!', { isChatOpen, unreadCount })
    console.log('Click event fired successfully!')
    onToggleChat()
  }

  // Show pulse animation for new messages
  React.useEffect(() => {
    if (unreadCount > 0 && !isChatOpen) {
      setShowPulse(true)
      const timeout = setTimeout(() => setShowPulse(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [unreadCount, isChatOpen])

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
      onClick={handleToggleClick}
      onMouseEnter={() => console.log('Wrapper mouse enter')}
    >
      {/* Notification badge for unread messages */}
      {unreadCount > 0 && !isChatOpen && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold z-10 animate-bounce"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}

      {/* Main chat bubble */}
      <Button
        onClick={handleToggleClick}
        onMouseDown={handleToggleClick}
        onMouseEnter={() => {
          console.log('Mouse entered chat bubble')
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          console.log('Mouse left chat bubble')
          setIsHovered(false)
        }}
        className={`
          h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out cursor-pointer
          ${isChatOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          ${showPulse ? 'animate-pulse' : ''}
          ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}
        `}
        size="icon"
        type="button"
      >
        {/* Icon with smooth transition */}
        <div className="relative">
          {isChatOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6 transition-transform duration-200" />
              {/* Typing indicator */}
              {isTyping && (
                <div className="absolute -top-1 -right-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Button>

      {/* Hover tooltip */}
      {isHovered && !isChatOpen && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-200">
          <Bot className="inline h-4 w-4 mr-1" />
          KMRL Assistant
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Welcome pulse animation */}
      <div className={`absolute inset-0 rounded-full border-2 border-blue-400 ${showPulse ? 'animate-ping' : 'opacity-0'} transition-opacity duration-300`}></div>
      
      {/* AI indicator */}
      {!isChatOpen && (
        <div className="absolute -bottom-1 -left-1 bg-green-500 rounded-full p-1 shadow-md">
          <Zap className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  )
}