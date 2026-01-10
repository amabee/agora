import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Room } from "@/interfaces/Room";

const API_URL = `http://${process.env.NEXT_PUBLIC_SERVER_URL || "localhost"}:${process.env.NEXT_PUBLIC_SERVER_PORT || "8001"}`;

// Fetch all rooms
async function fetchRooms(): Promise<Room[]> {
  const response = await fetch(`${API_URL}/api/rooms`);
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
    password_protected: room.is_password_protected === 1,
    lat: parseFloat(room.latitude),
    lng: parseFloat(room.longitude),
  }));
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

// Hook to fetch all rooms
export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Auto-refetch every 60 seconds
  });
}

// Hook to create a new room
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      // Invalidate and refetch rooms after creating a new one
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}
