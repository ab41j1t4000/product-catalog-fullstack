# Product Catalog Fullstack

A full-stack learning project for a curated ecommerce experience focused on
Japanese masks in India.

The application currently supports browsing products, viewing product details,
managing a cart, and creating or updating products from an admin screen. Checkout
simulation is the active feature under development.

## Tech Stack

- frontend: React, TypeScript, Vite, Chakra UI, TanStack Query, and React Router
- backend: Fastify and TypeScript
- component development: Storybook
- current data store: in-memory arrays in the backend

## Repo Structure

```text
.
├── docs/
├── product-catalog-api/
└── product-catalog-web/
```

## Run Locally

Install dependencies and start the backend:

```bash
cd product-catalog-api
npm install
npm run dev
```

In a separate terminal, install dependencies and start the frontend:

```bash
cd product-catalog-web
npm install
npm run dev
```

Endpoints:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`
- Storybook: `http://localhost:6006` after running `npm run storybook` from
  `product-catalog-web`

## What Exists Today

- product catalog and product-detail pages
- cart page with add, update, remove, totals, and a cart badge
- admin page for creating and updating products
- TanStack Query for frontend server-state fetching and mutations
- Fastify APIs for health, products, admin product management, and cart management
- in-memory product and cart services
- Storybook stories for selected UI components
- checkout requirements, API contract, high-level design, and low-level design

## Application Routes

Frontend:

- `/` - product catalog
- `/products/:id` - product details
- `/cart` - shopping cart
- `/admin` - product administration

Backend:

- `GET /health`
- `GET /products`
- `GET /products/:id`
- `POST /admin/products`
- `PATCH /admin/products/:id`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`

## Current Development Status

Completed:

1. catalog listing
2. product detail
3. cart
4. admin product management
5. TanStack Query integration

In progress:

6. checkout simulation

Planned next:

7. persistent storage

Checkout is currently in the design-to-implementation stage. The intended build
sequence starts with backend test setup and extracting a testable Fastify app,
then adds checkout schemas and services, API routes, and finally the frontend
checkout and order-confirmation flow.

## Documentation

- product brief: [docs/product.md](docs/product.md)
- architecture and diagrams: [docs/architecture.md](docs/architecture.md)
- checkout requirements: [docs/checkouts/checkout-requirements.md](docs/checkouts/checkout-requirements.md)
- checkout API contract: [docs/checkouts/checkout-api.md](docs/checkouts/checkout-api.md)
- checkout high-level design: [docs/checkouts/checkout-hld.md](docs/checkouts/checkout-hld.md)
- checkout low-level design: [docs/checkouts/checkout-lld.md](docs/checkouts/checkout-lld.md)
- frontend details: [product-catalog-web/README.md](product-catalog-web/README.md)
- backend details: [product-catalog-api/README.md](product-catalog-api/README.md)

## Recommended Reading Order

1. [docs/product.md](docs/product.md)
2. [docs/architecture.md](docs/architecture.md)
3. [product-catalog-api/src/server.ts](product-catalog-api/src/server.ts)
4. [product-catalog-api/src/services/product.service.ts](product-catalog-api/src/services/product.service.ts)
5. [product-catalog-api/src/services/cart.service.ts](product-catalog-api/src/services/cart.service.ts)
6. [product-catalog-web/src/App.tsx](product-catalog-web/src/App.tsx)
7. [docs/checkouts/checkout-lld.md](docs/checkouts/checkout-lld.md)

## Current Limitations

- data resets whenever the backend restarts
- the application uses a single shared cart and has no authentication
- admin routes are not protected
- checkout and order confirmation are not implemented yet
