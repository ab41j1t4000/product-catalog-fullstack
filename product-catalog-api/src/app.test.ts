import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import { buildServer } from "./app.js";
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
