import type { Message } from "./Message"
import type { Participant } from "./Participant"

export interface SidePanelChatProps {
  messages: Message[]
  participants?: Participant[]
  onSendMessage: (content: string) => void
  onReact: (messageId: string, emoji: string) => void
  isOpen: boolean
  onClose: () => void
  participantCount: number
  defaultTab?: "chat" | "participants"
  onTabChange?: (tab: "chat" | "participants") => void
}
