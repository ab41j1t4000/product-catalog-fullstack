import type { FastifyPluginAsync } from "fastify";

import { adminProductSchema, productSearchSchema } from "../schemas/product.schema.js";
import { requireAdminUser } from "../services/cart.service.js";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  listAdminProducts,
  listProducts,
  updateProduct,
} from "../services/product.service.js";

export const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/products", async (request, reply) => {
    const query = productSearchSchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ error: query.error.flatten() });
    }

    return listProducts(query.data);
  });

  fastify.get("/products/:slug", async (request, reply) => {
    const params = request.params as { slug?: string };
    if (!params.slug) {
      return reply.code(400).send({ error: "Missing product slug" });
    }

    const product = await getProductBySlug(params.slug);
    if (!product) {
      return reply.code(404).send({ error: "Product not found" });
    }

    return product;
  });

  fastify.get("/admin/products", async (request, reply) => {
    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return reply.code(401).send({ error: "Admin access required" });
    }

    return listAdminProducts();
  });

  fastify.post("/admin/products", async (request, reply) => {
    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return reply.code(401).send({ error: "Admin access required" });
    }

    const body = adminProductSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    return createProduct(body.data);
  });

  fastify.put("/admin/products/:id", async (request, reply) => {
    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return reply.code(401).send({ error: "Admin access required" });
    }

    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.code(400).send({ error: "Missing product id" });
    }

    const body = adminProductSchema.safeParse(request.body);
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() });
    }

    try {
      return await updateProduct(params.id, body.data);
    } catch {
      return reply.code(404).send({ error: "Product not found" });
    }
  });

  fastify.delete("/admin/products/:id", async (request, reply) => {
    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return reply.code(401).send({ error: "Admin access required" });
    }

    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.code(400).send({ error: "Missing product id" });
    }

    try {
      await deleteProduct(params.id);
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ error: "Product not found" });
    }
  });
};
