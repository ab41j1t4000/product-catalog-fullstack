# Checkout Backend Low-Level Design

## Purpose

Define the checkout implementation against the backend that currently exists in `product-catalog-api/src`. This is an incremental design: it extends the current schemas and services, and it does not introduce repositories, PostgreSQL, cart identity, or a domain-folder rewrite in this milestone.

## Existing Backend Reviewed

| Existing file | Current responsibility | Checkout decision |
| --- | --- | --- |
| `src/server.ts` | Creates Fastify, registers every route, maps service errors, and starts listening | Split construction into `app.ts` for route testing; keep `server.ts` as the process entry point |
| `src/schemas/cart.schema.ts` | Defines `Cart`, `CartItem`, and cart mutation inputs | Reuse unchanged for MVP |
| `src/schemas/product.schema.ts` | Defines `Product` and admin inputs | Reuse unchanged for MVP |
| `src/services/cart.service.ts` | Owns the singleton `cartItems` array and cart mutations | Add `clearCart()`; otherwise preserve behavior |
| `src/services/product.service.ts` | Owns the in-memory product array and product/admin operations | Reuse `getProductById()` unchanged |

The existing service files are not wrappers to be discarded. They remain the data sources used by checkout.

## Target Files for This Increment

```text
product-catalog-api/src/
├── app.ts                              # new Fastify app factory; contains route registration
├── server.ts                           # changed: configuration, listen, shutdown only
├── schemas/
│   ├── cart.schema.ts                  # existing, unchanged
│   ├── product.schema.ts               # existing, unchanged
│   ├── checkout.schema.ts              # new checkout request types
│   └── order.schema.ts                 # new immutable order types
└── services/
    ├── cart.service.ts                 # existing, add clearCart()
    ├── product.service.ts              # existing, unchanged
    ├── payment.service.ts              # new simulated payment
    ├── order.service.ts                # new in-memory order storage
    └── checkout.service.ts             # new checkout orchestration/idempotency
```

Suggested tests remain beside the code they exercise:

```text
src/services/payment.service.test.ts
src/services/order.service.test.ts
src/services/checkout.service.test.ts
src/app.test.ts
```

## File-by-File Changes

### 1. Existing `src/schemas/product.schema.ts`

No checkout change.

Checkout consumes the existing fields:

```ts
type Product = {
  id: string;
  name: string;
  priceInr: number;
  inStock: boolean;
  // existing remaining fields
};
```

`priceInr` remains an integer number of rupees. `inStock` remains the only availability signal. Do not add fake inventory decrement behavior because the schema has no stock quantity.

### 2. Existing `src/services/product.service.ts`

No checkout change.

`checkout.service.ts` calls the existing function:

```ts
getProductById(cartItem.productId)
```

It must not trust the `product` object embedded in the cart item for final pricing. Reloading through `getProductById` makes the current product service the authority at checkout time.

### 3. Existing `src/schemas/cart.schema.ts`

No checkout change.

The existing `Cart` response is reused in the checkout response. Multi-cart identity and cart version fields are intentionally deferred rather than added as hidden prerequisites.

### 4. Existing `src/services/cart.service.ts`

Add one exported function:

```ts
export function clearCart(): Cart {
  cartItems.splice(0, cartItems.length);
  return getCart();
}
```

Requirements:

- Preserve the same array object instead of reassigning it.
- Return the existing `Cart` shape.
- Call it only after payment approval and successful order creation.
- Add a test proving it clears items and resets totals.

No other cart functions need to change for checkout.

### 5. New `src/schemas/checkout.schema.ts`

Define the API input types:

```ts
export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "IN";
};

export type CheckoutInput = {
  customer: CheckoutCustomer;
  shippingAddress: ShippingAddress;
  payment: {
    token: string;
  };
};
```

The file follows the current repository convention: `*.schema.ts` contains TypeScript domain/API types. Runtime validation remains the responsibility of the service for now. Do not claim that a TypeScript cast validates an HTTP body.

### 6. New `src/schemas/order.schema.ts`

