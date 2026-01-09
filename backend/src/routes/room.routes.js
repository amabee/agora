import { roomController } from "../controllers/room.controller.js";

export default async function roomRoutes(app) {
  // Get all rooms (with optional filters)
  app.get("/rooms", roomController.getAllRooms);

  // Get nearby rooms
  app.get("/rooms/nearby", roomController.getRoomsNearby);

  // Get room by ID
  app.get("/rooms/:id", roomController.getRoomById);

  // Create room
  app.post("/rooms", roomController.createRoom);

  // Update room
  app.put("/rooms/:id", roomController.updateRoom);

  // Delete room
  app.delete("/rooms/:id", roomController.deleteRoom);

  // Get room members
  app.get("/rooms/:id/members", roomController.getRoomMembers);
}
