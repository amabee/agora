import { userService } from "../services/user.service.js";
import { randomUUID } from "crypto";

export const userController = {
  // GET /users
  async getAllUsers(request, reply) {
    try {
      const users = await userService.getAllUsers();
      return reply.code(200).send({ success: true, data: users });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch users" });
    }
  },

  // GET /users/:id
  async getUserById(request, reply) {
    try {
      const { id } = request.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return reply.code(404).send({ success: false, error: "User not found" });
      }

      return reply.code(200).send({ success: true, data: user });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch user" });
    }
  },

  // POST /users
  async createUser(request, reply) {
    try {
      const { username } = request.body;

      if (!username) {
        return reply.code(400).send({ 
          success: false, 
          error: "Username is required" 
        });
      }

      // Check if username already exists
      const existingUser = await userService.getUserByUsername(username);
      if (existingUser) {
        return reply.code(409).send({ 
          success: false, 
          error: "Username already exists" 
        });
      }

      const userData = {
        id: randomUUID(),
        username,
      };

      const user = await userService.createUser(userData);
      return reply.code(201).send({ success: true, data: user });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to create user" });
    }
  },

  // GET /users/username/:username
  async getUserByUsername(request, reply) {
    try {
      const { username } = request.params;
      const user = await userService.getUserByUsername(username);

      if (!user) {
        return reply.code(404).send({ success: false, error: "User not found" });
      }

      return reply.code(200).send({ success: true, data: user });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to fetch user" });
    }
  },

  // POST /users/:id/leave-all-rooms
  async leaveAllRooms(request, reply) {
    try {
      const { id } = request.params;

      const result = await userService.removeFromAllRooms(id);
      return reply.code(200).send({ 
        success: true, 
        message: `Removed from ${result} room(s)`,
        count: result
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ success: false, error: "Failed to leave rooms" });
    }
  },
};
