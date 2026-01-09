"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Participant {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  isTyping?: boolean
  role?: "admin" | "moderator" | "member"
}

interface ChatParticipantsPanelProps {
  participants: Participant[]
  isOpen: boolean
  onClose: () => void
}

export function ChatParticipantsPanel({
  participants,
  isOpen,
  onClose,
}: ChatParticipantsPanelProps) {
  const getRoleBadge = (role?: string) => {
    if (role === "admin") return <Badge variant="default" className="text-xs">Admin</Badge>
    if (role === "moderator") return <Badge variant="secondary" className="text-xs">Mod</Badge>
    return null
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed lg:relative top-0 right-0 h-full w-80 bg-card border-l border-border z-50 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          !isOpen && "lg:hidden"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-border px-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-semibold text-lg">Participants</h2>
            <p className="text-xs text-muted-foreground">
              {participants.length} {participants.length === 1 ? "person" : "people"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {participant.avatar || participant.username.charAt(0).toUpperCase()}
                </div>
                {/* Online Indicator */}
                <span
                  className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                    participant.isOnline ? "bg-green-500" : "bg-gray-400"
                  )}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{participant.username}</p>
                  {getRoleBadge(participant.role)}
                </div>
                {participant.isTyping ? (
                  <p className="text-xs text-blue-600 dark:text-blue-400">typing...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {participant.isOnline ? "Online" : "Offline"}
                  </p>
                )}
              </div>

              {/* Actions */}
              <button className="p-1.5 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
