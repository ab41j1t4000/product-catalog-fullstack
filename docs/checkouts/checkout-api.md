# Checkout API Contract

## Conventions

- Base URL in local development: `http://localhost:4000`
- Content type: `application/json`
- Currency: `INR`
- Money: integer rupees for the simulated MVP
- Dates: ISO 8601 UTC strings
- IDs: opaque strings; clients must not infer ordering or type from their format
- Checkout requests require `X-Cart-Id` and `Idempotency-Key`

## Common Error Shape

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_CHECKOUT",
    "message": "Checkout details are invalid.",
    "fieldErrors": {
      "shippingAddress.postalCode": "Enter a valid six-digit Indian postal code."
    }
  },
  "requestId": "req_01J..."
}
```

`code` is stable and intended for application logic. `message` is safe for display but may change. `fieldErrors` is optional.

## Create Anonymous Cart

### Request

```http
POST /carts
Content-Type: application/json
```

No request body is required.

### Response — `201 Created`

```json
{
  "status": "ok",
  "cart": {
    "id": "cart_01J...",
    "version": 1,
    "items": [],
    "totalItems": 0,
    "subtotalInr": 0
  }
}
```

All existing `/cart` endpoints should be migrated to require `X-Cart-Id`. During migration, the frontend must create or restore its cart ID before querying the cart.

## Preview Checkout

Preview is recommended so the checkout page can show authoritative shipping and totals before payment.

### Request

```http
POST /checkout/preview
X-Cart-Id: cart_01J...
Content-Type: application/json
```

```json
{
  "shippingAddress": {
    "postalCode": "682001",
    "country": "IN"
  }
}
```

### Response — `200 OK`

```json
{
  "status": "ok",
  "preview": {
    "cartVersion": 3,
    "currency": "INR",
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
    "taxInr": 0,
    "totalInr": 2648
  }
}
```

## Submit Checkout

### Request

```http
POST /checkout
X-Cart-Id: cart_01J...
Idempotency-Key: 9ed7463a-8e5e-44fc-87d8-4ff00aa6388d
Content-Type: application/json
```

```json
{
  "expectedCartVersion": 3,
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
    "method": "SIMULATED_CARD",
    "token": "tok_simulated_success"
  }
}
```

### Validation rules

- `expectedCartVersion`: positive integer
- `customer.name`: trimmed, 2–120 characters
- `customer.email`: valid email, maximum 254 characters
- `customer.phone`: normalized Indian number in `+91XXXXXXXXXX` form
- address text fields: trimmed and bounded; `line2` optional
- `postalCode`: six digits
- `country`: exactly `IN`
- `payment.method`: exactly `SIMULATED_CARD` for the MVP
- `payment.token`: allowlisted simulation token; maximum 100 characters
- `Idempotency-Key`: UUID, 36 characters

The request intentionally excludes products, prices, shipping charges, tax, and total.

### Response — `201 Created`

```json
{
  "status": "ok",
  "order": {
    "id": "ord_01J...",
    "status": "CONFIRMED",
    "currency": "INR",
    "customer": {
      "name": "Ananya Nair",
      "email": "ananya@example.com"
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
    "taxInr": 0,
    "totalInr": 2648,
    "createdAt": "2026-08-06T12:00:00.000Z"
  },
  "confirmationToken": "confirm_opaque_high_entropy_value",
  "cart": {
    "id": "cart_01J...",
    "version": 4,
    "items": [],
    "totalItems": 0,
    "subtotalInr": 0
  }
}
```

The same successful request repeated with the same idempotency key returns `200 OK` and the stored response, with header `Idempotent-Replayed: true`.

## Get Guest Order Confirmation

### Request

```http
GET /orders/ord_01J.../confirmation
X-Order-Confirmation-Token: confirm_opaque_high_entropy_value
```

### Response — `200 OK`

Returns the public `order` object from the successful checkout response. It does not return phone number, payment token, provider metadata, internal notes, or idempotency data.

## Error Catalogue

| HTTP | Code | Meaning | Retry behavior |
| --- | --- | --- | --- |
| 400 | `INVALID_CHECKOUT` | Body or header validation failed | Correct input |
| 400 | `EMPTY_CART` | Cart has no lines | Add an item |
| 400 | `UNSUPPORTED_ADDRESS` | Address is outside supported scope | Correct address |
| 401 | `INVALID_CONFIRMATION_TOKEN` | Guest confirmation credential is invalid | Do not retry blindly |
| 404 | `CART_NOT_FOUND` | Cart ID is unknown or expired | Create/restore cart |
| 404 | `ORDER_NOT_FOUND` | Order does not exist | Verify order ID |
| 409 | `CART_CHANGED` | Cart version, product price, or availability changed | Update cache and review |
| 409 | `CHECKOUT_IN_PROGRESS` | Matching idempotent request is processing | Retry same request later |
| 409 | `IDEMPOTENCY_KEY_REUSED` | Key was used with another payload | Generate a new key |
| 422 | `PRODUCT_UNAVAILABLE` | One or more products cannot be ordered | Update cart |
| 422 | `PAYMENT_DECLINED` | Simulated payment was declined | Use another simulation outcome |
| 429 | `RATE_LIMITED` | Too many requests | Honor `Retry-After` |
| 500 | `INTERNAL_ERROR` | Unexpected server error | Retry same idempotent request |

## Cart-Changed Response

```json
{
  "status": "error",
  "error": {
    "code": "CART_CHANGED",
    "message": "Your cart changed. Review the latest prices before checking out."
  },
  "cart": {
    "id": "cart_01J...",
    "version": 4,
    "items": [
      {
        "id": "item_01J...",
        "productId": "1",
        "quantity": 1,
        "product": {
          "id": "1",
          "name": "Kitsune Festival Mask",
          "priceInr": 2599,
          "inStock": true
        }
      }
    ],
    "totalItems": 1,
    "subtotalInr": 2599
  },
  "requestId": "req_01J..."
}
```

The frontend should place the returned cart into the `cart` TanStack Query cache and require another explicit submission.

## Payment-Declined Response

```json
{
  "status": "error",
  "error": {
    "code": "PAYMENT_DECLINED",
    "message": "The simulated payment was declined."
  },
  "requestId": "req_01J..."
}
```

## Compatibility and Versioning

- Additive response fields are backward compatible.
- Removing or changing a field’s meaning requires a versioned endpoint or coordinated deployment.
- Stable error codes are part of the contract.
- Before real payments, introduce paise-denominated fields in a new contract version rather than silently changing the unit.
