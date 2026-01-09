"use client";

import { useState } from "react";
import { MapLeaflet } from "@/components/map-leaflet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UsernameModal } from "@/components/username-modal";
import { AddRoomModal } from "@/components/add-room-modal";
import { Plus, Loader2 } from "lucide-react";
import { useRooms, useCreateRoom } from "@/hooks/useRooms";
import type { Room } from "@/interfaces/Room";

export default function Page() {
  const { data: rooms = [], isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);

  const handleAddRoom = (newRoom: {
    name: string;
    description?: string;
    type: "text" | "video" | "text-video";
    password?: string;
    lat: number;
    lng: number;
  }) => {
    createRoom.mutate(newRoom, {
      onSuccess: (createdRoom) => {
        setSelectedRoom(createdRoom.id);
        setAddRoomModalOpen(false);
      },
    });
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "💬";
      case "video":
        return "📹";
      case "text-video":
        return "💬📹";
      default:
        return "●";
    }
  };

  return (
    <>
      <UsernameModal onUsernameSet={setUsername} />
      <AddRoomModal
        open={addRoomModalOpen}
        onOpenChange={setAddRoomModalOpen}
        onAddRoom={handleAddRoom}
      />
      <div className="flex h-screen bg-background flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-foreground">
              {selectedRoomData
                ? `${selectedRoomData.name}`
                : "AGORA - Discover chats on the map"}
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
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {isLoading ? (
                    <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading rooms...
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery ? "No rooms found" : "No rooms available"}
                    </div>
                  ) : (
                    filteredRooms.map((room) => (
                      <DropdownMenuItem
                        key={room.id}
                        onClick={() => {
                          setSelectedRoom(room.id);
                          setDropdownOpen(false);
                        }}
                        className={`cursor-pointer ${
                          selectedRoom === room.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="w-full py-1">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{room.name}</p>
                            <span className="text-lg">
                              {getTypeLabel(room.type)}
                            </span>
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
                <DropdownMenuSeparator />
                <div className="p-2">
                  <button
                    onClick={() => {
                      setAddRoomModalOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors flex items-center gap-2 font-medium"
                  >
                    <span className="text-lg">
                      <Plus />
                    </span>
                    Add New Room
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area - Just the Map */}
        <div className="flex-1 overflow-hidden">
          <MapLeaflet
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
          />
        </div>
      </div>
    </>
  );
}
