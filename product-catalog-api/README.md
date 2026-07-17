# Product Catalog API

Minimal Fastify + TypeScript starter for learning how a backend server runs.

## What to read first

1. `src/server.ts`

## Run locally

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

## Available route

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`

## What this app does

- creates a Fastify server
- enables CORS for the frontend during local development
- exposes in-memory product, admin, and cart routes
- listens on port `4000` by default
