import { useQuery } from "@tanstack/react-query";
import type { Room } from "@/interfaces/Room";

const API_PORT = process.env.NEXT_PUBLIC_SERVER_PORT || "8001";
const API_HOST = process.env.NEXT_PUBLIC_SERVER_URL || "localhost";
const API_PROTOCOL = API_PORT === "443" || API_HOST.includes(".zrok.io") ? "https" : "http";
const API_URL = `${API_PROTOCOL}://${API_HOST}${API_PORT === "443" || API_PORT === "80" ? "" : `:${API_PORT}`}`;

// Fetch a single room by ID
async function fetchRoom(roomId: string): Promise<Room> {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch room");
  }
  const result = await response.json();
  const room = result.data;
  
  // Map backend response to frontend Room interface
  return {
    id: roomId, // Use the roomId from the URL since backend doesn't return it
    name: room.name,
    type: room.type, // Keep the original type (video, mixed, text, etc.)
    participants: room.participant_count || 0,
    active: true,
    password: room.password || undefined,
    password_protected: room.is_password_protected === 1,
    lat: parseFloat(room.latitude),
    lng: parseFloat(room.longitude),
  };
}

// Hook to fetch a single room
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoom(roomId),
    enabled: !!roomId, // Only fetch if roomId exists
    staleTime: 60000, // Consider data fresh for 60 seconds
  });
}
