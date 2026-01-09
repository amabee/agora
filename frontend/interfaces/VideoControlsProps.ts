export interface VideoControlsProps {
  onToggleMic?: () => void
  onToggleVideo?: () => void
  onToggleScreenShare?: () => void
  onToggleChat?: () => void
  onToggleParticipants?: () => void
  onLeaveCall?: () => void
  onShowSettings?: () => void
  isMicMuted?: boolean
  isVideoOff?: boolean
  isScreenSharing?: boolean
  participantCount?: number
}
