import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import { buildServer } from "./app.js";
import { InMemoryProductRepository } from "./repositories/in-memory-product.repository.js";
import {
  ProductRepositoryError,
  type ProductRepository,
} from "./repositories/product.repository.js";
import { clearCart } from "./services/cart.service.js";
import { resetCompletedCheckoutsForTests } from "./services/checkout.service.js";
import { resetOrdersForTests } from "./services/order.service.js";

const checkoutBody = {
  customer: { name: "Ananya Nair", email: "ananya@example.com", phone: "+919876543210" },
  shippingAddress: {
    line1: "12 Example Road",
    city: "Kochi",
    state: "Kerala",
    postalCode: "682001",
    country: "IN",
  },
  payment: { token: "tok_simulated_success" },
};

const productInput = {
  slug: "restart-test-mask",
  name: "Restart Test Mask",
  priceInr: 1999,
  shortDescription: "A product used to verify persistence behavior.",
  imageUrl: "https://example.test/restart-test-mask.jpg",
  maskType: "Test",
  inStock: true,
};

const server = await buildServer();
before(async () => server.ready());
after(async () => server.close());
beforeEach(() => {
  clearCart();
  resetOrdersForTests();
  resetCompletedCheckoutsForTests();
});

test("existing health, product, cart, and cart mutation routes still work", async () => {
  assert.equal((await server.inject({ method: "GET", url: "/health" })).statusCode, 200);
  const products = await server.inject({ method: "GET", url: "/products/" });
  assert.equal(products.statusCode, 200);
  assert.ok(products.json().items.length > 0);
  const added = await server.inject({
    method: "POST",
    url: "/cart/items",
    payload: { productId: "1", quantity: 1 },
  });
  assert.equal(added.statusCode, 201);
  assert.equal(added.json().cart.totalItems, 1);
  assert.equal((await server.inject({ method: "GET", url: "/cart" })).json().cart.totalItems, 1);
});

test("checkout requires a valid idempotency key", async () => {
  for (const headers of [{}, { "idempotency-key": "not-a-uuid" }]) {
    const response = await server.inject({ method: "POST", url: "/checkout", headers, payload: checkoutBody });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().code, "INVALID_IDEMPOTENCY_KEY");
  }
});

test("invalid checkout body has the documented validation shape", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/checkout",
    headers: { "idempotency-key": randomUUID() },
    payload: {},
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, "INVALID_CHECKOUT");
  assert.ok(response.json().fieldErrors);
});

test("successful checkout, replay, and order lookup work end to end", async () => {
  await server.inject({ method: "POST", url: "/cart/items", payload: { productId: "1", quantity: 1 } });
  const key = randomUUID();
  const first = await server.inject({
    method: "POST",
    url: "/checkout",
    headers: { "idempotency-key": key },
    payload: checkoutBody,
  });
  assert.equal(first.statusCode, 201);
  assert.equal(first.json().cart.totalItems, 0);

  const replay = await server.inject({
    method: "POST",
    url: "/checkout",
    headers: { "idempotency-key": key },
    payload: checkoutBody,
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.headers["idempotent-replayed"], "true");
  assert.equal(replay.json().order.id, first.json().order.id);

  const found = await server.inject({ method: "GET", url: `/orders/${first.json().order.id}` });
  assert.equal(found.statusCode, 200);
  assert.equal(found.json().order.id, first.json().order.id);
});

test("unknown orders return the documented 404", async () => {
  const response = await server.inject({ method: "GET", url: `/orders/${randomUUID()}` });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().code, "ORDER_NOT_FOUND");
});

test("catalog list and detail remain available when the app is recreated with the same repository", async () => {
  const repository = new InMemoryProductRepository([]);
  const firstServer = await buildServer({ productRepository: repository });
  await firstServer.ready();

  const created = await firstServer.inject({
    method: "POST",
    url: "/admin/products",
    payload: productInput,
  });
  assert.equal(created.statusCode, 201);
  const productId = created.json().item.id as string;
  await firstServer.close();

  const restartedServer = await buildServer({ productRepository: repository });
  await restartedServer.ready();
  const list = await restartedServer.inject({ method: "GET", url: "/products/" });
  const detail = await restartedServer.inject({ method: "GET", url: `/products/${productId}` });

  assert.equal(list.statusCode, 200);
  assert.equal(detail.statusCode, 200);
  assert.equal(list.json().items[0].id, productId);
  assert.deepEqual(detail.json().item, list.json().items[0]);
  await restartedServer.close();
});

