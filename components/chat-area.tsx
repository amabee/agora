"use client"

import { useState } from "react"

interface Message {
  id: string
  user: string
  avatar: string
  text: string
  timestamp: string
}

const MESSAGES: Message[] = [
  {
    id: "1",
    user: "Alex Chen",
    avatar: "👨‍💼",
    text: "Hey everyone! Just joined the room.",
    timestamp: "10:23 AM",
  },
  {
    id: "2",
    user: "Jordan Kim",
    avatar: "👩‍💻",
    text: "Welcome! We were just discussing the new project.",
    timestamp: "10:24 AM",
  },
  {
    id: "3",
    user: "Casey Morgan",
    avatar: "👨‍🎨",
    text: "The design direction looks great so far.",
    timestamp: "10:25 AM",
  },
  {
    id: "4",
    user: "Alex Chen",
    avatar: "👨‍💼",
    text: "Thanks! I focused on the user experience flow.",
    timestamp: "10:26 AM",
  },
]

interface ChatAreaProps {
  roomId: string | null
}

export function ChatArea({ roomId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(MESSAGES)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        user: "You",
        avatar: "👤",
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setInput("")
    }
  }

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a room to start chatting
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3 group">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0">
              {message.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="font-medium text-sm text-foreground">{message.user}</p>
                <p className="text-xs text-muted-foreground">{message.timestamp}</p>
              </div>
              <p className="text-sm text-foreground mt-1 break-words">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
