import { messageService } from "../services/message.service.js";
import { roomService } from "../services/room.service.js";

export const messageController = {
  // GET /rooms/:roomId/messages
  async getMessages(request, reply) {
    try {
      const { roomId } = request.params;
      const { limit = 100, offset = 0 } = request.query;

      // Check if room exists
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        return reply.code(404).send({ success: false, error: "Room not found" });
      }

      // Don't allow fetching messages for video-only rooms
      if (room.type === 'video') {
        return reply.code(400).send({ 
          success: false, 
          error: "Video-only rooms do not have text messages" 
        });
      }

      const messages = await messageService.getMessagesByRoomId(
        roomId, 
        parseInt(limit), 
        parseInt(offset)
      );

      const total = await messageService.getMessageCount(roomId);

      return reply.code(200).send({ 
        success: true, 
        data: messages,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch messages" });
    }
  },

  // DELETE /messages/:messageId
  async deleteMessage(request, reply) {
    try {
      const { messageId } = request.params;
      const { userId } = request.body; // You should get this from authentication

      if (!userId) {
        return reply.code(400).send({ success: false, error: "User ID is required" });
      }

      const deleted = await messageService.deleteMessage(messageId, userId);
      if (!deleted) {
        return reply.code(404).send({ 
          success: false, 
          error: "Message not found or you don't have permission to delete it" 
        });
      }

      return reply.code(200).send({ success: true, message: "Message deleted successfully" });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to delete message" });
    }
  },
};
