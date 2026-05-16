import type { FastifyPluginAsync } from "fastify";

import { adminProductSchema, productSearchSchema } from "../schemas/product.schema.js";
import { requireAdminUser } from "../services/cart.service.js";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  listAdminProducts,
  listCategories,
  listProducts,
  updateProduct,
} from "../services/product.service.js";

// Product routes expose both the customer catalog and admin product management APIs.
export const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/products", async (request, reply) => {
    // Query params are validated and coerced before building a Prisma query.
    const query = productSearchSchema.safeParse(request.query);
    if (!query.success) {
      return reply.code(400).send({ error: query.error.flatten() });
    }

    return listProducts(query.data);
  });

  fastify.get("/products/:slug", async (request, reply) => {
    // Route params are manually checked because Fastify params are untyped here.
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

  fastify.get("/categories", async () => {
    const categories = await listCategories();
    return { items: categories };
  });

  fastify.get("/admin/products", async (request, reply) => {
    // All admin product routes require an authenticated admin user.
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

    // Product create/update payloads use the same validation schema.
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
      // The service recalculates the slug if the product name changes.
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
      // Delete returns 204 so the client knows the resource is gone and no body follows.
      await deleteProduct(params.id);
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ error: "Product not found" });
    }
  });
};
