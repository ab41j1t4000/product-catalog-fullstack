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

## Supabase setup

The catalog uses Supabase when both server environment variables are present.
Copy `.env.example` to `.env`, then replace the placeholders with the URL and
secret key from your Supabase project's **Connect** dialog:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your-server-only-key
```

Never add the secret key to `product-catalog-web` or expose it through a
`VITE_` variable. It bypasses row-level security and belongs only in this API.

Apply the SQL migration and seed from the repository root after linking a
Supabase project:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push --include-seed
```

If the two Supabase variables are absent, the API intentionally uses the
in-memory catalog. This keeps unit tests independent of a cloud account.

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
- persists catalog and admin changes in Supabase when configured
- keeps an in-memory adapter for local tests
- listens on port `4000` by default

Checkout is a local simulation. Use `tok_simulated_success` for approval or
`tok_simulated_decline` for a decline. Orders, the cart, and completed idempotency
records are process-local and disappear when the API restarts. Product changes
persist when Supabase is configured; carts, orders, and idempotency records are
still process-local.
