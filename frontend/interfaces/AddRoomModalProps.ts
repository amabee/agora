export interface AddRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddRoom: (room: {
    name: string
    description?: string
    type: "text" | "video" | "mixed"
    password?: string
    lat: number,
    lng: number
  }) => void
}
