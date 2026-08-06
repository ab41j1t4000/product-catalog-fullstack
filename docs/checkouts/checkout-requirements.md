# Checkout Requirements

## Document Status

- Status: proposed for MVP implementation
- Product: Japanese mask catalog for customers in India
- Scope: guest checkout with simulated payment
- Related documents:
  - [Checkout HLD](checkout-hld.md)
  - [Checkout API Contract](checkout-api.md)
  - [Checkout Backend LLD](checkout-lld.md)

## Objective

Allow a customer with items in their cart to provide contact and shipping details, complete a simulated payment, and receive a durable order confirmation. The backend remains the authority for product availability, pricing, shipping, and final totals.

## Current-System Constraints

The current application has:

- one process-wide in-memory cart shared by every browser;
- in-memory products and cart items that disappear when the API restarts;
- boolean `inStock` values rather than inventory quantities;
- no user identity, cart identity, database, order model, or payment integration;
- integer INR prices with no separate tax representation.

Checkout must not be presented as production-ready until carts and orders are isolated and persisted. The implementation should introduce repository interfaces so an in-memory first pass can be replaced by PostgreSQL without rewriting domain logic.

## MVP Decisions

| Area | Decision |
| --- | --- |
| Customer | Guest checkout only |
| Market | Indian shipping addresses only |
| Currency | INR only |
| Money representation | Integer rupees for the current MVP; migrate to integer paise before real payments |
| Tax | Product prices are tax-inclusive; no separate tax calculation in MVP |
| Shipping | Free at or above ₹3,000 merchandise subtotal; otherwise ₹149 |
| Payment | Token-based simulated card payment; never collect or store raw card details |
| Inventory | Checkout requires `inStock === true`; quantity reservation/decrement is deferred until numeric inventory exists |
| Cart identity | Anonymous cart ID per browser, supplied with API requests |
| Idempotency | Required for checkout submissions |
| Order persistence | Repository-backed; in-memory repository allowed for the first milestone, PostgreSQL required before deployment |
| Authentication | Out of scope |

## User Stories

### Successful checkout

As a customer, I can review my cart, enter valid contact and Indian shipping information, submit a simulated payment, and receive an order number and final totals.

### Recoverable validation

As a customer, I receive field-level guidance when my checkout information is invalid without losing my cart or form values.

### Catalog changes

As a customer, I am informed if a product became unavailable or its price changed before checkout. My cart remains available so I can review it.

### Safe retry

As a customer, retrying the same submission after a timeout does not create a second order or charge attempt.

### Confirmation

As a guest customer, I can view the confirmation for the order just placed without gaining access to another customer’s order.

## Functional Requirements

### Cart identity

- The frontend obtains an anonymous cart ID before the first cart write.
- Cart requests and checkout requests identify the same cart.
- A missing, malformed, or unknown cart ID produces a structured error.
- One browser’s cart must not be visible or mutable from another browser using a different cart ID.

### Checkout form

The customer supplies:

- full name;
- email address;
- Indian phone number;
- address line 1;
- optional address line 2;
- city;
- state or union territory;
- six-digit postal code;
- country, fixed to `IN`.

The frontend may validate for usability, but the API performs authoritative validation.

### Order review

- The checkout page displays current cart items, quantities, merchandise subtotal, shipping, and grand total.
- The UI labels totals as provisional until checkout completes.
- The request does not send trusted product names, prices, shipping costs, or totals.

### Availability and price validation

- The API reloads every product referenced by the cart.
- Checkout fails if any product is missing or not in stock.
- The API calculates all totals from current server-side product data.
- If the current total differs from the last cart total observed by the client, the API returns a price-change conflict and the recalculated cart summary.
- A price-change response does not clear the cart or create an order.

### Simulated payment

