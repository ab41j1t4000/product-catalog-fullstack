import { checkoutSchema } from "../schemas/cart.schema.js";
import { createCheckout, getUserFromRequest } from "../services/cart.service.js";
export const cartRoutes = async (fastify) => {
    fastify.post("/checkout", async (request, reply) => {
        const user = await getUserFromRequest(request);
        if (!user) {
            return reply.code(401).send({ error: "Unauthorized" });
        }
        const body = checkoutSchema.safeParse(request.body);
        if (!body.success) {
            return reply.code(400).send({ error: body.error.flatten() });
        }
        try {
            const order = await createCheckout(user.id, body.data);
            return {
                orderId: order.id,
                paymentReference: order.paymentReference,
                subtotalCents: order.subtotalCents,
                taxCents: order.taxCents,
                totalCents: order.totalCents,
                status: order.status,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create checkout";
            return reply.code(400).send({ error: message });
        }
    });
};
//# sourceMappingURL=cart.routes.js.map