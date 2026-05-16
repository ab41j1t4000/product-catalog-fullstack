import "dotenv/config";

import cors from "@fastify/cors";
import Fastify from "fastify";

import { prisma } from "./db/prisma.js";
import { authRoutes } from "./routes/auth.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { productRoutes } from "./routes/product.routes.js";

/** Bootstraps the Fastify app, registers plugins/routes, and starts the HTTP server. */
async function bootstrap() {
  // Fastify owns the request/response lifecycle for the API.
  const server = Fastify({
    logger: true,
  });

  // Allow the frontend dev server to call this API from another origin.
  await server.register(cors, {
    origin: true,
  });

  // Simple health endpoint used to confirm the server is alive.
  server.get("/health", async () => ({ status: "ok" }));

  // Register feature route groups under the shared /api prefix.
  await server.register(productRoutes, { prefix: "/api" });
  await server.register(authRoutes, { prefix: "/api" });
  await server.register(cartRoutes, { prefix: "/api" });

  const port = Number(process.env.PORT ?? 4000);
  const host = "0.0.0.0";

  // Close both the HTTP server and Prisma connection pool on shutdown.
  const close = async () => {
    await server.close();
    await prisma.$disconnect();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  await server.listen({ port, host });
}

// If startup fails, log the error and release DB connections before exiting.
bootstrap().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
