import { query } from "../db/index.js";

export const userService = {
  // Get user by ID
  async getUserById(id) {
    const sql = "SELECT id, username, created_at, last_active FROM users WHERE id = ?";
    const results = await query(sql, [id]);
    return results[0];
  },

  // Get user by username
  async getUserByUsername(username) {
    const sql = "SELECT id, username, created_at, last_active FROM users WHERE username = ?";
    const results = await query(sql, [username]);
    return results[0];
  },

  // Create user
  async createUser(userData) {
    const sql = `
      INSERT INTO users (id, username)
      VALUES (?, ?)
    `;
    const params = [
      userData.id,
      userData.username,
    ];

    await query(sql, params);
    return await this.getUserById(userData.id);
  },

  // Update last active
  async updateLastActive(userId) {
    const sql = "UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?";
    await query(sql, [userId]);
  },

  // Get all users
  async getAllUsers() {
    const sql = "SELECT id, username, created_at, last_active FROM users ORDER BY created_at DESC";
    return await query(sql);
  },

  // Remove user from all rooms
  async removeFromAllRooms(userId) {
    const sql = "DELETE FROM room_members WHERE user_id = ?";
    const result = await query(sql, [userId]);
    return result.affectedRows;
  },
};
