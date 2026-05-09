# Product Catalog API

Lean Fastify + Prisma backend for the product catalog MVP. It exposes product discovery, email-based sign-in, and a mock paid checkout flow suitable for local development and integration work.

## Tech stack

- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- Zod for request validation

## Features

- Paginated product listing with category and text search
- Product detail endpoint
- Email-based account sign-in with persistent session tokens
- Mock checkout that creates paid orders and decrements inventory

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/product_catalog?schema=public"
PORT=4000
```

3. Create the schema and generate the Prisma client:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed sample products:

```bash
npm run seed
```

5. Start the API:

```bash
npm run dev
```

The API will run on `http://localhost:4000`.

## Key endpoints

- `GET /health`
- `GET /api/products?search=&category=&page=1&limit=12`
- `GET /api/products/:slug`
- `POST /api/auth/sign-in`
- `GET /api/auth/me`
- `POST /api/checkout`

## Notes

- Checkout is intentionally a mock payment flow for the MVP. Orders are marked `paid` immediately and return a payment reference.
- For production hardening, replace token auth and mock checkout with a real identity provider and payment processor such as Clerk/Auth0 and Stripe.
