import { query } from "../db/index.js";

export const roomService = {
  // Get all rooms
  async getAllRooms(filters = {}) {
    let sql = `
    SELECT 
      r.*, 
      COUNT(rm.user_id) AS participant_count
    FROM rooms r
    LEFT JOIN room_members rm ON r.id = rm.room_id
    WHERE 1=1
  `;
    const params = [];

    if (filters.type) {
      sql += " AND r.type = ?";
      params.push(filters.type);
    }

    if (filters.is_public !== undefined) {
      sql += " AND r.is_public = ?";
      params.push(filters.is_public);
    }

    sql += " GROUP BY r.id ORDER BY r.created_at DESC";

    return await query(sql, params);
  },

  // Get room by ID
  async getRoomById(id) {
    const sql = "SELECT * FROM rooms WHERE id = ?";
    const results = await query(sql, [id]);
    return results[0];
  },

  // Get rooms near location
  async getRoomsNearLocation(latitude, longitude, radiusKm = 10) {
    const sql = `
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM rooms
      WHERE is_public = 1
      HAVING distance <= ?
      ORDER BY distance ASC
    `;
    return await query(sql, [latitude, longitude, latitude, radiusKm]);
  },

  // Create room
  async createRoom(roomData) {
    const sql = `
      INSERT INTO rooms 
      (name, password, description, type, latitude, longitude, is_public, is_password_protected, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      roomData.name,
      roomData.password || null,
      roomData.description || null,
      roomData.type,
      roomData.latitude,
      roomData.longitude,
      roomData.is_public ?? 1,
      roomData.is_password_protected ?? 0,
      roomData.created_by || null,
    ];

    const result = await query(sql, params);
    const roomId = result.insertId;

    // Automatically add creator as room member with owner role
    if (roomData.created_by) {
      const memberSql = `
        INSERT INTO room_members (room_id, user_id, role)
        VALUES (?, ?, 'owner')
      `;
      await query(memberSql, [roomId, roomData.created_by]);
    }

    return await this.getRoomById(roomId);
  },

  // Update room
  async updateRoom(id, roomData) {
    const fields = [];
    const params = [];

    if (roomData.name !== undefined) {
      fields.push("name = ?");
      params.push(roomData.name);
    }
    if (roomData.password !== undefined) {
      fields.push("password = ?");
      params.push(roomData.password);
    }
    if (roomData.description !== undefined) {
      fields.push("description = ?");
      params.push(roomData.description);
    }
    if (roomData.type !== undefined) {
      fields.push("type = ?");
      params.push(roomData.type);
    }
    if (roomData.latitude !== undefined) {
      fields.push("latitude = ?");
      params.push(roomData.latitude);
    }
    if (roomData.longitude !== undefined) {
      fields.push("longitude = ?");
      params.push(roomData.longitude);
    }
    if (roomData.is_public !== undefined) {
      fields.push("is_public = ?");
      params.push(roomData.is_public);
    }
    if (roomData.is_password_protected !== undefined) {
      fields.push("is_password_protected = ?");
      params.push(roomData.is_password_protected);
    }

    if (fields.length === 0) {
      return await this.getRoomById(id);
    }

    params.push(id);
    const sql = `UPDATE rooms SET ${fields.join(", ")} WHERE id = ?`;
    await query(sql, params);

    return await this.getRoomById(id);
  },

  // Delete room
  async deleteRoom(id) {
    const sql = "DELETE FROM rooms WHERE id = ?";
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  // Get room members
  async getRoomMembers(roomId) {
    const sql = `
      SELECT rm.*, u.username, u.last_active
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at ASC
    `;
    return await query(sql, [roomId]);
  },
};
