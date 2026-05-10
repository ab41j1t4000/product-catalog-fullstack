import type { FastifyPluginAsync } from "fastify";

import { signInSchema } from "../schemas/cart.schema.js";
import { adminCredentialsSchema } from "../schemas/product.schema.js";
import { getUserFromRequest, signInAdmin, signInUser } from "../services/cart.service.js";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/sign-in", async (request, reply) => {
    const body = signInSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    const session = await signInUser(body.data);
    return session;
  });

  fastify.post("/auth/admin-sign-in", async (request, reply) => {
    const body = adminCredentialsSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    try {
      return await signInAdmin(body.data);
    } catch (error) {
      return reply.code(401).send({
        error: error instanceof Error ? error.message : "Invalid admin credentials",
      });
    }
  });

  fastify.get("/auth/me", async (request, reply) => {
    const user = await getUserFromRequest(request);
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    return { user };
  });
};
