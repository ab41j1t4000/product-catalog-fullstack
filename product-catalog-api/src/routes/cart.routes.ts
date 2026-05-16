import type { FastifyPluginAsync } from "fastify";

import { checkoutSchema } from "../schemas/cart.schema.js";
import { createCheckout, getUserFromRequest, listOrders } from "../services/cart.service.js";

// Cart routes expose checkout plus customer order-history APIs.
export const cartRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/orders", async (request, reply) => {
    const user = await getUserFromRequest(request);
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    return {
      items: await listOrders(user.id),
    };
  });

  fastify.post("/checkout", async (request, reply) => {
    // Checkout is only allowed for authenticated users.
    const user = await getUserFromRequest(request);
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Validate cart items and shipping address before calculating totals.
    const body = checkoutSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    try {
      // The service creates the order, order items, and inventory changes in one flow.
      const order = await createCheckout(user.id, body.data);

      return {
        orderId: order.id,
        paymentReference: order.paymentReference,
        subtotalCents: order.subtotalCents,
        taxCents: order.taxCents,
        totalCents: order.totalCents,
        status: order.status,
      };
    } catch (error) {
      // Business validation errors, such as missing products or low inventory, land here.
      const message =
        error instanceof Error ? error.message : "Unable to create checkout";
      return reply.code(400).send({ error: message });
    }
  });
};
