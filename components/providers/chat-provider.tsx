"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { FloatingChatBubble } from '@/components/chat/floating-chat-bubble'
import { ChatWindow, type ChatMessage } from '@/components/chat/chat-window'
import { useChat } from '@/hooks/use-chat'
import { usePathname } from 'next/navigation'

interface ChatContextType {
  isChatOpen: boolean
  unreadCount: number
  toggleChat: () => void
  incrementUnread: () => void
  clearUnread: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  
  // Don't show chatbot on landing page and login page
  const shouldShowChatbot = pathname !== '/login' && pathname !== '/'
  
  console.log('ChatProvider render:', { pathname, shouldShowChatbot, isChatOpen })
  
  // Use the chat hook for message management
  const {
    messages,
    sendMessage,
    isTyping,
    isLoading
  } = useChat({
    onNewMessage: () => {
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1)
      }
    }
  })

  const toggleChat = useCallback(() => {
    console.log('toggleChat called!', { currentState: isChatOpen })
    setIsChatOpen(prev => {
      const newState = !prev
      console.log('Chat state changing:', prev, '->', newState)
      if (!prev) {
        // Opening chat - clear unread count
        setUnreadCount(0)
      }
      return newState
    })
  }, [isChatOpen])

  const incrementUnread = useCallback(() => {
    if (!isChatOpen) {
      setUnreadCount(prev => prev + 1)
    }
  }, [isChatOpen])

  const clearUnread = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const contextValue: ChatContextType = {
    isChatOpen,
    unreadCount,
    toggleChat,
    incrementUnread,
    clearUnread
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
      {/* Global chat components - only show if not on login page */}
      {shouldShowChatbot && (
        <>
          <FloatingChatBubble 
            onToggleChat={toggleChat} 
            isChatOpen={isChatOpen}
            unreadCount={unreadCount}
          />
          {isChatOpen && (
            <ChatWindow 
              isOpen={isChatOpen}
              messages={messages}
              onSendMessage={sendMessage}
              onClose={toggleChat}
              isTyping={isTyping}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </ChatContext.Provider>
  )
}