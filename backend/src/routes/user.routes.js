import { userController } from "../controllers/user.controller.js";

export default async function userRoutes(app) {
  // Get all users
  app.get("/api/users", userController.getAllUsers);

  // Get user by ID
  app.get("/api/users/:id", userController.getUserById);

  // Get user by username
  app.get("/api/users/username/:username", userController.getUserByUsername);

  // Create user
  app.post("/api/users", userController.createUser);

  // Leave all rooms (cleanup)
  app.post("/api/users/:id/leave-all-rooms", userController.leaveAllRooms);
}
