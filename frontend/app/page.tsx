"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
import { PasswordModal } from "@/components/password-modal";
import { Plus, Loader2 } from "lucide-react";
import { useRooms, useMapRooms, useCreateRoom } from "@/hooks/useRooms";
import type { Room } from "@/interfaces/Room";

// Dynamic import to prevent SSR issues with Leaflet
const MapLeaflet = dynamic(
  () => import("@/components/map-leaflet").then((mod) => mod.MapLeaflet),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
);

const API_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8001";
const API_HOST = process.env.NEXT_PUBLIC_SERVER_URL || "localhost";
const API_PROTOCOL = API_PORT === "443" || API_HOST.includes(".zrok.io") ? "https" : "http";
const API_URL = `${API_PROTOCOL}://${API_HOST}${API_PORT === "443" || API_PORT === "80" ? "" : `:${API_PORT}`}`;

export default function Page() {
  const router = useRouter();
  
  // Separate queries for dropdown (paginated) and map (all rooms)
  const { 
    data: dropdownData, 
    isLoading: isDropdownLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useRooms();
  
  const { 
    data: mapRooms, 
    isLoading: isMapLoading 
  } = useMapRooms();
  
  const createRoom = useCreateRoom();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Flatten dropdown pages into a single array (for dropdown infinite scroll)
  const dropdownRooms = useMemo(() => 
    dropdownData?.pages.flatMap(page => page.rooms) ?? [],
    [dropdownData]
  );

  const handleAddRoom = useCallback((newRoom: {
    name: string;
    description?: string;
    type: "text" | "video" | "mixed";
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
  }, [createRoom]);

  // Memoize filtered rooms to prevent re-calculation on every render
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return dropdownRooms;
    const query = searchQuery.toLowerCase();
    return dropdownRooms.filter((room) => room.name.toLowerCase().includes(query));
  }, [dropdownRooms, searchQuery]);

  const selectedRoomData = useMemo(() => 
    (mapRooms || []).find((r) => r.id === selectedRoom),
    [mapRooms, selectedRoom]
  );

  const getTypeLabel = useCallback((type: string) => {
    switch (type) {
      case "text":
        return "💬";
      case "video":
        return "📹";
      case "mixed":
        return "💬📹";
      default:
        return "●";
    }
  }, []);

  const handleRoomSelect = useCallback(async (roomId: string) => {
    // Look in both dropdown rooms and map rooms
    const room = dropdownRooms.find((r) => r.id === roomId) || mapRooms?.find((r) => r.id === roomId);
    if (!room) {
      console.error("Room not found:", roomId);
      return;
    }

    // Check if room is password protected
    if (room.password_protected) {
      setPendingRoomId(roomId);
      setPasswordModalOpen(true);
      setDropdownOpen(false);
      return;
    }

    // If not password protected, navigate directly
    setSelectedRoom(roomId);
    setDropdownOpen(false);
    
    // Add user to room members
    const userId = localStorage.getItem("agora_uuid");
    if (userId) {
      try {
        console.log(`🟢 Main page joining room: ${roomId}`);
        await fetch(`${API_URL}/api/rooms/${roomId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        console.log(`✅ Join API called from main page`);
      } catch (error) {
        console.error("Failed to join room:", error);
      }
    }
    
    router.push(`/${roomId}`);
  }, [dropdownRooms, mapRooms, router]);

  const handlePasswordSubmit = useCallback(async (password: string) => {
    if (!pendingRoomId) return;

    setIsVerifying(true);
    setPasswordError("");

    try {
      const response = await fetch(`${API_URL}/api/rooms/${pendingRoomId}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        // Password correct, join room and navigate
        const userId = localStorage.getItem("agora_uuid");
        if (userId) {
          await fetch(`${API_URL}/api/rooms/${pendingRoomId}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId }),
          });
        }
        
        setPasswordModalOpen(false);
        setSelectedRoom(pendingRoomId);
        setPendingRoomId(null);
        router.push(`/${pendingRoomId}`);
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Failed to verify password:", error);
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [pendingRoomId, router]);

  const handlePasswordModalClose = useCallback(() => {
    setPasswordModalOpen(false);
    setPendingRoomId(null);
    setPasswordError("");
  }, []);

  const pendingRoomData = useMemo(() => 
    (mapRooms || []).find((r) => r.id === pendingRoomId),
    [mapRooms, pendingRoomId]
  );
  return (
    <>
      <UsernameModal onUsernameSet={setUsername} />
      <AddRoomModal
        open={addRoomModalOpen}
        onOpenChange={setAddRoomModalOpen}
        onAddRoom={handleAddRoom}
      />
      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={handlePasswordModalClose}
        onSubmit={handlePasswordSubmit}
        roomName={pendingRoomData?.name || "Room"}
        isLoading={isVerifying}
        error={passwordError}
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
                <div 
                  className="max-h-96 overflow-y-auto scrollbar-thin"
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    // Load more when scrolled to bottom
                    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                >
                  {isDropdownLoading ? (
                    <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading rooms...
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery ? "No rooms found" : "No rooms available"}
                    </div>
                  ) : (
                    <>
                      {filteredRooms.map((room) => (
                        <DropdownMenuItem
                          key={room.id}
                          onClick={() => handleRoomSelect(room.id)}
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
                      ))}
                      {isFetchingNextPage && (
                        <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Loading more...
                        </div>
                      )}
                    </>
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
            key="main-map"
            rooms={mapRooms || []}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>
      </div>
    </>
  );
}
