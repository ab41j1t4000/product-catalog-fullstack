import { randomUUID } from "node:crypto";
import type { CreateOrderInput, Order } from "../schemas/order.schema.js";

const orders: Order[] = [];

function copyOrder(order: Order): Order {
  return structuredClone(order);
}

function assertSafeNonNegativeInteger(value: number, fieldName: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a non-negative safe integer.`);
  }
}

export function createOrder(input: CreateOrderInput): Order {
  if (input.items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  for (const [index, item] of input.items.entries()) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new Error(`items[${index}].quantity must be a positive safe integer.`);
    }
    assertSafeNonNegativeInteger(item.unitPriceInr, `items[${index}].unitPriceInr`);
    assertSafeNonNegativeInteger(item.lineTotalInr, `items[${index}].lineTotalInr`);
    if (item.quantity * item.unitPriceInr !== item.lineTotalInr) {
      throw new Error(`items[${index}].lineTotalInr is inconsistent.`);
    }
  }

  assertSafeNonNegativeInteger(input.subtotalInr, "subtotalInr");
  assertSafeNonNegativeInteger(input.shippingInr, "shippingInr");
  assertSafeNonNegativeInteger(input.totalPriceInr, "totalPriceInr");

  const calculatedSubtotal = input.items.reduce(
    (sum, item) => sum + item.lineTotalInr,
    0,
  );
  if (!Number.isSafeInteger(calculatedSubtotal) || calculatedSubtotal !== input.subtotalInr) {
    throw new Error("subtotalInr is inconsistent with order items.");
  }
  if (input.subtotalInr + input.shippingInr !== input.totalPriceInr) {
    throw new Error("totalPriceInr is inconsistent with subtotal and shipping.");
  }

  const order: Order = {
    id: randomUUID(),
    status: "confirmed",
    currency: "INR",
    customer: { ...input.customer },
    shippingAddress: { ...input.shippingAddress },
    items: input.items.map((item) => ({ ...item })),
    subtotalInr: input.subtotalInr,
    shippingInr: input.shippingInr,
    totalPriceInr: input.totalPriceInr,
    paymentReference: input.paymentReference,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  return copyOrder(order);
}

export function getOrderById(orderId: string): Order | undefined {
  const order = orders.find((candidate) => candidate.id === orderId);
  return order ? copyOrder(order) : undefined;
}

export function resetOrdersForTests(): void {
  orders.splice(0, orders.length);
}
