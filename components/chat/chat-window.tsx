'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, MicOff, Bot, User, Loader2, Zap, Train, AlertTriangle, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-libre-translate'

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type: 'text' | 'file' | 'system' | 'train-data' | 'prediction'
  metadata?: {
    trainId?: string
    confidence?: number
    action?: string
    fileUrl?: string
    fileName?: string
    requiresAuth?: boolean
  }
}

interface ChatWindowProps {
  isOpen: boolean
  messages: ChatMessage[]
  onSendMessage: (message: string, file?: File) => void
  onClose: () => void
  isTyping?: boolean
  isLoading?: boolean
}

export function ChatWindow({ 
  isOpen, 
  messages, 
  onSendMessage, 
  onClose, 
  isTyping = false,
  isLoading = false 
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { language, setLanguage, tSync } = useLanguage()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (inputValue.trim() || selectedFile) {
      onSendMessage(inputValue.trim(), selectedFile || undefined)
      setInputValue('')
      setSelectedFile(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording logic
  }

  const renderMessageContent = (content: string) => {
    // Check if content contains "I can help you with" pattern and has options
    if (content.includes('I can help you with:') || content.includes('I can help you with')) {
      const lines = content.split('\n')
      const mainText = lines[0]
      const options = lines.slice(1).filter(line => line.trim().startsWith('•') || line.trim().startsWith('*'))
      
      if (options.length > 0) {
        return (
          <div>
            <p className="mb-3">{mainText}</p>
            <div className="space-y-2">
              {options.map((option, index) => {
                const cleanOption = option.replace(/^[•*]\s*/, '').replace(/:\s*".*?"/, '').trim()
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                    onClick={() => {
                      setInputValue(cleanOption)
                      // Auto-focus input
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }}
                  >
                    {cleanOption}
                  </Button>
                )
              })}
            </div>
          </div>
        )
      }
    }
    
    // Default text rendering
    return <p className="whitespace-pre-wrap">{content}</p>
  }

  const renderMessage = (message: ChatMessage) => {
    const isBot = message.sender === 'bot'
    
    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
        {isBot && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        <div className={`max-w-[80%] ${isBot ? 'order-2' : 'order-1'}`}>
          <div className={`rounded-lg px-4 py-2 ${
            isBot 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
              : 'bg-blue-600 text-white'
          }`}>
            {message.type === 'train-data' && message.metadata && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <Train className="w-4 h-4" />
                  Train {message.metadata.trainId}
                  {message.metadata.confidence && (
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(message.metadata.confidence)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {message.type === 'prediction' && (
              <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-4 border-orange-500">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <Zap className="w-4 h-4" />
                  AI Prediction
                </div>
              </div>
            )}
            
            {message.metadata?.requiresAuth ? (
              <div className="text-sm leading-relaxed">
                <p className="mb-2">{message.content}</p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                {renderMessageContent(message.content)}
              </div>
            )}
            
            {message.metadata?.fileName && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <span className="text-xs">{message.metadata.fileName}</span>
              </div>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {!isBot && (
          <div className="flex-shrink-0 order-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) {
    console.log('ChatWindow: isOpen is false, not rendering')
    return null
  }

  console.log('ChatWindow: Rendering chat window!', { isOpen, messagesCount: messages.length })

  return (
    <Card className="fixed bottom-24 right-6 w-96 h-[600px] shadow-2xl z-[9998] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span>{tSync('KMRL Assistant')}</span>
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {tSync('AI Powered')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
              className="text-xs"
            >
              <Languages className="w-4 h-4 mr-1" />
              {language === 'en' ? 'മലയാളം' : 'English'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[420px] p-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">
                Hi! I'm your KMRL Assistant. I can help you with:
              </p>
              <ul className="text-xs mt-2 space-y-1">
                <li>• Train status and schedules</li>
                <li>• Maintenance predictions</li>
                <li>• Performance analysis</li>
                <li>• Data insights</li>
              </ul>
              <p className="text-xs mt-4 text-blue-600">Ask me anything about your trains!</p>
            </div>
          )}
          
          {messages.map(renderMessage)}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="p-4 border-t">
        {selectedFile && (
          <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              ×
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about trains, maintenance, predictions..."
              className="pr-20"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isRecording ? 'text-red-500' : ''}`}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={(!inputValue.trim() && !selectedFile) || isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".csv,.xlsx,.pdf,.jpg,.png"
        />
      </div>
    </Card>
  )
}