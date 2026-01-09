import type { Message } from "./Message"

export interface FloatingChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  onReact: (messageId: string, emoji: string) => void
  isOpen: boolean
  onClose: () => void
}
