"use client"

import { useEffect, useRef, useState } from "react"
import { ChatMessage, type Message } from "./chat-message"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatMessagesListProps {
  messages: Message[]
  onReact?: (messageId: string, emoji: string) => void
}

export function ChatMessagesList({ messages, onReact }: ChatMessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
    setHasNewMessages(false)
    setShowScrollButton(false)
  }

  const handleScroll = () => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isNearBottom)
    
    if (isNearBottom) {
      setHasNewMessages(false)
      setIsUserScrolling(false)
    } else {
      setIsUserScrolling(true)
    }
  }

  useEffect(() => {
    // Auto-scroll only if user is not actively scrolling up
    if (!isUserScrolling) {
      scrollToBottom("smooth")
    } else {
      setHasNewMessages(true)
    }
  }, [messages.length])

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom("auto")
  }, [])

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">No messages yet</h3>
            <p className="text-sm text-white/40 max-w-sm">
              Be the first to send a message in this room!
            </p>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} onReact={onReact} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={() => scrollToBottom()}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white",
              hasNewMessages && "animate-pulse"
            )}
          >
            {hasNewMessages && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}
