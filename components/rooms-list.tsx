"use client"

interface Room {
  id: string
  name: string
  type: "text" | "video" | "text-video"
  participants: number
  active: boolean
}

const ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Downtown Coffee",
    type: "text-video",
    participants: 8,
    active: true,
  },
  {
    id: "room-2",
    name: "Park Discussion",
    type: "text",
    participants: 12,
    active: true,
  },
  {
    id: "room-3",
    name: "Studio Session",
    type: "video",
    participants: 5,
    active: false,
  },
  {
    id: "room-4",
    name: "Community Center",
    type: "text-video",
    participants: 15,
    active: true,
  },
  {
    id: "room-5",
    name: "Quiet Corner",
    type: "text",
    participants: 3,
    active: false,
  },
]

interface RoomsListProps {
  selectedRoom: string | null
  onSelectRoom: (roomId: string) => void
}

export function RoomsList({ selectedRoom, onSelectRoom }: RoomsListProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "💬"
      case "video":
        return "📹"
      case "text-video":
        return "💬📹"
      default:
        return "●"
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-1">
        {ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedRoom === room.id ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <p className="font-medium text-sm">{room.name}</p>
              <span className="text-lg">{getTypeLabel(room.type)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">👥 {room.participants}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  room.active
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {room.active ? "Active" : "Idle"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
