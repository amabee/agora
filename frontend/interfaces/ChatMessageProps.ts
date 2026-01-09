import type { Message } from "./Message"

export interface ChatMessageProps {
  message: Message
  onReact?: (messageId: string, emoji: string) => void
}
