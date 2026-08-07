# Checkout API Contract

## Scope

This contract extends the existing Fastify API without changing current product or cart endpoints. It uses the repository’s existing response style: `status`, `message`, and domain data at the top level.

## Existing Endpoints Used by Checkout

- `GET /cart` supplies the checkout summary.
- `GET /products/:id` is unchanged; checkout itself reloads products internally.
- Existing cart mutation endpoints remain unchanged.

## Submit Checkout

### Request

```http
POST /checkout
Idempotency-Key: 9ed7463a-8e5e-44fc-87d8-4ff00aa6388d
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "Ananya Nair",
    "email": "ananya@example.com",
    "phone": "+919876543210"
  },
  "shippingAddress": {
    "line1": "12 Example Road",
    "line2": "Near Example Junction",
    "city": "Kochi",
    "state": "Kerala",
    "postalCode": "682001",
    "country": "IN"
  },
  "payment": {
    "token": "tok_simulated_success"
  }
}
```

The request contains no cart lines, product names, unit prices, shipping amount, or total. The backend reads those values from the existing services.

### Header validation

- `Idempotency-Key` is required.
- It must be a UUID string.
- A retry of the same logical submission must reuse the same key.
- A new submission after editing the form must use a new key.

### Body validation

| Field | Rule |
| --- | --- |
| `customer.name` | Trimmed string, 2–120 characters |
| `customer.email` | Valid email, maximum 254 characters |
| `customer.phone` | `+91` followed by 10 digits |
| `shippingAddress.line1` | Trimmed string, 3–200 characters |
| `shippingAddress.line2` | Optional, maximum 200 characters |
| `shippingAddress.city` | Trimmed string, 2–100 characters |
| `shippingAddress.state` | Trimmed string, 2–100 characters |
| `shippingAddress.postalCode` | Exactly 6 digits |
| `shippingAddress.country` | Exactly `IN` |
| `payment.token` | `tok_simulated_success` or `tok_simulated_decline` |

### Success response — `201 Created`

```json
{
  "status": "ok",
  "message": "Checkout completed successfully.",
  "order": {
    "id": "8b86e701-bb80-44bb-bf0b-c9f92a6206f9",
    "status": "confirmed",
    "currency": "INR",
    "customer": {
      "name": "Ananya Nair",
      "email": "ananya@example.com",
      "phone": "+919876543210"
    },
    "shippingAddress": {
      "line1": "12 Example Road",
      "line2": "Near Example Junction",
      "city": "Kochi",
      "state": "Kerala",
      "postalCode": "682001",
      "country": "IN"
    },
    "items": [
      {
        "productId": "1",
        "name": "Kitsune Festival Mask",
        "quantity": 1,
        "unitPriceInr": 2499,
        "lineTotalInr": 2499
      }
    ],
    "subtotalInr": 2499,
    "shippingInr": 149,
    "totalPriceInr": 2648,
    "paymentReference": "pay_1ea3793b-3cc5-498f-aca4-a4ae08ded729",
    "createdAt": "2026-08-07T10:30:00.000Z"
  },
  "cart": {
    "items": [],
    "totalItems": 0,
    "totalPriceInr": 0
  }
}
```

`cart` uses the existing `Cart` shape. `totalPriceInr` on the cart remains merchandise-only, matching current behavior. Shipping appears only on the checkout order.

### Idempotent replay — `200 OK`

The API returns the same response body and adds:

```http
Idempotent-Replayed: true
```

No second order is created and the already-empty cart does not cause `EMPTY_CART` because replay lookup happens before cart validation.

## Get Order

### Request

```http
GET /orders/8b86e701-bb80-44bb-bf0b-c9f92a6206f9
```

### Success response — `200 OK`

```json
{
  "status": "ok",
  "order": {
    "id": "8b86e701-bb80-44bb-bf0b-c9f92a6206f9",
    "status": "confirmed",
    "currency": "INR",
    "customer": {
      "name": "Ananya Nair",
      "email": "ananya@example.com",
      "phone": "+919876543210"
    },
    "shippingAddress": {
      "line1": "12 Example Road",
      "line2": "Near Example Junction",
      "city": "Kochi",
      "state": "Kerala",
      "postalCode": "682001",
      "country": "IN"
    },
    "items": [
      {
        "productId": "1",
        "name": "Kitsune Festival Mask",
        "quantity": 1,
        "unitPriceInr": 2499,
        "lineTotalInr": 2499
      }
    ],
    "subtotalInr": 2499,
    "shippingInr": 149,
    "totalPriceInr": 2648,
    "paymentReference": "pay_1ea3793b-3cc5-498f-aca4-a4ae08ded729",
    "createdAt": "2026-08-07T10:30:00.000Z"
  }
}
```

This unprotected endpoint is acceptable only for the local, single-user MVP. It must be secured or removed before public deployment.

## Error Shape

New checkout errors follow the existing flat API style while adding a stable `code`:

```json
{
  "status": "error",
  "code": "EMPTY_CART",
  "message": "Cannot checkout an empty cart."
}
```

Field validation may include `fieldErrors`:

```json
{
  "status": "error",
  "code": "INVALID_CHECKOUT",
  "message": "Checkout details are invalid.",
  "fieldErrors": {
    "shippingAddress.postalCode": "Postal code must contain exactly 6 digits."
  }
}
```

## Error Catalogue

| HTTP | Code | Behavior |
| --- | --- | --- |
| 400 | `INVALID_CHECKOUT` | Correct the request; cart is preserved |
| 400 | `EMPTY_CART` | Add items before checkout |
| 400 | `INVALID_IDEMPOTENCY_KEY` | Supply a UUID header |
| 404 | `ORDER_NOT_FOUND` | Requested in-memory order does not exist |
| 409 | `PRODUCT_UNAVAILABLE` | Review/remove unavailable cart item |
| 409 | `IDEMPOTENCY_KEY_REUSED` | Generate a key for the modified request |
| 422 | `PAYMENT_DECLINED` | Use the successful simulation token |
| 500 | `INTERNAL_ERROR` | Retry the same submission with the same key |

## Frontend Handling

- Do not automatically retry `400`, `404`, `409`, or `422` responses.
- A network or `500` retry reuses the same idempotency key.
- On success or replay, set `cartKeys.current` to the returned `cart`.
- Navigate to `/orders/:id` using `order.id`.
- Fetch confirmation through `GET /orders/:id` so refreshing the route works while the API process is alive.
