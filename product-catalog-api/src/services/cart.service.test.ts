import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { addCartItem, clearCart, getCart } from "./cart.service.js";

beforeEach(clearCart);

test("clearCart removes items and resets cart totals", async () => {
  await addCartItem({ productId: "1", quantity: 2 });
  const cleared = clearCart();
  assert.deepEqual(cleared, { items: [], totalItems: 0, totalPriceInr: 0 });
  assert.deepEqual(getCart(), cleared);
});
