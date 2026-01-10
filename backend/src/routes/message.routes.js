import { messageController } from "../controllers/message.controller.js";

export default async function messageRoutes(app) {
  // Get messages for a room
  app.get("/rooms/:roomId/messages", messageController.getMessages);

  // Delete a message
  app.delete("/messages/:messageId", messageController.deleteMessage);
}
