import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { beforeEach, test } from "node:test";
import type { CheckoutInput } from "../schemas/checkout.schema.js";
import { addCartItem, clearCart, getCart } from "./cart.service.js";
import {
  calculateShippingInr,
  checkout,
  CheckoutServiceError,
  resetCompletedCheckoutsForTests,
} from "./checkout.service.js";
import { resetOrdersForTests } from "./order.service.js";
import { getProductById } from "./product.service.js";

function validInput(token = "tok_simulated_success"): CheckoutInput {
  return {
    customer: { name: " Ananya Nair ", email: "ANANYA@example.com", phone: "+919876543210" },
    shippingAddress: {
      line1: " 12 Example Road ",
      line2: " ",
      city: " Kochi ",
      state: " Kerala ",
      postalCode: "682001",
      country: "IN",
    },
    payment: { token },
  };
}

beforeEach(() => {
  clearCart();
  resetOrdersForTests();
  resetCompletedCheckoutsForTests();
});

test("validates unknown request bodies and reports field errors", () => {
  assert.throws(
    () => checkout({ customer: {} }, randomUUID()),
    (error) =>
      error instanceof CheckoutServiceError &&
      error.code === "INVALID_CHECKOUT" &&
      error.fieldErrors?.["customer.email"] !== undefined,
  );
});

test("rejects an empty cart", () => {
  assert.throws(
    () => checkout(validInput(), randomUUID()),
    (error) => error instanceof CheckoutServiceError && error.code === "EMPTY_CART",
  );
});

test("rejects a product that becomes unavailable and preserves the cart", () => {
  const product = getProductById("1")!;
  addCartItem({ productId: product.id, quantity: 1 });
  product.inStock = false;
  try {
    assert.throws(
      () => checkout(validInput(), randomUUID()),
      (error) => error instanceof CheckoutServiceError && error.code === "PRODUCT_UNAVAILABLE",
    );
    assert.equal(getCart().totalItems, 1);
  } finally {
    product.inStock = true;
  }
});

test("shipping is ₹149 below ₹3,000 and free at the threshold", () => {
  assert.equal(calculateShippingInr(2_999), 149);
  assert.equal(calculateShippingInr(3_000), 0);
});

test("declined payment preserves the cart", () => {
  addCartItem({ productId: "1", quantity: 1 });
  assert.throws(
    () => checkout(validInput("tok_simulated_decline"), randomUUID()),
    (error) => error instanceof CheckoutServiceError && error.code === "PAYMENT_DECLINED",
  );
  assert.equal(getCart().totalItems, 1);
});

test("success uses current catalog data, snapshots the order, and clears the cart", () => {
  const product = getProductById("1")!;
  const originalPrice = product.priceInr;
  addCartItem({ productId: product.id, quantity: 1 });
  product.priceInr = 2_799;
  try {
    const execution = checkout({ ...validInput(), totalPriceInr: 1 }, randomUUID());
    assert.equal(execution.result.order.items[0]?.unitPriceInr, 2_799);
    assert.equal(execution.result.order.subtotalInr, 2_799);
    assert.equal(execution.result.order.totalPriceInr, 2_948);
    assert.deepEqual(execution.result.cart, { items: [], totalItems: 0, totalPriceInr: 0 });
    assert.equal(getCart().totalItems, 0);
  } finally {
    product.priceInr = originalPrice;
  }
});

test("same key and normalized input replays; changed input conflicts", () => {
  addCartItem({ productId: "2", quantity: 1 });
  const key = randomUUID();
  const first = checkout(validInput(), key);
  const replay = checkout(validInput(), key);
  assert.equal(replay.replayed, true);
  assert.equal(replay.result.order.id, first.result.order.id);

  const changed = validInput();
  changed.customer.name = "Different Name";
  assert.throws(
    () => checkout(changed, key),
    (error) => error instanceof CheckoutServiceError && error.code === "IDEMPOTENCY_KEY_REUSED",
  );
});
