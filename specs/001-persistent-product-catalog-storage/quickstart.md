# Quickstart: Validate Persistent Product Catalog Storage

This guide validates the feature without requiring the default test suite to use a live
database. The configured-storage restart scenario requires a Supabase project with the
repository migration and seed applied.

## Prerequisites

- Node.js and npm installed.
- Dependencies installed in `product-catalog-api` and `product-catalog-web`.
- For durable-mode validation only: a configured Supabase project and server-only environment
  values documented in `product-catalog-api/README.md`.

## 1. Run deterministic checks

From the API directory:

```bash
cd product-catalog-api
npm run build
npm test
```

Expected result: the API builds and the product, cart, checkout, and persistence-boundary tests
pass without requiring live database credentials. In the Codex sandbox, `npm test` may fail
before test execution because `tsx` attempts to open an IPC pipe; use the equivalent direct
Node runner as the deterministic fallback:

```bash
node --import tsx --test --test-concurrency=1 \
  src/app.test.ts src/lib/*.test.ts src/repositories/*.test.ts src/services/*.test.ts
```

From the frontend directory:

```bash
cd ../product-catalog-web
npm run build
```

Expected result: the existing catalog, detail, cart, and admin consumers remain build-compatible.

## 2. Validate configured durable storage

1. Configure the API using the server-only values described in
   `product-catalog-api/README.md`.
2. Apply the existing products migration and seed to the selected project.
3. Start the API from `product-catalog-api`.
4. Read the catalog and one product detail through the existing product routes.
5. Create a uniquely sluggified product through the existing admin route and record its returned
   identifier.
6. Update one field on that product and verify the returned value.
7. Stop and restart the API without changing the durable data.
8. Read the catalog and product detail again.

Expected result: the created product and updated field remain available after restart, and the
existing response shapes remain compatible.

## 3. Validate failure behavior

Verify the following independently:

- Invalid product data returns `400` and creates no partial product.
- A duplicate slug returns `409` and does not create a second product.
- Updating a missing product returns `404` and does not mutate another product.
- A partial or unavailable durable-store configuration returns a safe service-unavailable
  failure and does not claim a successful write.
- The frontend shows an error state without presenting an empty or falsely saved catalog as
  authoritative.

## 4. Evidence to attach to the Issue and pull request

- API build output.
- API test output.
- Frontend build output.
- The durable-mode create, update, restart, and read-back results when that environment is
  available.
- Any limitation caused by local fallback mode or unavailable external storage.

## 5. Local verification evidence

Observed on 2026-10-16:

- API TypeScript build: passed.
- API direct Node/tsx test runner: 27 tests passed, 0 failed.
- API `npm test`: the sandbox blocked the `tsx` IPC pipe with `listen EPERM` before test execution; the direct Node/tsx command above passed the same suite.
- Frontend production build: passed. Vite emitted a pre-existing bundle-size warning for a chunk larger than 500 kB.
- Changed frontend fetch client lint: passed.
- Full frontend lint remains blocked by five pre-existing errors in `src/components/ui/color-mode.tsx` and `src/components/ui/toaster.tsx`.

The configured-Supabase restart/readback smoke test was not run because it would write to the
remote catalog. Local fallback and deterministic repository recreation tests do not claim remote
durable-storage proof.
