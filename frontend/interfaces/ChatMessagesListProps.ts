import type { Message } from "./Message"

export interface ChatMessagesListProps {
  messages: Message[]
  onReact?: (messageId: string, emoji: string) => void
}
