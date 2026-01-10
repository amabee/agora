import Fastify from "fastify";
import { config } from "./config/index.js";
import path from "path";
import websocket from "@fastify/websocket";
import corsPlugin from "./plugins/corsplugin.js";
import helmetPlugin from "./plugins/helmet.js";
import antiBotPlugin from "./plugins/antibot-plugin.js";
import rateLimitPlugin from "./plugins/ratelimit-plugin.js";
import requestTrackerPlugin from "./plugins/request-tracker-plugin.js";
import roomRoutes from "./routes/room.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import { setupWebSocket } from "./websocket/index.js";

const app = Fastify({
  trustProxy: true,
  logger: {
    level: "warn",
  },
});

async function start() {
  try {
    // register plugins 😊
    await app.register(websocket);
    await app.register(antiBotPlugin);
    await app.register(corsPlugin);
    await app.register(helmetPlugin);
    await app.register(rateLimitPlugin);
    await app.register(requestTrackerPlugin);

    // Setup WebSocket
    await setupWebSocket(app);

    // ROUTES
    await app.register(roomRoutes);
    await app.register(messageRoutes);
    await app.register(userRoutes);

    app.get("/api/health", async (req, rep) => {
      return { status: "ok", timeStamp: new Date().toISOString() };
    });

    app.listen({ port: config.port, host: config.host }, (err, address) => {
      if (err) {
        app.log
          .error(`Something went wrong, please refer to the error message below \n\n
          Error Message: ${err}`);
        process.exit(1);
      }

      console.log(`🚀 Server running at port ${address}`);
    });
  } catch (e) {
    console.log(`Exception: ${e}`);
  }
}

await start();