```ts
import type { CheckoutCustomer, ShippingAddress } from "./checkout.schema.js";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
};

export type Order = {
  id: string;
  status: "confirmed";
  currency: "INR";
  customer: CheckoutCustomer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotalInr: number;
  shippingInr: number;
  totalPriceInr: number;
  paymentReference: string;
  createdAt: string;
};

export type CreateOrderInput = Omit<
  Order,
  "id" | "status" | "currency" | "createdAt"
>;
```

Order items are snapshots. `getOrderById()` returns these stored values and never joins against the current product array.

### 7. New `src/services/payment.service.ts`

Public interface:

```ts
export type PaymentApproval = {
  reference: string;
};

export function simulatePayment(
  token: string,
  totalPriceInr: number,
): PaymentApproval;
```

Behavior:

- Assert that `totalPriceInr` is a positive safe integer.
- `tok_simulated_success` returns `pay_${crypto.randomUUID()}`.
- `tok_simulated_decline` throws `PaymentServiceError("PAYMENT_DECLINED", ...)`.
- Any other token throws `PaymentServiceError("INVALID_PAYMENT_TOKEN", ...)`.
- The function accepts no card number, CVV, expiry, or customer data.

### 8. New `src/services/order.service.ts`

Module state:

```ts
const orders: Order[] = [];
```

Public functions:

```ts
export function createOrder(input: CreateOrderInput): Order;
export function getOrderById(orderId: string): Order | undefined;
```

`createOrder`:

1. verifies the item array is non-empty;
2. verifies all quantities and money values are safe non-negative integers;
3. creates a new `Order` using `crypto.randomUUID()` and `new Date().toISOString()`;
4. copies customer, address, and item objects before storing them;
5. pushes the order into the array and returns it.

Copying prevents later mutation of request or product objects from changing order history. `getOrderById` should also return a copy so callers cannot mutate the stored record.

`getOrderById` returns the matching stored order. The route converts `undefined` to `404 ORDER_NOT_FOUND`.

For tests, add a narrowly scoped reset helper only if necessary, for example `resetOrdersForTests()`. Do not expose test-reset endpoints over HTTP.

### 9. New `src/services/checkout.service.ts`

Imports the current and new services directly:

```ts
import { clearCart, getCart } from "./cart.service.js";
import { getProductById } from "./product.service.js";
import { simulatePayment } from "./payment.service.js";
import { createOrder } from "./order.service.js";
import type { Cart } from "../schemas/cart.schema.js";
import type { Order } from "../schemas/order.schema.js";
```

Public API:

```ts
export type CheckoutResult = {
  order: Order;
  cart: Cart;
};

export type CheckoutExecution = {
  result: CheckoutResult;
  replayed: boolean;
};

export function checkout(
  rawInput: unknown,
  idempotencyKey: string,
): CheckoutExecution;
```

#### Runtime input validation

Validate `rawInput` before reading nested properties. Required checks:

- input, customer, address, and payment are non-null objects;
- no required field is missing;
- strings meet the lengths in the API contract after trimming;
- email has a reasonable email format;
- phone matches `^\\+91[0-9]{10}$`;
- postal code matches `^[0-9]{6}$`;
- country equals `IN`;
- payment token is an allowed simulation token.

Return a normalized `CheckoutInput`. When `line2` is empty, omit it rather than setting it to `undefined`, which is important with the repository’s `exactOptionalPropertyTypes` setting.

Validation failures throw:

```ts
new CheckoutServiceError(
  "INVALID_CHECKOUT",
  "Checkout details are invalid.",
  fieldErrors,
);
```

#### Shipping calculation

Keep it as a pure function in this service:

```ts
const FREE_SHIPPING_THRESHOLD_INR = 3000;
const STANDARD_SHIPPING_INR = 149;

export function calculateShippingInr(subtotalInr: number): number {
  return subtotalInr >= FREE_SHIPPING_THRESHOLD_INR
    ? 0
    : STANDARD_SHIPPING_INR;
}
```

Exporting the pure function makes threshold behavior directly testable.

#### Idempotency state

```ts
type CompletedCheckout = {
  requestFingerprint: string;
  result: CheckoutResult;
};

const completedCheckouts = new Map<string, CompletedCheckout>();
```

