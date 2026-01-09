export const config = {
  cors: {
    origin: ["http://192.168.1.3:3000", "http://localhost:3000"]
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "agora"
  },
  server: {
    port: process.env.PORT || 8001,
    host: process.env.HOST || "0.0.0.0"
  }
};
