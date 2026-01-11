export interface VideoParticipant {
  id: string
  username: string
  avatar?: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking?: boolean
  isPinned?: boolean
  hasVideo?: boolean
  isNew?: boolean
  stream?: MediaStream
}
