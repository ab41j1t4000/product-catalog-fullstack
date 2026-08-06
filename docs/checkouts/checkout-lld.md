# Checkout Backend Low-Level Design

## Scope

This document defines the proposed Fastify/TypeScript modules, domain types, repository interfaces, checkout algorithm, error mapping, and test strategy. It is an implementation design, not the implementation itself.

## Proposed Backend Structure

```text
product-catalog-api/src/
├── app.ts
├── server.ts
├── checkout/
│   ├── checkout.errors.ts
│   ├── checkout.route.ts
│   ├── checkout.schema.ts
│   ├── checkout.service.ts
│   ├── checkout.types.ts
│   └── shipping-policy.ts
├── carts/
│   ├── cart.repository.ts
│   └── in-memory-cart.repository.ts
├── orders/
│   ├── order.repository.ts
│   └── in-memory-order.repository.ts
├── payments/
│   ├── payment.gateway.ts
│   └── simulated-payment.gateway.ts
├── products/
│   ├── product.repository.ts
│   └── in-memory-product.repository.ts
└── idempotency/
    ├── idempotency.repository.ts
    └── in-memory-idempotency.repository.ts
```

`app.ts` should build and return the Fastify instance so integration tests can use `server.inject()` without binding a port. `server.ts` should only load configuration, call the app factory, listen, and handle shutdown.

## Domain Types

```ts
type Currency = "INR";

type CustomerInput = {
  name: string;
  email: string;
  phone: string;
};

type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "IN";
};

type CheckoutCommand = {
  cartId: string;
  idempotencyKey: string;
  expectedCartVersion: number;
  customer: CustomerInput;
  shippingAddress: ShippingAddress;
  payment: {
    method: "SIMULATED_CARD";
    token: string;
  };
};

type MoneySummary = {
  currency: Currency;
  subtotalInr: number;
  shippingInr: number;
  taxInr: number;
  totalInr: number;
};

type OrderItemSnapshot = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
};

type OrderStatus = "PENDING_PAYMENT" | "CONFIRMED" | "PAYMENT_FAILED";
```

All public output types should be explicit. Do not return persistence entities directly from route handlers.

## Required Model Changes

### Cart

Replace the singleton cart array with carts keyed by cart ID:

```ts
type CartRecord = {
  id: string;
  version: number;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
  }>;
  updatedAt: Date;
};
```

Cart items should not store a mutable `Product` object as canonical state. Product display data is assembled when reading the cart, while checkout reloads products independently.

Increment `version` on every cart mutation and successful clear. Versioning enables stale-checkout detection and conditional writes.

### Order

```ts
type OrderRecord = {
  id: string;
  cartId: string;
  status: OrderStatus;
  customer: CustomerInput;
  shippingAddress: ShippingAddress;
  items: OrderItemSnapshot[];
  totals: MoneySummary;
  paymentReference: string;
  confirmationTokenHash: string;
  createdAt: Date;
  confirmedAt: Date | null;
};
```

Store only a hash of the confirmation token. Return the plaintext token once when the order is created.

## Repository Interfaces

```ts
interface CartRepository {
  create(): Promise<CartRecord>;
  findById(cartId: string): Promise<CartRecord | null>;
  clearIfVersion(cartId: string, version: number): Promise<CartRecord>;
}

interface ProductRepository {
  findByIds(productIds: string[]): Promise<Product[]>;
}

interface OrderRepository {
  create(input: CreateOrderRecord): Promise<OrderRecord>;
  findConfirmation(orderId: string): Promise<OrderRecord | null>;
}

type IdempotencyStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface IdempotencyRepository {
  reserve(input: {
    cartId: string;
    key: string;
    requestHash: string;
    expiresAt: Date;
  }): Promise<IdempotencyReservation>;
  complete(input: {
    cartId: string;
    key: string;
    statusCode: number;
    response: CheckoutResponse;
  }): Promise<void>;
  fail(input: {
    cartId: string;
    key: string;
    errorCode: string;
  }): Promise<void>;
}

interface PaymentGateway {
  authorize(input: {
    token: string;
    amountInr: number;
    currency: "INR";
    idempotencyKey: string;
  }): Promise<PaymentAuthorization>;
}
```

