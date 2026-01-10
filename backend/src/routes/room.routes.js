import { roomController } from "../controllers/room.controller.js";

export default async function roomRoutes(app) {
  // Get all rooms (with optional filters)
  app.get("/api/rooms", roomController.getAllRooms);

  // Get nearby rooms
  app.get("/api/rooms/nearby", roomController.getRoomsNearby);

  // Get room by ID
  app.get("/api/rooms/:id", roomController.getRoomById);

  // Create room
  app.post("/api/rooms", roomController.createRoom);

  // Update room
  app.put("/api/rooms/:id", roomController.updateRoom);

  // Delete room
  app.delete("/api/rooms/:id", roomController.deleteRoom);

  // Get room members
  app.get("/api/rooms/:id/members", roomController.getRoomMembers);
}
