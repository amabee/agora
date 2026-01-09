export interface ChatRoomHeaderProps {
  roomName: string
  roomType: "text" | "video" | "text-video"
  participantCount: number
  onToggleParticipants?: () => void
  onLeaveRoom?: () => void
}
