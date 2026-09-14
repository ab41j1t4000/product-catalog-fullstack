# Product Catalog API

Minimal Fastify + TypeScript starter for learning how a backend server runs.

## What to read first

1. `src/app.ts` for routes and request handling
2. `src/services/checkout.service.ts` for the checkout flow
3. `src/server.ts` for process startup

## Run locally

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

## Available routes

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`
- `POST /checkout` (requires a UUID `Idempotency-Key` header)
- `GET /orders/:id`

## What this app does

- creates a testable Fastify server
- enables CORS for the frontend during local development
- exposes in-memory product, admin, cart, checkout, and order routes
- listens on port `4000` by default

Checkout is a local simulation. Use `tok_simulated_success` for approval or
`tok_simulated_decline` for a decline. Orders, the cart, and completed idempotency
records are process-local and disappear when the API restarts.