Create a deterministic fingerprint from the normalized checkout input with Node’s `createHash("sha256")`. Object construction order is fixed by normalization, so `JSON.stringify(normalizedInput)` is stable for this known shape.

Check the map before reading the cart:

1. same key and fingerprint → return stored result with `replayed: true`;
2. same key and different fingerprint → throw `IDEMPOTENCY_KEY_REUSED`;
3. absent key → continue checkout.

#### Checkout algorithm

After normalization and idempotency lookup:

1. Call `getCart()`.
2. Throw `EMPTY_CART` if it has no items.
3. For each item, call `getProductById(item.productId)`.
4. Throw `PRODUCT_UNAVAILABLE` if the product is missing or `inStock` is false.
5. Build a new `OrderItem` from the current product name/price and cart quantity.
6. Calculate each line with `quantity * unitPriceInr` and assert safe integer results.
7. Sum `subtotalInr`.
8. Calculate `shippingInr` and `totalPriceInr`.
9. Call `simulatePayment(input.payment.token, totalPriceInr)`.
10. Call `createOrder(...)` with snapshots and the payment reference.
11. Call `clearCart()` and capture the empty cart.
12. Create `CheckoutResult`.
13. Store the result in `completedCheckouts`.
14. Return `{ result, replayed: false }`.

The service never accepts a client total.

#### Checkout errors

```ts
type CheckoutServiceErrorCode =
  | "INVALID_CHECKOUT"
  | "EMPTY_CART"
  | "PRODUCT_UNAVAILABLE"
  | "PAYMENT_DECLINED"
  | "IDEMPOTENCY_KEY_REUSED";
```

Either translate `PaymentServiceError` inside `checkout.service.ts` or include it in the route error handler. Prefer translation so the route only needs to understand checkout-level errors.

### 10. New `src/app.ts` and existing `src/server.ts`

The current `server.ts` both constructs and starts Fastify, which prevents clean `server.inject()` tests. Extract construction without changing route behavior.

New `app.ts`:

```ts
import cors from "@fastify/cors";
import Fastify from "fastify";

export async function buildServer() {
  const server = Fastify({ logger: true });
  await server.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });

  // Move existing route registrations and existing error helpers here unchanged.
  // Register the two new routes here too.

  return server;
}
```

Existing `server.ts` becomes the process entry point:

```ts
import "dotenv/config";
import { buildServer } from "./app.js";

const server = await buildServer();
// Keep existing port, host, shutdown handling, listen, and top-level error handling.
```

This is a mechanical extraction. Product and cart route behavior must remain unchanged and should be covered by smoke tests before checkout routes are added.

#### `POST /checkout`

Handler behavior:

1. Narrow `request.headers["idempotency-key"]` to a single string.
2. Validate it with `crypto.randomUUID`-compatible UUID syntax; otherwise return `400 INVALID_IDEMPOTENCY_KEY`.
3. Pass `request.body` as `unknown` to `checkout()` so the service performs runtime validation.
4. Return `201` for a new checkout and `200` plus `Idempotent-Replayed: true` for a replay.
5. Return the existing flat response style:

```ts
{
  status: "ok",
  message: "Checkout completed successfully.",
  order: execution.result.order,
  cart: execution.result.cart,
}
```

#### `GET /orders/:id`

- Call `getOrderById(id)`.
- Return `{ status: "ok", order }` when found.
- Return `404` with code `ORDER_NOT_FOUND` otherwise.

#### Error mapping

Add `handleCheckoutError` beside the existing `handleCartError` and `handleProductError`:

| Code | HTTP status |
| --- | --- |
| `INVALID_CHECKOUT` | 400 |
| `EMPTY_CART` | 400 |
| `PRODUCT_UNAVAILABLE` | 409 |
| `IDEMPOTENCY_KEY_REUSED` | 409 |
| `PAYMENT_DECLINED` | 422 |

Unexpected errors return the same current generic `500` response. Log the exception through Fastify; do not log the checkout body.

## Frontend File Plan

This LLD is backend-focused, but the API is incomplete without a precise consumer plan.

