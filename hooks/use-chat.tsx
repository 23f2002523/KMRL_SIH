'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ChatMessage } from '@/components/chat/chat-window'
import { useLanguage } from '@/hooks/use-libre-translate'

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  isLoading: boolean
  unreadCount: number
  isConnected: boolean
}

interface UseChatOptions {
  onNewMessage?: (message: ChatMessage) => void
  autoMarkAsRead?: boolean
}

export function useChat(options: UseChatOptions = {}) {
  const { onNewMessage, autoMarkAsRead = true } = options
  const { language, t } = useLanguage()
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isLoading: false,
    unreadCount: 0,
    isConnected: true
  })
  
  const [isChatOpen, setIsChatOpen] = useState(false)
  const messageIdCounter = useRef(0)

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1
    return `msg_${Date.now()}_${messageIdCounter.current}`
  }, [])

  // Add welcome message on first load
  useEffect(() => {
    console.log('useChat: Checking for welcome message...', { messagesLength: state.messages.length })
    if (state.messages.length === 0) {
      console.log('useChat: Adding welcome message')
      const welcomeMessage: ChatMessage = {
        id: generateMessageId(),
        content: "Hello! I'm your KMRL Assistant. I can help you with train operations, maintenance schedules, performance analysis, and more. What would you like to know?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setState(prev => ({ 
        ...prev, 
        messages: [welcomeMessage] 
      }))
    }
  }, [generateMessageId])

  // Auto-mark messages as read when chat is open
  useEffect(() => {
    if (isChatOpen && autoMarkAsRead && state.unreadCount > 0) {
      setState(prev => ({ ...prev, unreadCount: 0 }))
    }
  }, [isChatOpen, autoMarkAsRead, state.unreadCount])

  // Add a new message to the chat
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    }

    setState(prev => {
      const newUnreadCount = message.sender === 'bot' && !isChatOpen 
        ? prev.unreadCount + 1 
        : prev.unreadCount

      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        unreadCount: newUnreadCount
      }
    })

    onNewMessage?.(newMessage)
    return newMessage
  }, [generateMessageId, isChatOpen, onNewMessage])

  // Send a message from user
  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!content.trim() && !file) return

    // Add user message
    const userMessage = addMessage({
      content: file ? `${content}\n[File: ${file.name}]` : content,
      sender: 'user',
      type: file ? 'file' : 'text',
      metadata: file ? { fileName: file.name } : undefined
    })

    // Set loading and typing states
    setState(prev => ({ ...prev, isLoading: true, isTyping: true }))

    try {
      // Create form data if file is present
      const formData = new FormData()
      formData.append('message', content)
      formData.append('messageId', userMessage.id)
      formData.append('language', language)
      if (file) {
        formData.append('file', file)
      }

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('AUTHENTICATION_REQUIRED')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Translate bot response if needed
      let translatedResponse = data.response
      if (language === 'ml' && data.response) {
        try {
          translatedResponse = await t(data.response)
        } catch (error) {
          console.warn('Translation failed, using original text:', error)
          translatedResponse = data.response
        }
      }

      // Add bot response
      setTimeout(() => {
        addMessage({
          content: translatedResponse || "I understand your request. Let me help you with that.",
          sender: 'bot',
          type: data.type || 'text',
          metadata: data.metadata
        })

        setState(prev => ({ ...prev, isLoading: false, isTyping: false }))
      }, 1000) // Simulate typing delay

    } catch (error) {
      console.error('Chat API error:', error)
      
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
      
      if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED') {
        errorMessage = "Please log in to use the KMRL Assistant. Click here to go to the login page."
      }
      
      // Add error message
      setTimeout(() => {
        addMessage({
          content: errorMessage,
          sender: 'bot',
          type: 'system',
          metadata: error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED' 
            ? { requiresAuth: true } 
            : undefined
        })

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isTyping: false,
          isConnected: error instanceof Error && error.message !== 'AUTHENTICATION_REQUIRED'
        }))
      }, 1000)
    }
  }, [addMessage])

  // Toggle chat window
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev)
  }, [])

  // Close chat window
  const closeChat = useCallback(() => {
    setIsChatOpen(false)
  }, [])

  // Clear all messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      unreadCount: 0 
    }))
  }, [])

  // Simulate bot typing for demos
  const simulateTyping = useCallback((duration: number = 2000) => {
    setState(prev => ({ ...prev, isTyping: true }))
    setTimeout(() => {
      setState(prev => ({ ...prev, isTyping: false }))
    }, duration)
  }, [])

  // Add system notification
  const addNotification = useCallback((content: string, type: 'system' | 'train-data' | 'prediction' = 'system', metadata?: ChatMessage['metadata']) => {
    addMessage({
      content,
      sender: 'bot',
      type,
      metadata
    })
  }, [addMessage])

  // Quick response handlers for common queries
  const quickResponses = useCallback(() => ({
    trainStatus: (trainId: string) => {
      sendMessage(`Show me the status of train ${trainId}`)
    },
    maintenanceSchedule: () => {
      sendMessage("Show me today's maintenance schedule")
    },
    aiPredictions: () => {
      sendMessage("What are the AI predictions for today?")
    },
    performanceReport: () => {
      sendMessage("Generate a performance report")
    }
  }), [sendMessage])

  return {
    // State
    messages: state.messages,
    isTyping: state.isTyping,
    isLoading: state.isLoading,
    unreadCount: state.unreadCount,
    isConnected: state.isConnected,
    isChatOpen,

    // Actions
    sendMessage,
    addMessage,
    addNotification,
    toggleChat,
    closeChat,
    clearMessages,
    simulateTyping,
    quickResponses: quickResponses(),

    // Chat window props (convenience)
    chatWindowProps: {
      isOpen: isChatOpen,
      messages: state.messages,
      onSendMessage: sendMessage,
      onClose: closeChat,
      isTyping: state.isTyping,
      isLoading: state.isLoading
    },

    // Bubble props (convenience)
    bubbleProps: {
      onToggleChat: toggleChat,
      isChatOpen,
      unreadCount: state.unreadCount,
      isTyping: state.isTyping
    }
  }
}