test("catalog reads return 503 when the configured repository is unavailable", async () => {
  const failingRepository: ProductRepository = {
    list: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
    findById: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
    create: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
    update: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
  };
  const failingServer = await buildServer({ productRepository: failingRepository });
  await failingServer.ready();

  const response = await failingServer.inject({ method: "GET", url: "/products/" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().message, "The product database is temporarily unavailable.");
  await failingServer.close();
});

test("admin create validates input, rejects duplicates, and does not report storage failures as success", async () => {
  const repository = new InMemoryProductRepository([]);
  const server = await buildServer({ productRepository: repository });
  await server.ready();

  const invalid = await server.inject({
    method: "POST",
    url: "/admin/products",
    payload: { ...productInput, priceInr: -1 },
  });
  assert.equal(invalid.statusCode, 400);
  assert.equal((await repository.list()).length, 0);

  const created = await server.inject({ method: "POST", url: "/admin/products", payload: productInput });
  assert.equal(created.statusCode, 201);

  const duplicate = await server.inject({ method: "POST", url: "/admin/products", payload: productInput });
  assert.equal(duplicate.statusCode, 409);
  assert.equal((await repository.list()).length, 1);
  await server.close();

  const failingRepository: ProductRepository = {
    list: async () => [],
    findById: async () => undefined,
    create: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
    update: async () => undefined,
  };
  const failingServer = await buildServer({ productRepository: failingRepository });
  await failingServer.ready();
  const failedCreate = await failingServer.inject({ method: "POST", url: "/admin/products", payload: productInput });
  assert.equal(failedCreate.statusCode, 503);
  await failingServer.close();
});

test("admin update persists through app recreation and protects unrelated products", async () => {
  const repository = new InMemoryProductRepository([]);
  const server = await buildServer({ productRepository: repository });
  await server.ready();

  const first = await server.inject({ method: "POST", url: "/admin/products", payload: productInput });
  const second = await server.inject({ method: "POST", url: "/admin/products", payload: { ...productInput, slug: "second-test-mask", name: "Second Test Mask" } });
  const firstId = first.json().item.id as string;
  const secondId = second.json().item.id as string;

  const updated = await server.inject({
    method: "PATCH",
    url: `/admin/products/${firstId}`,
    payload: { name: "Persisted Updated Mask", priceInr: 2100 },
  });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json().item.name, "Persisted Updated Mask");

  const invalid = await server.inject({
    method: "PATCH",
    url: `/admin/products/${firstId}`,
    payload: { priceInr: -1 },
  });
  assert.equal(invalid.statusCode, 400);
  assert.equal((await repository.findById(firstId))?.priceInr, 2100);

  const duplicate = await server.inject({
    method: "PATCH",
    url: `/admin/products/${firstId}`,
    payload: { slug: "second-test-mask" },
  });
  assert.equal(duplicate.statusCode, 409);
  assert.equal((await repository.findById(firstId))?.slug, "restart-test-mask");

  const missing = await server.inject({
    method: "PATCH",
    url: "/admin/products/missing",
    payload: { name: "Should Not Mutate" },
  });
  assert.equal(missing.statusCode, 404);
  assert.equal((await repository.findById(secondId))?.name, "Second Test Mask");
  await server.close();

  const restartedServer = await buildServer({ productRepository: repository });
  await restartedServer.ready();
  const detail = await restartedServer.inject({ method: "GET", url: `/products/${firstId}` });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().item.name, "Persisted Updated Mask");
  await restartedServer.close();

  const failingRepository: ProductRepository = {
    list: async () => [],
    findById: async () => ({ id: "1", ...productInput }),
    create: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
    update: async () => {
      throw new ProductRepositoryError("DATABASE_ERROR", "The product database is temporarily unavailable.");
    },
  };
  const failingServer = await buildServer({ productRepository: failingRepository });
  await failingServer.ready();
  const failedUpdate = await failingServer.inject({
    method: "PATCH",
    url: "/admin/products/1",
    payload: { name: "Should Not Save" },
  });
  assert.equal(failedUpdate.statusCode, 503);
  await failingServer.close();
});