For PostgreSQL, expose a unit-of-work abstraction so order creation, inventory mutation, cart clearing, and idempotency completion share a transaction. Avoid exposing ORM-specific transaction objects to domain code.

## Validation

Define JSON schemas in `checkout.schema.ts` and attach them to Fastify routes. Use `additionalProperties: false` for request objects.

Validation layers:

1. Fastify schema validates types, required fields, formats, lengths, and enums.
2. Normalization trims text, lowercases email, and normalizes phone numbers.
3. Domain validation enforces cart state, product availability, cart version, shipping support, and pricing rules.

Do not cast `request.body` directly to a trusted type as current routes do. Derive route generics from the schema or use a schema provider so runtime and TypeScript types stay aligned.

## Shipping Policy

Keep shipping calculation as a pure function:

```ts
const FREE_SHIPPING_THRESHOLD_INR = 3000;
const STANDARD_SHIPPING_INR = 149;

function calculateShippingInr(subtotalInr: number): number {
  return subtotalInr >= FREE_SHIPPING_THRESHOLD_INR
    ? 0
    : STANDARD_SHIPPING_INR;
}
```

Assert every money input and result is a safe, non-negative integer. The future real-payment contract should switch to integer paise.

## Checkout Algorithm

`CheckoutService.execute(command)` performs:

1. Normalize validated customer and address fields.
2. Create a canonical request representation and SHA-256 request hash.
3. Reserve `(cartId, idempotencyKey)`.
4. If completed, return the stored response.
5. If in progress, throw `CHECKOUT_IN_PROGRESS`.
6. If the key has another request hash, throw `IDEMPOTENCY_KEY_REUSED`.
7. Load the cart; throw `CART_NOT_FOUND` or `EMPTY_CART` where appropriate.
8. Compare `expectedCartVersion` to the current cart version.
9. Load all unique product IDs in one repository call.
10. Verify every cart line has a product and `inStock === true`.
11. Build immutable item snapshots using current prices.
12. Calculate subtotal, shipping, tax, and grand total using safe integer arithmetic.
13. If the cart version or observed cart pricing changed, throw `CART_CHANGED` with a refreshed cart view before payment.
14. Call the payment gateway with the total and idempotency key.
15. If declined, record the deterministic failure and throw `PAYMENT_DECLINED`.
16. Generate order ID and confirmation token using a cryptographically secure generator.
17. Create the confirmed order and store the confirmation-token hash.
18. Clear the cart only if its version still matches the checked-out version.
19. Store the sanitized completed response against the idempotency record.
20. Return the order, plaintext confirmation token, and empty cart.

Steps 17–19 require one transaction in the PostgreSQL implementation. If the conditional cart clear fails, roll back and return `CART_CHANGED`.

## Simulated Payment Gateway

```ts
class SimulatedPaymentGateway implements PaymentGateway {
  async authorize(input: AuthorizePaymentInput): Promise<PaymentAuthorization> {
    if (input.token === "tok_simulated_success") {
      return {
        approved: true,
        reference: createOpaqueId("pay"),
      };
    }

    if (input.token === "tok_simulated_decline") {
      return {
        approved: false,
        declineCode: "SIMULATED_DECLINE",
      };
    }

    throw new CheckoutError("INVALID_PAYMENT_TOKEN", "Invalid simulation token.");
  }
}
```

Never add fields for card number, CVV, or expiry to this interface.

## Error Model

```ts
type CheckoutErrorCode =
  | "INVALID_CHECKOUT"
  | "CART_NOT_FOUND"
  | "EMPTY_CART"
  | "CART_CHANGED"
  | "PRODUCT_UNAVAILABLE"
  | "PAYMENT_DECLINED"
  | "CHECKOUT_IN_PROGRESS"
  | "IDEMPOTENCY_KEY_REUSED"
  | "INVALID_CONFIRMATION_TOKEN";

class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}
```

