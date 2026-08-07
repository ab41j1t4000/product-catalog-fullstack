# Checkout Requirements

## Status and Reading Order

- Status: proposed MVP increment
- Read next: [Checkout HLD](checkout-hld.md), [Checkout API](checkout-api.md), then [Checkout LLD](checkout-lld.md)
- Repository baseline: Fastify API and React frontend with in-memory products and one in-memory cart

## Objective

Add a guest checkout simulation that completes the existing catalog → product → cart journey. A customer provides contact and Indian shipping details, uses a deterministic simulated-payment token, and receives an in-memory order confirmation.

This increment is for learning and local development. It does not claim production durability, multi-user cart isolation, real inventory control, or real payment handling.

## Existing Behavior That Must Be Preserved

- Product browsing and admin product creation/update continue to use `product.service.ts`.
- Cart reads and mutations continue to use `cart.service.ts` and the current `/cart` endpoints.
- Cart and product response shapes remain compatible with the existing frontend.
- The backend remains an in-memory modular application for this increment.
- The frontend continues to use React Router, Chakra UI, and TanStack Query.

## Current Constraints Accepted for This Increment

| Constraint | MVP decision |
| --- | --- |
| One process-wide cart | Accepted for one-shopper local development; multi-cart identity is a required later increment |
| In-memory data | Orders disappear when the API restarts |
| `inStock` is boolean | Checkout validates availability but cannot reserve or decrement a quantity |
| No authentication | Checkout is guest-only and order lookup is not protected for this local MVP |
| Integer INR prices | Continue using integer rupees to match current product/cart types |
| Routes live in `server.ts` | Mechanically extract an `app.ts` factory so existing and new routes can be tested with Fastify `inject()` |

## MVP Decisions

- Customer: guest checkout only.
- Shipping destination: India only.
- Currency: INR.
- Product prices: treated as tax-inclusive.
- Shipping: ₹149 when merchandise subtotal is below ₹3,000; otherwise free.
- Payment: simulated token only; no card number, CVV, or expiry fields.
- Successful checkout: create an in-memory order snapshot and clear the existing cart.
- Failed checkout: preserve the cart.
- Idempotency: require an `Idempotency-Key` header and store completed results in memory.

## Functional Requirements

### Checkout form

The frontend collects:

- full name;
- email address;
- Indian phone number;
- address line 1;
- optional address line 2;
- city;
- state or union territory;
- six-digit postal code;
- country fixed to `IN`;
- a simulated-payment outcome.

The browser validates for usability. The backend validates all fields again.

### Server-owned totals

- The checkout request does not contain trusted item prices or totals.
- `checkout.service.ts` reads the current cart from `cart.service.ts`.
- It reloads each product through `product.service.ts`.
- It rejects missing or unavailable products.
- It calculates item snapshots, subtotal, shipping, and total using current server-side prices.

### Simulated payment

- `tok_simulated_success` produces approval.
- `tok_simulated_decline` produces a deterministic decline.
- Any other token is invalid.
- No raw payment-card data enters the application.

### Order creation

- A successful checkout creates an order in `order.service.ts`.
- The order stores customer, shipping address, product ID, product name, quantity, unit price, line total, subtotal, shipping, total, status, and timestamp snapshots.
- Subsequent product edits do not change an existing order snapshot.
- The cart is cleared only after the order has been created successfully.

### Retry safety

- The frontend generates one UUID idempotency key when submission begins.
- A network retry reuses that key.
- Repeating the same request and key returns the original successful result rather than creating another order.
- Reusing a key with different checkout data returns a conflict.
- In-memory idempotency state is lost when the API restarts; this limitation is acceptable only for this MVP.

### Frontend completion

- Add `/checkout` and `/orders/:id` routes.
- The cart page links to checkout only when the cart has items.
- Checkout shows an order summary based on the current cart query.
- Successful checkout replaces the TanStack Query cart cache with the empty cart returned by the API.
- Failure displays a useful message and retains entered form values and cart contents.

## Error Requirements

| Condition | Expected result |
| --- | --- |
| Invalid customer/address/payment fields | `400 INVALID_CHECKOUT` |
| Empty cart | `400 EMPTY_CART` |
| Product marked out of stock | `409 PRODUCT_UNAVAILABLE` |
| Simulated decline | `422 PAYMENT_DECLINED` |
| Idempotency key reused with another body | `409 IDEMPOTENCY_KEY_REUSED` |
| Unknown order | `404 ORDER_NOT_FOUND` |
| Unexpected error | `500 INTERNAL_ERROR` without sensitive details |

## Acceptance Criteria

- Valid customer/address data and `tok_simulated_success` produce one confirmed order.
- The backend, not the frontend, calculates final prices and shipping.
- The order contains immutable item snapshots.
- Successful checkout clears the current cart and returns that empty cart.
- Empty-cart, unavailable-product, invalid-input, and payment-decline paths do not clear the cart.
- Retrying a successful request with the same idempotency key returns the same order.
- The confirmation page can display an order returned by `GET /orders/:id` while the API remains running.
- Existing product, admin, and cart flows continue to work.
- Backend and frontend TypeScript builds pass.

## Out of Scope

- PostgreSQL and migrations;
- separate carts for different browsers;
- authentication and authorization;
- real payments and provider webhooks;
- numeric inventory, reservations, and oversell prevention;
- tax invoices, coupons, refunds, cancellation, fulfillment, and email notifications;
- production privacy and order-access controls.

## Required Follow-Up Before Multi-User or Production Use

1. Add anonymous or authenticated cart identity and change cart APIs accordingly.
2. Persist carts, orders, and idempotency records in PostgreSQL.
3. Add numeric inventory and transactional reservation/decrement.
4. Protect order retrieval.
5. Move money representation from rupees to paise before real payments.
6. Integrate a payment provider using tokens and webhooks.
