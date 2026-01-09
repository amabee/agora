export interface Message {
  id: string
  userId: string
  username: string
  avatar?: string
  role?: string
  content: string
  timestamp: Date
  isOwnMessage?: boolean
  reactions?: { emoji: string; count: number }[]
  attachments?: { type: "image" | "file"; url: string; name?: string }[]
}
