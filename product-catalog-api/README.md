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

4. Seed sample products and the demo user:

```bash
npm run seed
```

Seeded customer account:

- Email: `alex@catalog.dev`
- Name: `Alex Carter`

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
- `GET /api/orders`
- `POST /api/checkout`

## Request flow

This backend is easiest to understand as a pipeline:

`frontend request -> route -> schema validation -> service -> Prisma -> PostgreSQL`

### What each layer does

- Frontend request: sends HTTP requests from the web app
- Route: receives the request in Fastify and decides which handler to run
- Schema validation: checks query params or request body with Zod before business logic runs
- Service: contains the real application logic such as auth, product filtering, slug generation, or checkout
- Prisma: translates service calls into database queries
- PostgreSQL: stores the actual users, sessions, products, orders, and order items

### Example 1: Load products

1. Frontend calls `GET /api/products?search=lamp`
2. Route handler in `src/routes/product.routes.ts` receives it
3. `productSearchSchema` in `src/schemas/product.schema.ts` validates the query
4. `listProducts()` in `src/services/product.service.ts` builds the Prisma filter
5. Prisma queries the `Product` table in PostgreSQL
6. The API returns matching products, categories, and pagination

### Example 2: Customer sign-in

1. Frontend sends `POST /api/auth/sign-in` with email and optional name
2. Route handler in `src/routes/auth.routes.ts` validates the body with `signInSchema`
3. `signInUser()` in `src/services/cart.service.ts` upserts the user
4. The service creates a session token, stores its hash in the `Session` table, and returns the raw token
5. Frontend stores the token and sends it later as `Authorization: Bearer <token>`

### Example 3: Admin edits a product

1. Admin page sends `PUT /api/admin/products/:id`
2. Route handler checks the current user with `requireAdminUser()`
3. Request body is validated with `adminProductSchema`
4. `updateProduct()` in `src/services/product.service.ts` generates a unique slug and updates the row
5. Prisma writes the changes to the `Product` table
6. The updated product is returned to the frontend

### Example 4: Checkout

1. Frontend sends `POST /api/checkout` with shipping address and cart items
2. Route handler checks auth with `getUserFromRequest()`
3. `checkoutSchema` validates the request body
4. `createCheckout()` in `src/services/cart.service.ts`:
   - fetches matching products
   - checks inventory
   - calculates subtotal, tax, and total
   - decrements product inventory
   - creates the `Order` and `OrderItem` records in a Prisma transaction
5. PostgreSQL commits the transaction
6. API returns the mock payment result

### Example 5: Load order history

1. Frontend sends `GET /api/orders` with `Authorization: Bearer <token>`
2. Route handler in `src/routes/cart.routes.ts` resolves the user with `getUserFromRequest()`
3. `listOrders()` in `src/services/cart.service.ts` fetches the user's orders and item snapshots
4. Prisma queries the `Order` and `OrderItem` tables in PostgreSQL
5. The API returns newest-first order history for the signed-in customer

### Files to read in order

If you want to trace the codebase from top to bottom, read these in sequence:

1. `src/server.ts`
2. `src/routes/product.routes.ts`, `src/routes/auth.routes.ts`, `src/routes/cart.routes.ts`
3. `src/schemas/product.schema.ts`, `src/schemas/cart.schema.ts`
4. `src/services/product.service.ts`, `src/services/cart.service.ts`
5. `src/db/prisma.ts`
6. `prisma/schema.prisma`

## Notes

- Checkout is intentionally a mock payment flow for the MVP. Orders are marked `paid` immediately and return a payment reference.
- For production hardening, replace token auth and mock checkout with a real identity provider and payment processor such as Clerk/Auth0 and Stripe.
