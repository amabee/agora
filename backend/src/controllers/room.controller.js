import { roomService } from "../services/room.service.js";

export const roomController = {
  // GET /rooms
  async getAllRooms(request, reply) {
    try {
      const { type, is_public, limit = 10, offset = 0 } = request.query;
      const filters = {};

      if (type) filters.type = type;
      if (is_public !== undefined) filters.is_public = parseInt(is_public);

      const rooms = await roomService.getAllRooms(
        filters, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      const total = await roomService.getRoomsCount(filters);
      
      return reply.code(200).send({ 
        success: true, 
        data: rooms,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
          hasMore: parseInt(offset) + rooms.length < total
        }
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch rooms" });
    }
  },

  // GET /rooms/:id
  async getRoomById(request, reply) {
    try {
      const { id } = request.params;
      const room = await roomService.getRoomById(id);

      if (!room) {
        return reply.code(404).send({ success: false, error: "Room not found" });
      }

      return reply.code(200).send({ success: true, data: room });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch room" });
    }
  },

  // GET /rooms/nearby
  async getRoomsNearby(request, reply) {
    try {
      const { latitude, longitude, radius } = request.query;

      if (!latitude || !longitude) {
        return reply.code(400).send({ 
          success: false, 
          error: "Latitude and longitude are required" 
        });
      }

      const rooms = await roomService.getRoomsNearLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        radius ? parseFloat(radius) : 10
      );

      return reply.code(200).send({ success: true, data: rooms });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch nearby rooms" });
    }
  },

  // POST /rooms
  async createRoom(request, reply) {
    try {
      const { name, password, description, type, latitude, longitude, is_public, created_by } = request.body;

      // Validation
      if (!name || !type || latitude === undefined || longitude === undefined) {
        return reply.code(400).send({ 
          success: false, 
          error: "Missing required fields: name, type, latitude, longitude" 
        });
      }

      if (!["text", "video", "mixed"].includes(type)) {
        return reply.code(400).send({ 
          success: false, 
          error: "Invalid type. Must be: text, video, or mixed" 
        });
      }

      const roomData = {
        name,
        password,
        description,
        type,
        latitude,
        longitude,
        is_public: is_public ?? 1,
        is_password_protected: password ? 1 : 0,
        created_by,
      };

      const room = await roomService.createRoom(roomData);
      return reply.code(201).send({ success: true, data: room });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to create room" });
    }
  },

  // PUT /rooms/:id
  async updateRoom(request, reply) {
    try {
      const { id } = request.params;
      const roomData = request.body;

      // Check if room exists
      const existingRoom = await roomService.getRoomById(id);
      if (!existingRoom) {
        return reply.code(404).send({ success: false, error: "Room not found" });
      }

      // Validate type if provided
      if (roomData.type && !["text", "video", "mixed"].includes(roomData.type)) {
        return reply.code(400).send({ 
          success: false, 
          error: "Invalid type. Must be: text, video, or mixed" 
        });
      }

      const updatedRoom = await roomService.updateRoom(id, roomData);
      return reply.code(200).send({ success: true, data: updatedRoom });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to update room" });
    }
  },

  // DELETE /rooms/:id
  async deleteRoom(request, reply) {
    try {
      const { id } = request.params;

      const deleted = await roomService.deleteRoom(id);
      if (!deleted) {
        return reply.code(404).send({ success: false, error: "Room not found" });
      }

      return reply.code(200).send({ success: true, message: "Room deleted successfully" });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to delete room" });
    }
  },

  // GET /rooms/:id/members
  async getRoomMembers(request, reply) {
    try {
      const { id } = request.params;

      // Check if room exists
      const room = await roomService.getRoomById(id);
      if (!room) {
        return reply.code(404).send({ success: false, error: "Room not found" });
      }

      const members = await roomService.getRoomMembers(id);
      return reply.code(200).send({ success: true, data: members });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch room members" });
    }
  },
};
