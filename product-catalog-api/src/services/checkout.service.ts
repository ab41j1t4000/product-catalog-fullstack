import { createHash } from "node:crypto";
import type { Cart } from "../schemas/cart.schema.js";
import type { CheckoutInput } from "../schemas/checkout.schema.js";
import type { Order, OrderItem } from "../schemas/order.schema.js";
import { clearCart, getCart } from "./cart.service.js";
import { createOrder } from "./order.service.js";
import { PaymentServiceError, simulatePayment } from "./payment.service.js";
import { getProductById } from "./product.service.js";

const FREE_SHIPPING_THRESHOLD_INR = 3_000;
const STANDARD_SHIPPING_INR = 149;
const ALLOWED_PAYMENT_TOKENS = new Set([
  "tok_simulated_success",
  "tok_simulated_decline",
]);

type CheckoutServiceErrorCode =
  | "INVALID_CHECKOUT"
  | "EMPTY_CART"
  | "PRODUCT_UNAVAILABLE"
  | "PAYMENT_DECLINED"
  | "IDEMPOTENCY_KEY_REUSED";

export class CheckoutServiceError extends Error {
  readonly code: CheckoutServiceErrorCode;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    code: CheckoutServiceErrorCode,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "CheckoutServiceError";
    this.code = code;
    if (fieldErrors !== undefined) this.fieldErrors = fieldErrors;
  }
}

export type CheckoutResult = { order: Order; cart: Cart };
export type CheckoutExecution = { result: CheckoutResult; replayed: boolean };

type CompletedCheckout = {
  requestFingerprint: string;
  result: CheckoutResult;
};

const completedCheckouts = new Map<string, CompletedCheckout>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizedString(
  object: Record<string, unknown>,
  field: string,
  path: string,
  minimumLength: number,
  maximumLength: number,
  fieldErrors: Record<string, string>,
): string {
  const value = object[field];
  if (typeof value !== "string") {
    fieldErrors[path] = "This field is required.";
    return "";
  }
  const normalized = value.trim();
  if (normalized.length < minimumLength || normalized.length > maximumLength) {
    fieldErrors[path] = `Must contain between ${minimumLength} and ${maximumLength} characters.`;
  }
  return normalized;
}

function normalizeCheckoutInput(rawInput: unknown): CheckoutInput {
  const fieldErrors: Record<string, string> = {};
  if (!isRecord(rawInput)) {
    throw new CheckoutServiceError(
      "INVALID_CHECKOUT",
      "Checkout details are invalid.",
      { checkout: "Checkout body must be an object." },
    );
  }

  const customer = isRecord(rawInput.customer) ? rawInput.customer : {};
  const address = isRecord(rawInput.shippingAddress) ? rawInput.shippingAddress : {};
  const payment = isRecord(rawInput.payment) ? rawInput.payment : {};
  if (!isRecord(rawInput.customer)) fieldErrors.customer = "Customer details are required.";
  if (!isRecord(rawInput.shippingAddress)) fieldErrors.shippingAddress = "Shipping address is required.";
  if (!isRecord(rawInput.payment)) fieldErrors.payment = "Payment details are required.";

  const name = normalizedString(customer, "name", "customer.name", 2, 120, fieldErrors);
  const email = normalizedString(customer, "email", "customer.email", 3, 254, fieldErrors).toLowerCase();
  const phone = normalizedString(customer, "phone", "customer.phone", 13, 13, fieldErrors);
  const line1 = normalizedString(address, "line1", "shippingAddress.line1", 3, 200, fieldErrors);
  const city = normalizedString(address, "city", "shippingAddress.city", 2, 100, fieldErrors);
  const state = normalizedString(address, "state", "shippingAddress.state", 2, 100, fieldErrors);
  const postalCode = normalizedString(address, "postalCode", "shippingAddress.postalCode", 6, 6, fieldErrors);
  const token = normalizedString(payment, "token", "payment.token", 1, 100, fieldErrors);

  let line2: string | undefined;
  if (address.line2 !== undefined) {
    if (typeof address.line2 !== "string") {
      fieldErrors["shippingAddress.line2"] = "Must be a string.";
    } else {
      const normalizedLine2 = address.line2.trim();
      if (normalizedLine2.length > 200) {
        fieldErrors["shippingAddress.line2"] = "Must contain at most 200 characters.";
      } else if (normalizedLine2.length > 0) {
        line2 = normalizedLine2;
      }
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors["customer.email"] = "Email address is invalid.";
  }
  if (!/^\+91[0-9]{10}$/.test(phone)) {
    fieldErrors["customer.phone"] = "Phone must use +91 followed by 10 digits.";
  }
  if (!/^[0-9]{6}$/.test(postalCode)) {
    fieldErrors["shippingAddress.postalCode"] = "Postal code must contain exactly 6 digits.";
  }
  if (address.country !== "IN") {
    fieldErrors["shippingAddress.country"] = "Country must be IN.";
  }
  if (!ALLOWED_PAYMENT_TOKENS.has(token)) {
    fieldErrors["payment.token"] = "Payment token is invalid.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new CheckoutServiceError(
      "INVALID_CHECKOUT",
      "Checkout details are invalid.",
      fieldErrors,
    );
  }

  return {
    customer: { name, email, phone },
    shippingAddress: {
      line1,
      ...(line2 === undefined ? {} : { line2 }),
      city,
      state,
      postalCode,
      country: "IN",
    },
    payment: { token },
  };
}

