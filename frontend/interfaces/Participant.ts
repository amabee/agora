export interface Participant {
  id: string
  username: string
  avatar?: string
  isOnline: boolean
  isTyping?: boolean
  role?: "admin" | "moderator" | "member"
}
