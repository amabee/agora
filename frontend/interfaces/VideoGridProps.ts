import type { VideoParticipant } from "./VideoParticipant"

export interface VideoGridProps {
  participants: VideoParticipant[]
  localUserId?: string
  participantsPerPage?: number
}