Map errors in one Fastify error handler rather than duplicating mappings in each route. Unexpected errors are logged with the request ID and returned as `INTERNAL_ERROR` without stack traces or sensitive details.

## Idempotency Implementation Notes

The in-memory adapter uses a `Map` and is safe only within one Node process. Each record contains:

- cart ID;
- key;
- canonical request hash;
- status;
- stored HTTP status and sanitized response;
- creation and expiry timestamps.

The PostgreSQL adapter uses a unique constraint on `(cart_id, key)` and inserts the reservation atomically. Expired records are deleted by a scheduled cleanup job. Do not delete completed keys before the 24-hour retention period.

## Route Handlers

Route handlers remain thin:

```ts
server.post<CheckoutRoute>(
  "/checkout",
  { schema: checkoutSchema },
  async (request, reply) => {
    const result = await checkoutService.execute({
      ...request.body,
      cartId: request.headers["x-cart-id"],
      idempotencyKey: request.headers["idempotency-key"],
    });

    reply.code(result.replayed ? 200 : 201);
    if (result.replayed) reply.header("Idempotent-Replayed", "true");
    return result.response;
  },
);
```

Actual code must narrow header values through schema validation instead of assuming they are strings.

## Frontend Integration Contract

Although frontend implementation is outside this LLD, backend behavior must support these TanStack Query operations:

- cart query key: `["cart", cartId]`;
- checkout preview query key: `["checkout", "preview", cartId, cartVersion, postalCode]`;
- checkout mutation: `POST /checkout`;
- on `201` or replayed `200`, replace the cart cache with the returned empty cart;
- on `CART_CHANGED`, replace the cart cache with the returned current cart;
- do not automatically retry `4xx` checkout failures;
- retry network/`5xx` failures only with the same idempotency key.

## Testing Strategy

### Unit tests

- Shipping below, at, and above the free-shipping threshold.
- Empty cart rejection.
- Missing and unavailable products.
- Server-side total calculation ignores client manipulation.
- Cart-version conflict occurs before payment.
- Simulation success and decline.
- Order snapshots do not change when products change later.
- Cart clears only after successful order creation.
- Idempotent replay returns the same order.
- Reused key with a changed payload is rejected.
- Confirmation token is stored hashed and compared safely.

### Repository contract tests

Run the same behavioral test suite against in-memory and PostgreSQL adapters:

- cart isolation;
- conditional clear by version;
- unique idempotency reservation;
- order persistence and retrieval;
- expiry behavior.

### API integration tests

Use Fastify `inject()` to verify:

- exact status codes and response schemas;
- required headers;
- field validation;
- successful checkout and idempotent replay;
- cart-changed response payload;
- payment decline preserving the cart;
- safe `500` responses and request IDs;
- confirmation access with valid and invalid tokens.

### Concurrency tests

- Two simultaneous requests with the same key create one order.
- Two simultaneous requests with different keys against one cart allow at most one successful conditional clear.
- A cart mutation racing checkout causes a version conflict rather than silent data loss.

## Implementation Order

1. Extract an app factory from `server.ts` and establish API integration tests.
2. Introduce cart IDs, cart versions, and cart repository interfaces.
3. Migrate existing cart endpoints and frontend cart query keys.
4. Add order, idempotency, product, and payment interfaces with in-memory adapters.
5. Add checkout schemas, pure shipping calculation, and typed errors.
6. Implement checkout service and API routes.
7. Add frontend form, preview query, mutation, and confirmation page.
8. Add PostgreSQL adapters and transactions before deployment.

## Definition of Done

- Requirements and API acceptance criteria are covered by automated tests.
- Business logic has no Fastify dependency.
- Routes contain no pricing or order-creation logic.
- Duplicate submissions cannot create multiple orders.
- Failed checkout never clears the cart.
- Successful checkout returns immutable order snapshots and clears only the correct cart.
- All touched code passes TypeScript, lint, unit, and API integration checks.
- Logs contain operational identifiers without customer, address, confirmation-token, or payment-token data.
