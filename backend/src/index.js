import Fastify from "fastify";
import cors from "@fastify/cors";
import env from "@fastify/env";

const app = Fastify({
  trustProxy: true,
  logger: {
    level: "warn",
    prettyPrint: false,
  },
});

// Environment configuration schema
const schema = {
  type: "object",
  required: ["PORT", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"],
  properties: {
    PORT: {
      type: "string",
      default: "3000",
    },
    HOST: {
      type: "string",
      default: "0.0.0.0",
    },
    DB_HOST: {
      type: "string",
    },
    DB_USER: {
      type: "string",
    },
    DB_PASSWORD: {
      type: "string",
    },
    DB_NAME: {
      type: "string",
    },
  },
};

async function start() {
  try {
    // Register env plugin
    await app.register(env, {
      schema,
      dotenv: true,
    });

    // Register CORS
    await app.register(cors, {
      origin: true,
    });

    // Health check route
    app.get("/health", async (request, reply) => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });

    // Start server
    const port = app.config.PORT;
    const host = app.config.HOST;

    await app.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
