import { roomController } from "../controllers/room.controller.js";

export default async function roomRoutes(app) {
  // Get all rooms (with optional filters)
  app.get("/api/rooms", roomController.getAllRooms);

  // Get nearby rooms
  app.get("/api/rooms/nearby", roomController.getRoomsNearby);

  // Join room (add member) - MUST be before /api/rooms/:id
  app.post("/api/rooms/:id/join", roomController.joinRoom);

  // Leave room (remove member) - MUST be before /api/rooms/:id
  app.post("/api/rooms/:id/leave", roomController.leaveRoom);

  // Verify room password - MUST be before /api/rooms/:id
  app.post("/api/rooms/:id/verify-password", roomController.verifyPassword);

  // Get room members - MUST be before /api/rooms/:id
  app.get("/api/rooms/:id/members", roomController.getRoomMembers);

  // Get room by ID
  app.get("/api/rooms/:id", roomController.getRoomById);

  // Create room
  app.post("/api/rooms", roomController.createRoom);

  // Update room
  app.put("/api/rooms/:id", roomController.updateRoom);

  // Delete room
  app.delete("/api/rooms/:id", roomController.deleteRoom);
}
