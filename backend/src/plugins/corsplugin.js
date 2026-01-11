import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { config } from "../config/index.js";

async function corsPlugin(app) {
  // // Get origins from config
  // const origins = config.cors.origin.length > 0 ? config.cors.origin : ["http://localhost:3000"];

  // console.log("Allowed CORS origins:", origins);

  // app.register(cors, {
  //   origin: (origin, callback) => {

  //     console.log("Request origin:", origin);

  //     // Allow requests with no origin (Postman, curl, server-to-server)
  //     if (!origin) {
  //       return callback(null, true);
  //     }

  //     // Remove trailing slash for comparison
  //     const normalizedOrigin = origin.replace(/\/$/, '');
  //     const normalizedOrigins = origins.map(o => o.replace(/\/$/, ''));

  //     if (normalizedOrigins.includes(normalizedOrigin)) {
  //       return callback(null, true);
  //     } else {
  //       console.log("Origin rejected:", origin);
  //       return callback(new Error("Not allowed by CORS"), false);
  //     }
  //   },
  //   credentials: true,
  //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  //   allowedHeaders: [
  //     "Content-Type",
  //     "Authorization",
  //     "X-Requested-With",
  //     "Range",
  //     "Accept-Ranges",
  //     "Content-Range",
  //     "Accept",
  //     "Cache-Control",
  //     "cache-control",
  //     "common",
  //     "delete",
  //     "get",
  //     "head",
  //     "patch",
  //     "post",
  //     "put",
  //   ],
  //   exposedHeaders: [
  //     "X-Total-Count",
  //     "X-RateLimit-Limit",
  //     "X-RateLimit-Remaining",
  //     "X-RateLimit-Reset",
  //     "Accept-Ranges",
  //     "Content-Range",
  //     "Content-Length",
  //   ],
  // });

  app.register(cors, {
    origin: true,
    methods: ["*"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"],
  });
}

export default fp(corsPlugin);
