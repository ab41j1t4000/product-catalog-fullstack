import type { FastifyPluginAsync } from "fastify";

import { signInSchema } from "../schemas/cart.schema.js";
import { adminCredentialsSchema } from "../schemas/product.schema.js";
import { getUserFromRequest, signInAdmin, signInUser } from "../services/cart.service.js";

// Auth routes cover customer sign-in, admin sign-in, and session lookup.
export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/sign-in", async (request, reply) => {
    // Validate incoming customer credentials before touching the database.
    const body = signInSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    // Create or update the user, then issue a new session token.
    const session = await signInUser(body.data);
    return session;
  });

  fastify.post("/auth/admin-sign-in", async (request, reply) => {
    // Admin sign-in uses a different schema because it expects username/password.
    const body = adminCredentialsSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    try {
      // The service verifies hard-coded admin credentials and returns a session.
      return await signInAdmin(body.data);
    } catch (error) {
      return reply.code(401).send({
        error: error instanceof Error ? error.message : "Invalid admin credentials",
      });
    }
  });

  fastify.get("/auth/me", async (request, reply) => {
    // This endpoint resolves the current user from the Bearer token.
    const user = await getUserFromRequest(request);
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    return { user };
  });
};
