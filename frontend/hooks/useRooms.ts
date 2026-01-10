import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "@/interfaces/Room";

const API_URL = `http://${process.env.NEXT_PUBLIC_SERVER_URL || "localhost"}:${process.env.NEXT_PUBLIC_SERVER_PORT || "8001"}`;

// Fetch all rooms for map display (no pagination)
async function fetchAllRooms(): Promise<Room[]> {
  const response = await fetch(`${API_URL}/api/rooms?limit=1000&offset=0`);
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const result = await response.json();
  
  // Map backend response to frontend Room interface
  return result.data.map((room: any) => ({
    id: room.id.toString(),
    name: room.name,
    type: room.type === "mixed" ? "mixed" : room.type,
    participants: room.participant_count || 0,
    active: true,
    password: room.password,
    is_password_protected: room.is_password_protected === 1,
    lat: parseFloat(room.latitude),
    lng: parseFloat(room.longitude),
  }));
}

// Fetch rooms with pagination for dropdown
async function fetchRooms({ pageParam = 0 }): Promise<{ rooms: Room[]; nextOffset: number | undefined; hasMore: boolean }> {
  const limit = 10;
  const response = await fetch(`${API_URL}/api/rooms?limit=${limit}&offset=${pageParam}`);
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const result = await response.json();
  
  // Map backend response to frontend Room interface
  const rooms = result.data.map((room: any) => ({
    id: room.id.toString(),
    name: room.name,
    type: room.type === "mixed" ? "mixed" : room.type,
    participants: room.participant_count || 0,
    active: true,
    password: room.password,
    password_protected: room.is_password_protected === 1,
    lat: parseFloat(room.latitude),
    lng: parseFloat(room.longitude),
  }));

  return {
    rooms,
    nextOffset: result.pagination.hasMore ? pageParam + limit : undefined,
    hasMore: result.pagination.hasMore,
  };
}

// Create a new room
async function createRoom(roomData: {
  name: string;
  description?: string;
  type: "text" | "video" | "mixed";
  password?: string;
  lat: number;
  lng: number;
}): Promise<Room> {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: roomData.name,
      description: roomData.description,
      type: roomData.type === "mixed" ? "text" : roomData.type,
      password: roomData.password,
      latitude: roomData.lat.toString(),
      longitude: roomData.lng.toString(),
      is_public: 1,
      is_password_protected: roomData.password ? 1 : 0,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to create room");
  }
  const result = await response.json();
  const room = result.data;
  
  // Map backend response to frontend Room interface
  return {
    id: room.id.toString(),
    name: room.name,
    type: room.type === "mixed" ? "text" : room.type,
    participants: room.participant_count || 0,
    active: true,
    password: room.password,
    password_protected: room.is_password_protected === 1,
    lat: parseFloat(room.latitude),
    lng: parseFloat(room.longitude),
  };
}

// Hook to fetch all rooms for map display
export function useMapRooms() {
  return useQuery({
    queryKey: ["map-rooms"],
    queryFn: fetchAllRooms,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Hook to fetch rooms with infinite scroll for dropdown
export function useRooms() {
  return useInfiniteQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// Hook to create a new room
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      // Invalidate and refetch both map and dropdown rooms after creating a new one
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["map-rooms"] });
    },
  });
}
