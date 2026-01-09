"use client"

import { useState, useEffect } from "react"
import { ChatMessagesList } from "@/components/chat-messages-list"
import { ChatInput } from "@/components/chat-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Message } from "@/interfaces/Message"
import type { Participant } from "@/interfaces/Participant"
import type { SidePanelChatProps } from "@/interfaces/SidePanelChatProps"


export function SidePanelChat({
  messages,
  participants = [],
  onSendMessage,
  onReact,
  isOpen,
  onClose,
  participantCount,
  defaultTab = "chat",
  onTabChange,
}: SidePanelChatProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "participants">(defaultTab)

  // Sync with defaultTab when it changes from outside
  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const handleTabChange = (tab: "chat" | "participants") => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div
      className={cn(
        "h-full bg-[#1e1e1e] border-l border-white/10 flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-80" : "w-0 overflow-hidden"
      )}
    >
      {isOpen && (
        <>
          {/* Header with Tabs */}
          <div className="h-14 border-b border-white/10 px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("chat")}
                className={cn(
                  "h-8 px-4 rounded-full text-sm font-medium transition-all",
                  activeTab === "chat"
                    ? "bg-[#3a3a3a] text-white"
                    : "text-white/60 hover:text-white hover:bg-transparent"
                )}
              >
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("participants")}
                className={cn(
                  "h-8 px-4 rounded-full text-sm font-medium transition-all",
                  activeTab === "participants"
                    ? "bg-[#3a3a3a] text-white"
                    : "text-white/60 hover:text-white hover:bg-transparent"
                )}
              >
                Participants
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full" 
              onClick={onClose}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Content */}
          {activeTab === "chat" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <ChatMessagesList messages={messages} onReact={onReact} />
              </div>
              <div className="border-t border-white/10 shrink-0">
                <ChatInput onSendMessage={onSendMessage} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {participants.map((participant, idx) => (
                  <div
                    key={participant.id || idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {participant.avatar || participant.username.charAt(0)}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e1e]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white truncate">{participant.username}</p>
                        {participant.role && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            {participant.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        {participant.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
