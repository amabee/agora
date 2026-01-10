import { messageController } from "../controllers/message.controller.js";

export default async function messageRoutes(app) {
  // Get messages for a room
  app.get("/api/rooms/:roomId/messages", messageController.getMessages);

  // Delete a message
  app.delete("/api/messages/:messageId", messageController.deleteMessage);
}
