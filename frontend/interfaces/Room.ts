export interface Room {
  id: string;
  name: string;
  type: "text" | "video" | "text-video";
  participants: number;
  active: boolean;
  password?: string;
  password_protected?: boolean;
  lat: number;
  lng: number;
}
