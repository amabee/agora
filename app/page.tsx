"use client"

import { useState } from "react"
import { MapLeaflet } from "@/components/map-leaflet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

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
   {
    id: "room-6",
    name: "Nice Channel",
    type: "text",
    participants: 800,
    active: true,
  },
]

export default function Page() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const filteredRooms = ROOMS.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedRoomData = ROOMS.find((r) => r.id === selectedRoom)

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
    <div className="flex h-screen bg-background flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-foreground">
            {selectedRoomData ? `${selectedRoomData.name}` : "AGORA - Discover chats on the map"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors border border-border flex items-center gap-2">
                🏠 Rooms
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 border-b border-border">
                <Input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredRooms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No rooms found
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <DropdownMenuItem
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room.id)
                        setDropdownOpen(false)
                      }}
                      className={`cursor-pointer ${
                        selectedRoom === room.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="w-full py-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm">{room.name}</p>
                          <span className="text-lg">{getTypeLabel(room.type)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            👥 {room.participants}
                          </span>
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
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area - Just the Map */}
      <div className="flex-1 overflow-hidden">
        <MapLeaflet selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
      </div>
    </div>
  )
}
