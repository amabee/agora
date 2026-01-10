import { userController } from "../controllers/user.controller.js";

export default async function userRoutes(app) {
  // Get all users
  app.get("/users", userController.getAllUsers);

  // Get user by ID
  app.get("/users/:id", userController.getUserById);

  // Get user by username
  app.get("/users/username/:username", userController.getUserByUsername);

  // Create user
  app.post("/users", userController.createUser);
}
