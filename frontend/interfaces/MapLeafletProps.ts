import type { Room } from "./Room";

export interface MapLeafletProps {
  rooms: Room[];
  selectedRoom: string | null;
  onSelectRoom: (roomId: string) => void;
}
