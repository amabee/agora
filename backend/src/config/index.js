export const config = {
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ["http://localhost:3000", "http://192.168.1.8:3000"]
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