- The frontend sends a simulation token, not card data.
- Supported initial tokens are `tok_simulated_success` and `tok_simulated_decline`.
- A declined payment does not clear the cart or create a confirmed order.
- Simulation tokens are development-only and must be replaced by provider-issued tokens before real payment integration.

### Order creation

- A successful order has a unique non-sequential public ID.
- Each order item stores an immutable snapshot of product ID, name, unit price, quantity, and line total.
- The order stores the submitted contact and shipping address snapshot.
- The order stores merchandise subtotal, shipping, tax, grand total, and currency.
- The order stores lifecycle timestamps and status.
- The cart is cleared only after order creation succeeds.

### Idempotency

- The frontend creates one idempotency key per checkout attempt and reuses it when retrying that attempt.
- The same cart and idempotency key with the same request returns the original result.
- Reusing a key with a different payload returns a conflict.
- Idempotency records have a documented retention period; the MVP uses 24 hours.

### Confirmation access

- A successful checkout returns an opaque confirmation token.
- Guest order retrieval requires both the order ID and confirmation token.
- Confirmation responses exclude internal payment and operational metadata.

## State Model

Order states for the simulated MVP:

```text
PENDING_PAYMENT → CONFIRMED
PENDING_PAYMENT → PAYMENT_FAILED
CONFIRMED → CANCELLED       (future admin workflow)
CONFIRMED → FULFILLED       (future fulfillment workflow)
```

Only `CONFIRMED` is returned as a successful checkout result. The initial in-memory implementation may avoid persisting failed attempts, but PostgreSQL implementation should retain payment attempts for diagnosis and reconciliation.

## Failure Requirements

| Condition | Expected behavior |
| --- | --- |
| Empty cart | Reject; preserve cart |
| Invalid request | Reject with field details; preserve cart |
| Unknown cart | Reject without revealing other carts |
| Product missing | Reject; identify affected cart line |
| Product unavailable | Reject; identify affected cart line |
| Price changed | Reject with refreshed summary; preserve cart |
| Payment declined | Reject; preserve cart |
| Duplicate request | Return original success or in-progress response |
| Internal failure | Return safe error and request ID; do not clear cart |

## Non-Functional Requirements

- Checkout endpoint p95 latency under 750 ms for simulated payment in local/staging environments.
- No raw payment-card details in requests, logs, storage, or analytics.
- Personally identifiable information must not appear in normal application logs.
- Every request has a request ID; checkout logs include cart ID, order ID, idempotency-key hash, outcome, and duration.
- Validation and domain errors use stable machine-readable codes.
- Checkout business logic is testable without starting Fastify.
- Repository implementations are replaceable without changing route handlers or domain rules.
- Concurrent submissions cannot create duplicate orders for the same idempotency key.

## Acceptance Criteria

- A cart belonging to one anonymous cart ID can complete checkout successfully.
- The response contains an order ID, confirmation token, status, item snapshots, and server-calculated totals.
- A successful checkout clears only the checked-out cart.
- A failed checkout leaves that cart unchanged.
- Changing prices in the catalog before submission produces a conflict instead of silently ordering at the stale price.
- `tok_simulated_decline` reliably produces the documented payment-declined error.
- Repeating a successful request with the same idempotency key returns the same order.
- Reusing the key with a modified body produces an idempotency conflict.
- Unit and API integration tests cover the success path and every documented domain error.

## Out of Scope

- Real payment gateway integration;
- authentication and saved addresses;
- coupons, gift cards, tax invoicing, refunds, and cancellations;
- international shipping;
- multiple fulfillment centers;
- quantity-based inventory reservation;
- shipment tracking and customer notifications;
- PCI-compliant card collection.

## Follow-Up Decisions Before Production

- Choose PostgreSQL schema and migration tooling.
- Represent money in paise and define rounding rules.
- Introduce numeric inventory and reservation expiry.
- Select a payment provider and webhook reconciliation strategy.
- Define privacy retention and customer-data deletion policies.
- Add authentication or a stronger guest-order access mechanism.
