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

  return (
    <div
      className={cn(
        "group flex gap-3 px-3 py-3 hover:bg-white/5 transition-colors",
        message.isOwnMessage && "bg-white/5"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        <div className={cn(
          "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-semibold",
          getAvatarColor(message.username)
        )}>
          {message.avatar || message.username.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-white">
            {message.username}
          </span>
          {message.role && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-medium">
              {message.role}
            </span>
          )}
          <span className="text-xs text-white/40" suppressHydrationWarning>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Image Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex gap-2 mb-2">
            {message.attachments
              .filter((a) => a.type === "image")
              .map((attachment, idx) => (
                <div
                  key={idx}
                  className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center overflow-hidden"
                >
                  {/* Placeholder for actual images */}
                  <div className="w-full h-full bg-gradient-to-br from-orange-300 to-yellow-400 flex items-center justify-center">
                    <span className="text-3xl">🐥</span>
                  </div>
                </div>
              ))}
          </div>
        )}
        
        <p className="text-sm text-white/80 leading-relaxed break-words">
          {message.content}
        </p>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                onClick={() => onReact?.(message.id, reaction.emoji)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-xs transition-colors"
              >
                <span>{reaction.emoji}</span>
                <span className="text-white/60">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
