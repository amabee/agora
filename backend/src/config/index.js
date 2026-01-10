import dotenv from "dotenv";
import path from "path";

// Load .env files based on NODE_ENV
const envPath = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || "development"}`
);

dotenv.config({ path: envPath, debug: false });

// Parse DATABASE_URL
function parseDatabaseUrl(url) {
  if (!url) return {};

  try {
    const dbUrl = new URL(url);
    return {
      host: dbUrl.hostname,
      port: dbUrl.port || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
    };
  } catch (error) {
    console.error("Failed to parse DATABASE_URL:", error);
    return {};
  }
}

export const config = {
  isProd: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "8001", 10),
  host: process.env.HOST || "0.0.0.0",
  baseUrl: process.env.BASE_URL || "http://localhost:8001",

  db: {
    url: process.env.DATABASE_URL,
    ...parseDatabaseUrl(process.env.DATABASE_URL),
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || "")
      .split(",")
      .filter((origin) => origin.trim() !== ""),
  },
};
