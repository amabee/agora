import { query } from "../db/index.js";

export const messageService = {
  // Get messages for a room
  async getMessagesByRoomId(roomId, limit = 100, offset = 0) {
    const sql = `
      SELECT m.*, u.username 
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const messages = await query(sql, [roomId, limit, offset]);
    return messages.reverse(); // Return in chronological order
  },

  // Create a new message
  async createMessage(messageData) {
    const sql = `
      INSERT INTO messages (room_id, user_id, content, message_type)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      messageData.room_id,
      messageData.user_id,
      messageData.content,
      messageData.message_type || 'text',
    ];

    const result = await query(sql, params);
    
    // Get the created message with user info
    const messageSql = `
      SELECT m.*, u.username 
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `;
    const [message] = await query(messageSql, [result.insertId]);
    return message;
  },

  // Delete a message
  async deleteMessage(messageId, userId) {
    const sql = "DELETE FROM messages WHERE id = ? AND user_id = ?";
    const result = await query(sql, [messageId, userId]);
    return result.affectedRows > 0;
  },

  // Get message count for a room
  async getMessageCount(roomId) {
    const sql = "SELECT COUNT(*) as count FROM messages WHERE room_id = ?";
    const [result] = await query(sql, [roomId]);
    return result.count;
  },
};
