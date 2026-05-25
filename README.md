# Product Catalog Fullstack

Minimal full-stack starter for a curated ecommerce platform focused on Japanese masks in India.

The repo currently contains a stripped-down learning scaffold:

- `product-catalog-web`: React + Vite frontend
- `product-catalog-api`: Fastify + TypeScript backend
- `docs`: product and architecture documentation

## Repo Structure

```text
.
├── docs/
├── product-catalog-api/
└── product-catalog-web/
```

## Run Locally

Start the backend first:

```bash
cd product-catalog-api
npm install
npm run dev
```

Then start the frontend in a separate terminal:

```bash
cd product-catalog-web
npm install
npm run dev
```

Endpoints:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`
- backend health route: `GET /health`

## What Exists Today

- frontend bootstraps React and calls the backend health route
- backend exposes a single Fastify health endpoint
- architecture docs define the intended product and system direction before feature expansion

## Documentation

- product brief: [docs/product.md](docs/product.md)
- architecture and diagrams: [docs/architecture.md](docs/architecture.md)
- frontend details: [product-catalog-web/README.md](product-catalog-web/README.md)
- backend details: [product-catalog-api/README.md](product-catalog-api/README.md)

## Recommended Reading Order

1. [docs/product.md](docs/product.md)
2. [docs/architecture.md](docs/architecture.md)
3. [product-catalog-api/src/server.ts](product-catalog-api/src/server.ts)
4. [product-catalog-web/src/main.tsx](product-catalog-web/src/main.tsx)
5. [product-catalog-web/src/App.tsx](product-catalog-web/src/App.tsx)

## Near-Term Build Order

1. catalog listing
2. product detail
3. cart
4. checkout simulation
5. persistent storage
