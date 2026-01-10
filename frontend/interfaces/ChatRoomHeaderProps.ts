export interface ChatRoomHeaderProps {
  roomName: string
  roomType: "text" | "video" | "mixed"
  participantCount: number
  onToggleParticipants?: () => void
  onLeaveRoom?: () => void
}
