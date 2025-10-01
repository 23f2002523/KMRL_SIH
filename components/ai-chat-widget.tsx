"use client"

import { useState, useRef, useEffect } from "react"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: Array<{
    document_id: string
    title: string
    relevance_score: number
    excerpt: string
  }>
}

interface AIChatWidgetProps {
  language: "en" | "ml"
  className?: string
}

export function AiChatWidget({ language, className }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        language === "en"
          ? "Hello! I'm your KMRL Document Assistant. Ask me anything about your documents, policies, or procedures."
          : "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ KMRL ഡോക്യുമെന്റ് അസിസ്റ്റന്റ് ആണ്. നിങ്ങളുടെ രേഖകൾ, നയങ്ങൾ, അല്ലെങ്കിൽ നടപടിക്രമങ്ങൾ സംബന്ധിച്ച് എന്തും ചോദിക്കാം.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: message,
          language,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          sources: data.data.sources,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          language === "en"
            ? "Sorry, I encountered an error. Please try again."
            : "ക്ഷമിക്കണം, ഒരു പിശക് സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      audioChunks.current = []

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" })
        await processVoiceQuery(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsListening(true)
    } catch (error) {
      console.error("Voice recording error:", error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsListening(false)
    }
  }

  const processVoiceQuery = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("language", language)

      const response = await fetch("/api/ai/voice", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.data.transcript) {
        await handleSendMessage(data.data.transcript)
      }
    } catch (error) {
      console.error("Voice processing error:", error)
    }
  }

  return (
    <div className={`flex flex-col h-96 border rounded-lg bg-background ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">{language === "en" ? "AI Assistant" : "AI സഹായി"}</span>
        </div>
        <button
          onClick={isListening ? stopVoiceRecording : startVoiceRecording}
          className={`p-2 rounded-full transition-colors ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-muted hover:bg-muted/80"
          }`}
          title={language === "en" ? "Voice Query" : "ശബ്ദ ചോദ്യം"}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">{language === "en" ? "Sources:" : "ഉറവിടങ്ങൾ:"}</p>
                  {message.sources.map((source, index) => (
                    <div key={index} className="text-xs bg-background/50 rounded p-2 mb-1">
                      <div className="font-medium">{source.title}</div>
                      <div className="text-muted-foreground">{source.excerpt}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
            placeholder={
              language === "en"
                ? "Ask about documents, policies, procedures..."
                : "രേഖകൾ, നയങ്ങൾ, നടപടിക്രമങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക..."
            }
            className="flex-1 px-3 py-2 border rounded-md bg-background"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