function fingerprint(input: CheckoutInput): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function copyResult(result: CheckoutResult): CheckoutResult {
  return structuredClone(result);
}

function checkedAdd(left: number, right: number): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) {
    throw new Error("Checkout total exceeds the supported range.");
  }
  return result;
}

export function calculateShippingInr(subtotalInr: number): number {
  if (!Number.isSafeInteger(subtotalInr) || subtotalInr < 0) {
    throw new Error("Subtotal must be a non-negative safe integer.");
  }
  return subtotalInr >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_INR;
}

export async function checkout(
  rawInput: unknown,
  idempotencyKey: string,
): Promise<CheckoutExecution> {
  const input = normalizeCheckoutInput(rawInput);
  const requestFingerprint = fingerprint(input);
  const completed = completedCheckouts.get(idempotencyKey);

  if (completed) {
    if (completed.requestFingerprint !== requestFingerprint) {
      throw new CheckoutServiceError(
        "IDEMPOTENCY_KEY_REUSED",
        "Idempotency key was already used for different checkout details.",
      );
    }
    return { result: copyResult(completed.result), replayed: true };
  }

  const cart = getCart();
  if (cart.items.length === 0) {
    throw new CheckoutServiceError("EMPTY_CART", "Cannot checkout an empty cart.");
  }

  const items: OrderItem[] = await Promise.all(cart.items.map(async (cartItem) => {
    const product = await getProductById(cartItem.productId);
    if (!product || !product.inStock) {
      throw new CheckoutServiceError(
        "PRODUCT_UNAVAILABLE",
        `Product ${cartItem.productId} is no longer available.`,
      );
    }
    const lineTotalInr = cartItem.quantity * product.priceInr;
    if (!Number.isSafeInteger(lineTotalInr) || lineTotalInr < 0) {
      throw new Error("Checkout line total exceeds the supported range.");
    }
    return {
      productId: product.id,
      name: product.name,
      quantity: cartItem.quantity,
      unitPriceInr: product.priceInr,
      lineTotalInr,
    };
  }));

  const subtotalInr = items.reduce(
    (subtotal, item) => checkedAdd(subtotal, item.lineTotalInr),
    0,
  );
  const shippingInr = calculateShippingInr(subtotalInr);
  const totalPriceInr = checkedAdd(subtotalInr, shippingInr);

  let paymentReference: string;
  try {
    paymentReference = simulatePayment(input.payment.token, totalPriceInr).reference;
  } catch (error) {
    if (error instanceof PaymentServiceError && error.code === "PAYMENT_DECLINED") {
      throw new CheckoutServiceError("PAYMENT_DECLINED", error.message);
    }
    throw error;
  }

  const order = createOrder({
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    items,
    subtotalInr,
    shippingInr,
    totalPriceInr,
    paymentReference,
  });
  const emptiedCart = clearCart();
  const storedResult = copyResult({ order, cart: emptiedCart });
  completedCheckouts.set(idempotencyKey, { requestFingerprint, result: storedResult });
  return { result: copyResult(storedResult), replayed: false };
}

export function resetCompletedCheckoutsForTests(): void {
  completedCheckouts.clear();
}
