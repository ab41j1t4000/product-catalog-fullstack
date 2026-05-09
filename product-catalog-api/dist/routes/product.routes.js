import { productSearchSchema } from "../schemas/product.schema.js";
import { getProductBySlug, listProducts } from "../services/product.service.js";
export const productRoutes = async (fastify) => {
    fastify.get("/products", async (request, reply) => {
        const query = productSearchSchema.safeParse(request.query);
        if (!query.success) {
            return reply.code(400).send({ error: query.error.flatten() });
        }
        return listProducts(query.data);
    });
    fastify.get("/products/:slug", async (request, reply) => {
        const params = request.params;
        if (!params.slug) {
            return reply.code(400).send({ error: "Missing product slug" });
        }
        const product = await getProductBySlug(params.slug);
        if (!product) {
            return reply.code(404).send({ error: "Product not found" });
        }
        return product;
    });
};
//# sourceMappingURL=product.routes.js.map