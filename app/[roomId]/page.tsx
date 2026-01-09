"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatRoomHeader } from "@/components/chat-room-header"
import { ChatMessagesList } from "@/components/chat-messages-list"
import { ChatInput } from "@/components/chat-input"
import { ChatParticipantsPanel } from "@/components/chat-participants-panel"
import { SidePanelChat } from "@/components/side-panel-chat"
import { VideoGrid, type VideoParticipant } from "@/components/video-grid"
import { VideoControls } from "@/components/video-controls"
import type { Message } from "@/components/chat-message"
import type { Participant } from "@/components/chat-participants-panel"
import { Button } from "@/components/ui/button"

// Mock data - replace with real data from your backend
const MOCK_ROOMS = {
  "room-1": { name: "[ Backlog 03 ] Audio Redesign Landing Page", type: "text-video" as const },
  "room-2": { name: "Park Discussion", type: "text" as const },
  "room-3": { name: "Studio Session", type: "video" as const },
  "room-4": { name: "Community Center", type: "text-video" as const },
  "room-5": { name: "Quiet Corner", type: "text" as const },
  "room-6": { name: "Nice Channel", type: "text-video" as const },
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    userId: "user-1",
    username: "Oliver I",
    role: "Web Designer",
    content: "When you starting a company you are thinking on how to cut expenses.",
    timestamp: new Date(Date.now() - 3600000),
    avatar: "OI",
    attachments: [
      { type: "image", url: "/placeholder-1.jpg" },
      { type: "image", url: "/placeholder-2.jpg" },
    ],
  },
  {
    id: "2",
    userId: "user-2",
    username: "Kyle Peters",
    role: "Web Designer",
    content: "When you starting a company you are thinking on how to cut expenses. One of such options to cut the startup costs is a company logo design.",
    timestamp: new Date(Date.now() - 3000000),
    avatar: "KP",
  },
  {
    id: "3",
    userId: "current-user",
    username: "You",
    role: "Business Analyst",
    content: "Nice!",
    timestamp: new Date(Date.now() - 1800000),
    isOwnMessage: true,
  },
]

const MOCK_PARTICIPANTS: Participant[] = [
  { id: "user-1", username: "James", isOnline: true, role: "admin", avatar: "J" },
  { id: "user-2", username: "Mary B", isOnline: true, role: "moderator", avatar: "MB" },
  { id: "user-3", username: "Oliver I", isOnline: true, avatar: "OI" },
  { id: "user-4", username: "John", isOnline: true, avatar: "J" },
  { id: "user-5", username: "Jessica", isOnline: true, avatar: "J" },
  { id: "user-6", username: "Simona V", isOnline: true, avatar: "SV" },
  { id: "user-7", username: "Nina Williams", isOnline: true, avatar: "NW" },
  { id: "user-8", username: "Inna Y", isOnline: true, avatar: "IY" },
  { id: "user-9", username: "Alex Chen", isOnline: true, avatar: "AC" },
  { id: "user-10", username: "Sarah M", isOnline: true, role: "moderator", avatar: "SM" },
  { id: "user-11", username: "Mike Torres", isOnline: false, avatar: "MT" },
  { id: "user-12", username: "Emily R", isOnline: true, avatar: "ER" },
  { id: "user-13", username: "David Kim", isOnline: true, avatar: "DK" },
  { id: "user-14", username: "Lisa P", isOnline: false, avatar: "LP" },
  { id: "user-15", username: "Ryan Foster", isOnline: true, avatar: "RF" },
  { id: "user-16", username: "Amanda J", isOnline: true, avatar: "AJ" },
  { id: "user-17", username: "Chris Lee", isOnline: false, avatar: "CL" },
  { id: "user-18", username: "Sophie D", isOnline: true, avatar: "SD" },
  { id: "user-19", username: "Marcus Wright", isOnline: true, avatar: "MW" },
  { id: "current-user", username: "Zoe S (You)", isOnline: true, avatar: "ZS" },
]

