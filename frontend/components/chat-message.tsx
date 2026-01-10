"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/interfaces/Message"
import type { ChatMessageProps } from "@/interfaces/ChatMessageProps"

export type { Message }

export function ChatMessage({ message, onReact }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-purple-500 to-purple-700",
      "from-blue-500 to-blue-700", 
      "from-green-500 to-green-700",
      "from-yellow-500 to-orange-600",
      "from-pink-500 to-pink-700",
      "from-cyan-500 to-cyan-700",
    ]
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  // System message styling
  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{message.content}</span>
          <span className="text-white/30" suppressHydrationWarning>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Chat bubble design - Own messages on right, others on left
  return (
    <div
      className={cn(
        "flex gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
        message.isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar - only show for other users on left */}
      {!message.isOwnMessage && (
        <div className="shrink-0 self-end mb-1">
          <div className={cn(
            "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-semibold shadow-lg",
            getAvatarColor(message.username)
          )}>
            {message.avatar || message.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        message.isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* Username - only show for other users */}
        {!message.isOwnMessage && (
          <span className="text-xs font-medium text-white/60 px-3">
            {message.username}
          </span>
        )}

        {/* Bubble Content */}
        <div className={cn(
          "px-4 py-2.5 shadow-lg transition-all duration-200",
          message.isOwnMessage 
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-md" 
            : "bg-white/10 backdrop-blur-sm text-white rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md hover:bg-white/15"
        )}>
          {/* Image Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-2 mb-2">
              {message.attachments
                .filter((a) => a.type === "image")
                .map((attachment, idx) => (
                  <div
                    key={idx}
                    className="w-40 h-40 rounded-lg overflow-hidden"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-orange-300 to-yellow-400 flex items-center justify-center">
                      <span className="text-3xl">🐥</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => onReact?.(message.id, reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-black/20 hover:bg-black/30 rounded-full text-xs transition-colors"
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className={cn(
          "text-[10px] text-white/40 px-3",
          message.isOwnMessage && "text-right"
        )} suppressHydrationWarning>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* Avatar - show for own messages on right */}
      {message.isOwnMessage && (
        <div className="shrink-0 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
            {message.avatar || message.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
