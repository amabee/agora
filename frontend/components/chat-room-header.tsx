"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { ChatRoomHeaderProps } from "@/interfaces/ChatRoomHeaderProps"

export function ChatRoomHeader({
  roomName,
  roomType,
  participantCount,
  onToggleParticipants,
  onLeaveRoom,
}: ChatRoomHeaderProps) {
  const getRoomTypeIcon = () => {
    switch (roomType) {
      case "text":
        return "💬"
      case "video":
        return "📹"
      case "text-video":
        return "💬📹"
    }
  }

  const getRoomTypeLabel = () => {
    switch (roomType) {
      case "text":
        return "Text Only"
      case "video":
        return "Video Only"
      case "text-video":
        return "Chat & Video"
    }
  }

  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="icon" className="shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>

        {/* Room Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-2xl shrink-0">{getRoomTypeIcon()}</div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-lg leading-tight truncate">{roomName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {getRoomTypeLabel()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Participants Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleParticipants}
          title="View participants"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" title="Room settings">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>

        {/* Leave Room */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeaveRoom}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Leave
        </Button>
      </div>
    </div>
  )
}
