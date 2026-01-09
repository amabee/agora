"use client"

import { useState } from "react"
import { ChatMessagesList } from "@/components/chat-messages-list"
import { ChatInput } from "@/components/chat-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FloatingChatProps } from "@/interfaces/FloatingChatProps"

export function FloatingChat({ messages, onSendMessage, onReact, isOpen, onClose }: FloatingChatProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isOpen) return null

  return (
    /* Floating Chat Panel */
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-lg shadow-2xl transition-all duration-300 ",
        isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
      )}
    >
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="font-semibold text-sm">Chat</h3>
          <span className="text-xs text-muted-foreground">({messages.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-3.5rem)]">
          <div className="flex-1 overflow-y-auto">
            <ChatMessagesList messages={messages} onReact={onReact} />
          </div>
          <div className="border-t border-border shrink-0">
            <ChatInput onSendMessage={onSendMessage} />
          </div>
        </div>
      )}
    </div>
  )
}
