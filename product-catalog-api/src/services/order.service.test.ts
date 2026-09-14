import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import type { CreateOrderInput } from "../schemas/order.schema.js";
import { createOrder, getOrderById, resetOrdersForTests } from "./order.service.js";

function orderInput(): CreateOrderInput {
  return {
    customer: { name: "Ananya Nair", email: "ananya@example.com", phone: "+919876543210" },
    shippingAddress: {
      line1: "12 Example Road",
      city: "Kochi",
      state: "Kerala",
      postalCode: "682001",
      country: "IN",
    },
    items: [{ productId: "1", name: "Mask", quantity: 1, unitPriceInr: 2_499, lineTotalInr: 2_499 }],
    subtotalInr: 2_499,
    shippingInr: 149,
    totalPriceInr: 2_648,
    paymentReference: "pay_test",
  };
}

beforeEach(resetOrdersForTests);

test("creates and retrieves a confirmed order snapshot", () => {
  const order = createOrder(orderInput());
  assert.equal(order.status, "confirmed");
  assert.equal(order.currency, "INR");
  assert.deepEqual(getOrderById(order.id), order);
  assert.equal(getOrderById("missing"), undefined);
});

test("stored order cannot be changed through input or returned objects", () => {
  const input = orderInput();
  const order = createOrder(input);
  input.customer.name = "Changed input";
  input.items[0]!.name = "Changed input item";
  order.customer.name = "Changed response";
  order.items[0]!.name = "Changed response item";

  const stored = getOrderById(order.id);
  assert.equal(stored?.customer.name, "Ananya Nair");
  assert.equal(stored?.items[0]?.name, "Mask");
});

test("rejects inconsistent order money", () => {
  const input = orderInput();
  input.totalPriceInr = 1;
  assert.throws(() => createOrder(input), /inconsistent/);
});
