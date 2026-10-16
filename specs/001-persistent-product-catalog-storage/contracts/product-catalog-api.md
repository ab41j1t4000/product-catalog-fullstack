# Product Catalog API Contract

This contract preserves the existing product routes while the persistence implementation is
refactored behind a narrow repository boundary.

## Product shape

```json
{
  "id": "1",
  "slug": "kitsune-festival-mask",
  "name": "Kitsune Festival Mask",
  "priceInr": 2499,
  "shortDescription": "White fox mask with red festival detailing.",
  "imageUrl": "https://example.test/mask.jpg",
  "maskType": "Fox",
  "inStock": true
}
```

## Read routes

### `GET /products/`

Success: `200`

```json
{ "items": ["Product"] }
```

If the selected product store is unavailable: `503` with a safe error message.

### `GET /products/:id`

Success: `200`

```json
{ "status": "ok", "item": "Product" }
```

Missing product: `404` with the existing not-found response. Store failure: `503` with a safe
error message.

## Admin write routes

### `POST /admin/products`

Request body: a product without `id`.

Success: `201`

```json
{ "status": "ok", "message": "Product created successfully.", "item": "Product" }
```

Invalid product: `400`. Duplicate slug: `409`. Store failure: `503`.

### `PATCH /admin/products/:id`

Request body: one or more product fields without `id`.

Success: `200`

```json
{ "status": "ok", "message": "Product updated successfully.", "item": "Product" }
```

Invalid product: `400`. Missing product: `404`. Duplicate slug: `409`. Store failure: `503`.

## Persistence behavior

- The active repository is selected from server configuration.
- A configured store remains authoritative for all product reads and writes.
- The fallback repository is used only when durable storage is intentionally not configured for
  local or test execution.
- No route may report a successful write when the selected repository did not save the record.
- Existing cart and checkout consumers continue to receive the same product shape.