```text
product-catalog-web/src/
├── App.tsx
├── features/cart/pages/CartPage.tsx
└── features/checkout/
    ├── types.ts
    ├── api/
    │   ├── submitCheckout.ts
    │   ├── fetchOrder.ts
    │   └── checkoutQueries.ts
    ├── components/
    │   ├── CheckoutForm.tsx
    │   └── CheckoutSummary.tsx
    └── pages/
        ├── CheckoutPage.tsx
        └── OrderConfirmationPage.tsx
```

Required existing-file changes:

- `App.tsx`: add `/checkout` and `/orders/:id` routes.
- `CartPage.tsx`: add a checkout navigation button when the cart contains items.
- Existing `cartQueries.ts`: no key change; checkout success writes the returned cart to `cartKeys.current`.
- Existing `CartProvider.tsx`: no required change.

TanStack behavior:

- `useMutation` submits checkout.
- Disable automatic mutation retries; explicit network retry must reuse the same key.
- On success, call `queryClient.setQueryData(cartKeys.current, response.cart)`.
- Order query key is `["orders", id]`.

## Tests

### Test runner setup

The API currently has no test script. Use the already-installed `tsx` with Node’s test runner:

```json
{
  "scripts": {
    "test": "tsx --test --test-concurrency=1 src/app.test.ts src/services/*.test.ts"
  }
}
```

No new test framework is required for this increment.

### Existing regression tests

Immediately after extracting `buildServer()` into `app.ts`, capture these behaviors with `server.inject()` smoke tests:

- `GET /health` returns 200.
- `GET /products/` returns the existing item list.
- `GET /cart` returns the existing cart shape.
- One representative cart mutation still works.

### Service tests

`payment.service.test.ts`:

- success token returns a payment reference;
- decline token returns `PAYMENT_DECLINED`;
- unknown token is rejected;
- invalid amount is rejected.

`order.service.test.ts`:

- creates a confirmed snapshot;
- lookup returns the created order;
- later mutation of the input objects does not change the stored order;
- unknown ID returns `undefined`.

`checkout.service.test.ts`:

- rejects invalid request fields;
- rejects empty cart;
- rejects products that become out of stock after being added to the cart;
- calculates ₹149 shipping below ₹3,000;
- calculates free shipping at and above ₹3,000;
- uses current product price rather than a client-provided value;
- decline preserves the cart and creates no order;
- success creates one order and clears the cart;
- repeated key/input returns the same order;
- repeated key with changed input is rejected.

### Route tests

`app.test.ts`:

- missing/malformed idempotency header returns 400;
- invalid checkout body returns the documented shape;
- successful checkout returns 201;
- replay returns 200 and the replay header;
- `GET /orders/:id` returns the order;
- unknown order returns 404;
- existing product/cart smoke tests still pass.

## Implementation Order

1. Add the API test script.
2. Extract `buildServer()` into `app.ts` without changing route behavior.
3. Add current-route smoke tests and verify the extraction.
4. Add `clearCart()` to the existing cart service and test it.
5. Add checkout/order schema files.
6. Add and test `payment.service.ts`.
7. Add and test `order.service.ts`.
8. Add and test `checkout.service.ts`.
9. Register and test checkout/order routes in `app.ts`.
10. Update the API README endpoint list.
11. Add frontend checkout types, API functions, TanStack mutation/query, pages, and routes.
12. Run backend tests/build and frontend lint/build.

## Definition of Done

- Every existing backend file affected by checkout is accounted for above.
- Existing product and cart API behavior remains compatible.
- Checkout uses `getCart`, `getProductById`, and `clearCart` from the existing services.
- No repository or PostgreSQL abstraction is introduced prematurely.
- All final totals are calculated server-side.
- Failed checkout leaves the cart intact.
- Successful checkout creates one immutable order snapshot and clears the cart.
- Idempotent replay does not create another order.
- The backend test suite and build pass.
- The frontend focused lint and production build pass.

## Explicit Later Refactor

When persistence becomes the next feature, introduce repository interfaces around the behavior now provided by `product.service.ts`, `cart.service.ts`, `order.service.ts`, and the idempotency map. That future LLD must start from these implemented services and specify their migration to PostgreSQL. It is not part of the current checkout implementation.
