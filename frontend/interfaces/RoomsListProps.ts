import type { Room } from "./Room"

export interface RoomsListProps {
  selectedRoom: string | null
  onSelectRoom: (roomId: string) => void
}