const MOCK_VIDEO_PARTICIPANTS: VideoParticipant[] = [
  { id: "user-1", username: "James", isMuted: false, isVideoOff: false, isSpeaking: false, avatar: "J", hasVideo: true },
  { id: "user-2", username: "Mary B", isMuted: false, isVideoOff: false, isSpeaking: true, avatar: "MB", hasVideo: true },
  { id: "user-3", username: "Oliver I", isMuted: false, isVideoOff: true, avatar: "OI", hasVideo: false },
  { id: "user-4", username: "John", isMuted: false, isVideoOff: false, avatar: "J", hasVideo: true },
  { id: "user-5", username: "Jessica", isMuted: false, isVideoOff: false, isSpeaking: true, avatar: "J", hasVideo: true },
  { id: "user-6", username: "Simona V", isMuted: false, isVideoOff: true, avatar: "SV", hasVideo: false },
  { id: "user-7", username: "Nina Williams", isMuted: false, isVideoOff: false, avatar: "NW", hasVideo: true },
  { id: "user-8", username: "Inna Y", isMuted: false, isVideoOff: true, avatar: "IY", hasVideo: false },
  { id: "user-9", username: "Alex Chen", isMuted: true, isVideoOff: false, isSpeaking: false, avatar: "AC", hasVideo: true },
  { id: "user-10", username: "Sarah M", isMuted: false, isVideoOff: false, isSpeaking: false, avatar: "SM", hasVideo: true },
  { id: "user-11", username: "Mike Torres", isMuted: false, isVideoOff: true, avatar: "MT", hasVideo: false },
  { id: "user-12", username: "Emily R", isMuted: true, isVideoOff: false, isSpeaking: false, avatar: "ER", hasVideo: true },
  { id: "user-13", username: "David Kim", isMuted: false, isVideoOff: false, isSpeaking: true, avatar: "DK", hasVideo: true },
  { id: "user-14", username: "Lisa P", isMuted: false, isVideoOff: true, avatar: "LP", hasVideo: false },
  { id: "user-15", username: "Ryan Foster", isMuted: true, isVideoOff: true, avatar: "RF", hasVideo: false },
  { id: "user-16", username: "Amanda J", isMuted: false, isVideoOff: false, isSpeaking: false, avatar: "AJ", hasVideo: true },
  { id: "user-17", username: "Chris Lee", isMuted: false, isVideoOff: true, avatar: "CL", hasVideo: false },
  { id: "user-18", username: "Sophie D", isMuted: false, isVideoOff: false, isSpeaking: true, avatar: "SD", hasVideo: true },
  { id: "user-19", username: "Marcus Wright", isMuted: true, isVideoOff: false, isSpeaking: false, avatar: "MW", hasVideo: true },
  { id: "current-user", username: "Zoe S (You)", isMuted: false, isVideoOff: false, avatar: "ZS", hasVideo: true },
]

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS)
  const [videoParticipants, setVideoParticipants] = useState<VideoParticipant[]>(MOCK_VIDEO_PARTICIPANTS)
  const [showParticipants, setShowParticipants] = useState(false)
  const [roomId, setRoomId] = useState<string>("")
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(83) // Starting at 1:23

  useEffect(() => {
    // Unwrap the params promise
    Promise.resolve(params).then((resolvedParams) => {
      setRoomId(resolvedParams.roomId)
    })
  }, [params])

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const roomData = MOCK_ROOMS[roomId as keyof typeof MOCK_ROOMS] || {
    name: "Unknown Room",
    type: "text" as const,
  }

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      userId: "current-user",
      username: "You",
      content,
      timestamp: new Date(),
      isOwnMessage: true,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find((r) => r.emoji === emoji)
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              ),
            }
          }
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1 }],
          }
        }
        return msg
      })
    )
  }

  const handleLeaveRoom = () => {
    router.push("/")
  }

  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted)
    // TODO: Implement actual mic toggle logic
  }

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    // TODO: Implement actual video toggle logic
  }

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
    // TODO: Implement actual screen share logic
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen bg-[#0f0f0f] overflow-hidden">
      {roomData.type === "video" ? (
        /* Video Only Room Layout */
        <div className="h-full flex flex-col">
          {/* Top Header Bar */}
          <div className="h-14 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            {/* Left: Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className="text-white text-sm font-medium">{roomData.name}</h1>
            </div>

            {/* Right: Live Indicator & Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">LIVE</span>
                <span className="text-white/80 text-xs">{formatTime(elapsedTime)}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                ZS
              </div>
            </div>
          </div>

          {/* Main Content Area - Full Width Video */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 p-4 min-h-0 overflow-hidden">
              <VideoGrid participants={videoParticipants} localUserId="current-user" />
            </div>

            {/* Bottom Controls */}
            <VideoControls
              onToggleMic={handleToggleMic}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onToggleChat={() => {}}
              onToggleParticipants={() => setShowParticipants(!showParticipants)}
              onLeaveCall={handleLeaveRoom}
              isMicMuted={isMicMuted}
              isVideoOff={isVideoOff}
              isScreenSharing={isScreenSharing}
              participantCount={participants.length}
              messagesCount={0}
              isChatOpen={false}
              isParticipantsOpen={showParticipants}
              isChatDisabled={true}
            />
          </div>

          {/* Participants Panel */}
          <ChatParticipantsPanel
            participants={participants}
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      ) : roomData.type === "text-video" ? (
        /* Text-Video Room Layout (Combined) */
        <div className="h-full flex flex-col">
          {/* Top Header Bar */}
          <div className="h-14 flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            {/* Left: Room Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className="text-white text-sm font-medium">{roomData.name}</h1>
            </div>

            {/* Right: Live Indicator & Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-semibold">LIVE</span>
                <span className="text-white/80 text-xs">{formatTime(elapsedTime)}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                ZS
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Video Grid Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <div className="flex-1 p-4 min-h-0 overflow-hidden">
                <VideoGrid participants={videoParticipants} localUserId="current-user" />
              </div>

              {/* Bottom Controls */}
              <VideoControls
                onToggleMic={handleToggleMic}
                onToggleVideo={handleToggleVideo}
                onToggleScreenShare={handleToggleScreenShare}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                onToggleParticipants={() => {
                  setIsChatOpen(true)
                  setShowParticipants(true)
                }}
                onLeaveCall={handleLeaveRoom}
                isMicMuted={isMicMuted}
                isVideoOff={isVideoOff}
                isScreenSharing={isScreenSharing}
                participantCount={participants.length}
                messagesCount={messages.length}
                isChatOpen={isChatOpen}
                isParticipantsOpen={showParticipants}
              />
            </div>

            {/* Side Panel Chat/Participants */}
            <SidePanelChat
              messages={messages}
              participants={participants}
              onSendMessage={handleSendMessage}
              onReact={handleReact}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              participantCount={participants.length}
              defaultTab={showParticipants ? "participants" : "chat"}
              onTabChange={(tab) => setShowParticipants(tab === "participants")}
            />
          </div>
        </div>
      ) : (
        /* Text Only Room Layout */
        <div className="h-full flex flex-col">
          {/* Header */}
          <ChatRoomHeader
            roomName={roomData.name}
            roomType={roomData.type}
            participantCount={participants.length}
            onToggleParticipants={() => setShowParticipants(!showParticipants)}
            onLeaveRoom={handleLeaveRoom}
          />
          
          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatMessagesList messages={messages} onReact={handleReact} />
            <ChatInput onSendMessage={handleSendMessage} />
          </div>

          {/* Participants Panel */}
          <ChatParticipantsPanel
            participants={participants}
            isOpen={showParticipants}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      )}
    </div>
  )
}
