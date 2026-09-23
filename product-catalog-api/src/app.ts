import cors from "@fastify/cors";
import { createHash } from "node:crypto";
import Fastify, { type FastifyReply } from "fastify";
import type { CreateProductInput, UpdateProductInput } from "./schemas/product.schema.js";
import { checkout, CheckoutServiceError } from "./services/checkout.service.js";
import {
  addCartItem,
  CartServiceError,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./services/cart.service.js";
import { getOrderById } from "./services/order.service.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  ProductServiceError,
  updateProduct,
} from "./services/product.service.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function buildServer() {
  const server = Fastify({ logger: true });
  await server.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });

  server.get("/health", async () => ({ status: "ok", message: "Hello from the backend." }));
  server.get("/products/", async (_request, reply) => {
    try {
      return { items: await getAllProducts() };
    } catch (error) {
      return handleProductError(error, reply);
    }
  });
  server.get("/products/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const product = await getProductById(id);
      if (!product) {
        reply.code(404);
        return { status: "error", message: "Product not found" };
      }
      return { status: "ok", item: product };
    } catch (error) {
      return handleProductError(error, reply);
    }
  });

  server.post("/admin/products", async (request, reply) => {
    try {
      const product = await createProduct(request.body as CreateProductInput);
      reply.code(201);
      return { status: "ok", message: "Product created successfully.", item: product };
    } catch (error) {
      return handleProductError(error, reply);
    }
  });

  server.patch("/admin/products/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const product = await updateProduct(id, request.body as UpdateProductInput);
      return { status: "ok", message: "Product updated successfully.", item: product };
    } catch (error) {
      return handleProductError(error, reply);
    }
  });

  server.get("/cart", async () => ({ status: "ok", cart: getCart() }));
  server.post("/cart/items", async (request, reply) => {
    try {
      const item = await addCartItem(request.body as { productId: string; quantity: number });
      reply.code(201);
      return { status: "ok", message: "Cart item added successfully.", item, cart: getCart() };
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  server.patch("/cart/items/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const item = updateCartItem(id, request.body as { quantity: number });
      return { status: "ok", message: "Cart item updated successfully.", item, cart: getCart() };
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  server.delete("/cart/items/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const item = removeCartItem(id);
      return { status: "ok", message: "Cart item removed successfully.", item, cart: getCart() };
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  server.post("/checkout", async (request, reply) => {
    const startedAt = Date.now();
    const idempotencyKey = request.headers["idempotency-key"];
    if (typeof idempotencyKey !== "string" || !UUID_PATTERN.test(idempotencyKey)) {
      reply.code(400);
      return {
        status: "error",
        code: "INVALID_IDEMPOTENCY_KEY",
        message: "A valid UUID Idempotency-Key header is required.",
      };
    }

    try {
      const execution = await checkout(request.body, idempotencyKey.toLowerCase());
      if (execution.replayed) reply.code(200).header("Idempotent-Replayed", "true");
      else reply.code(201);
      request.log.info(
        {
          orderId: execution.result.order.id,
          outcome: execution.replayed ? "checkout_replayed" : "checkout_completed",
          idempotencyKeyHash: createHash("sha256")
            .update(idempotencyKey)
            .digest("hex")
            .slice(0, 12),
          totalItems: execution.result.order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
          totalInr: execution.result.order.totalPriceInr,
          durationMs: Date.now() - startedAt,
        },
        "Checkout request completed",
      );
      return {
        status: "ok",
        message: "Checkout completed successfully.",
        order: execution.result.order,
        cart: execution.result.cart,
      };
    } catch (error) {
      request.log.error(
        error instanceof CheckoutServiceError
          ? { code: error.code, outcome: "checkout_failed", durationMs: Date.now() - startedAt }
          : { err: error, outcome: "checkout_failed", durationMs: Date.now() - startedAt },
        "Checkout request failed",
      );
      return handleCheckoutError(error, reply);
    }
  });

  server.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = getOrderById(id);
    if (!order) {
      reply.code(404);
      return { status: "error", code: "ORDER_NOT_FOUND", message: "Order not found." };
    }
    return { status: "ok", order };
  });

  return server;
}

function handleCartError(error: unknown, reply: FastifyReply) {
  if (error instanceof CartServiceError) {
    const statuses = {
      INVALID_QUANTITY: 400,
      PRODUCT_NOT_FOUND: 404,
      OUT_OF_STOCK: 400,
      CART_ITEM_NOT_FOUND: 404,
    } as const;
    reply.code(statuses[error.code]);
    return { status: "error", message: error.message };
  }
  reply.code(500);
  return { status: "error", message: "Internal server error" };
}

function handleProductError(error: unknown, reply: FastifyReply) {
  if (error instanceof ProductServiceError) {
    const statuses = {
      PRODUCT_NOT_FOUND: 404,
      INVALID_PRODUCT: 400,
      DUPLICATE_SLUG: 409,
      DATABASE_ERROR: 503,
    } as const;
    reply.code(statuses[error.code]);
    return { status: "error", message: error.message };
  }
  reply.code(500);
  return { status: "error", message: "Internal server error" };
}

function handleCheckoutError(error: unknown, reply: FastifyReply) {
  if (error instanceof CheckoutServiceError) {
    const statuses = {
      INVALID_CHECKOUT: 400,
      EMPTY_CART: 400,
      PRODUCT_UNAVAILABLE: 409,
      IDEMPOTENCY_KEY_REUSED: 409,
      PAYMENT_DECLINED: 422,
    } as const;
    reply.code(statuses[error.code]);
    return {
      status: "error",
      code: error.code,
      message: error.message,
      ...(error.fieldErrors === undefined ? {} : { fieldErrors: error.fieldErrors }),
    };
  }
  reply.code(500);
  return { status: "error", code: "INTERNAL_ERROR", message: "Internal server error" };
}
