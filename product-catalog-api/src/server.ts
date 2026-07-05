import "dotenv/config";

import cors from "@fastify/cors";
import Fastify from "fastify";
import { getAllProducts } from "./services/product.service.js";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  CartServiceError
} from "./services/cart.service.js";

async function bootstrap() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });

  server.get("/health", async () => ({
    status: "ok",
    message: "Hello from the backend.",
  }));

  server.get("/products/", async () => {
    return {
      items: getAllProducts()
    }
  })

  server.get("/products/:id", async (request) => {
    const { id } = request.params as { id: string };
    const product = getAllProducts().find((p) => p.id === id);

    if (!product) {
      return {
        status: "error",
        message: "Product not found",
      };
    }

    return {
      status: "ok",
      item: product,
    };
  });


  server.get("/cart", async () => {
    return {
      status: "ok",
      cart: getCart()
    }
  });

  server.post("/cart/items", async (request, reply) => {
    try {
      const input = request.body as { productId: string; quantity: number };
      const item = addCartItem(input);
      reply.code(201);
      return {
        status: "ok",
        message: "Cart item added successfully.",
        item,
        cart: getCart()
      }
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  server.patch("/cart/items/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const input = request.body as { quantity: number };
      const item = updateCartItem(id, input);
      return {
        status: "ok",
        message: "Cart item updated successfully.",
        item,
        cart: getCart()
      };
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  server.delete("/cart/items/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const item = removeCartItem(id);
      return {
        status: "ok",
        message: "Cart item removed successfully.",
        item,
        cart: getCart()
      };
    } catch (error) {
      return handleCartError(error, reply);
    }
  });

  const port = Number(process.env.PORT ?? 4000);
  const host = "0.0.0.0";

  const close = async () => {
    await server.close();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  await server.listen({ port, host });
}

bootstrap().catch(async (error) => {
  console.error(error);
  process.exit(1);
});

function handleCartError(error: unknown, reply: { code: (statusCode: number) => void }) {
  if (error instanceof CartServiceError) {
    const statusCodeByError = {
      INVALID_QUANTITY: 400,
      PRODUCT_NOT_FOUND: 404,
      OUT_OF_STOCK: 400,
      CART_ITEM_NOT_FOUND: 404,
    } as const;
    reply.code(statusCodeByError[error.code]);
    return {
      status: "error",
      message: error.message
    };
  }

  reply.code(500);
  return {
    status: "error",
    message: "Internal server error"
  }
}
