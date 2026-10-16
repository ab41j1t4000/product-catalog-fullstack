---
description: "Actionable task list for persistent product catalog storage"
---

# Tasks: Persistent Product Catalog Storage

**Input**: Design documents from `/specs/001-persistent-product-catalog-storage/`

**Prerequisites**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/product-catalog-api.md](contracts/product-catalog-api.md), and [quickstart.md](quickstart.md)

**Tests**: Included because the feature specification requires deterministic automated verification and explicit failure-path coverage.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated as an independently testable increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing repository and verification baseline without changing application behavior.

- [X] T001 [P] Update the API test command in `product-catalog-api/package.json` so repository and route tests run through the existing `tsx`/Node test setup without requiring live database credentials.
- [X] T002 [P] Verify and, if required, align the product schema constraints in `supabase/migrations/20260923000000_create_products.sql` and preserve compatible baseline rows in `supabase/seed.sql`; the persisted model must keep `slug` “Non-empty and unique within the catalog”, `name` “Non-empty”, `priceInr` as a “non-negative integer”, and all other product fields required by `data-model.md`.
- [X] T003 [P] Update `specs/001-persistent-product-catalog-storage/quickstart.md` with the final deterministic test commands, configured-storage restart/readback steps, and the distinction between local fallback evidence and durable persistence evidence.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the storage boundary and deterministic test foundation required by every user story.

**⚠️ CRITICAL**: No user story implementation begins until this phase is complete.

- [X] T004 Define the narrow `ProductRepository` interface, product input/output types, and typed duplicate, not-found, configuration, and unavailable-store errors in `product-catalog-api/src/repositories/product.repository.ts` based on `contracts/product-catalog-api.md`.
- [X] T005 [P] Implement `InMemoryProductRepository` in `product-catalog-api/src/repositories/in-memory-product.repository.ts` with resettable fixtures, defensive copies, and the data-model invariants: `slug` is “Non-empty and unique within the catalog”; `name`, `shortDescription`, `imageUrl`, and `maskType` are “Non-empty”; `priceInr` is a “non-negative integer”; and a missing update does not mutate another record.
- [X] T006 [P] Implement `SupabaseProductRepository` in `product-catalog-api/src/repositories/supabase-product.repository.ts` using the existing products table, mapping snake_case storage columns to the camelCase API product shape, and translating provider failures into safe repository errors without exposing credentials or provider details.
- [X] T007 [P] Harden partial and invalid Supabase configuration handling in `product-catalog-api/src/lib/supabase.ts` so a configured-but-unusable store is distinguishable from intentional local/test fallback mode.
- [X] T008 Wire repository selection and dependency injection through `product-catalog-api/src/services/product.service.ts`; Supabase must remain authoritative whenever fully configured, and configured-store failures must not silently fall back to in-memory data.
- [X] T009 Add repository contract tests in `product-catalog-api/src/repositories/product.repository.test.ts` covering list, detail, create, update, duplicate slug, missing product, invalid values, reset/isolation behavior, and safe store-failure mapping for both repository modes where applicable.
- [X] T010 Update `product-catalog-api/src/app.ts` to construct the service with an injectable repository/test dependency while preserving the existing route envelopes and status semantics from `contracts/product-catalog-api.md`.

**Checkpoint**: The repository boundary is usable, deterministic tests can run without a live database, and every user story can now use the same storage authority.

---

## Phase 3: User Story 1 - Browse a Catalog After a Restart (Priority: P1) 🎯 MVP

**Goal**: Shoppers can list published products and open product details after the application is recreated or restarted, without an empty catalog being presented as authoritative when storage fails.

**Independent Test**: Save known products through a repository-backed API instance, recreate the API instance against the same durable test repository, then verify `GET /products/` and `GET /products/:id` return the same values. Use the quickstart for the actual configured-Supabase process restart check.

### Tests for User Story 1

- [X] T011 [P] [US1] Add an API test in `product-catalog-api/src/app.test.ts` that creates a known product state, recreates the application with the same repository, calls `GET /products/`, and verifies the published products remain available with the `{ "items": [...] }` response shape.
- [X] T012 [P] [US1] Add an API test in `product-catalog-api/src/app.test.ts` that recreates the application, calls `GET /products/:id`, and verifies retained product details remain consistent with the catalog response; also cover a configured repository read failure returning `503` instead of an authoritative empty list.

### Implementation for User Story 1

- [X] T013 [US1] Route catalog list and detail reads through the selected repository in `product-catalog-api/src/services/product.service.ts` and `product-catalog-api/src/app.ts`, preserving `200`/`404` response behavior and mapping unavailable configured storage to a safe `503` response.

**Checkpoint**: User Story 1 is independently functional and proves the read-side persistence contract; durable process-restart evidence is recorded separately when Supabase is available.

---

## Phase 4: User Story 2 - Publish a Product That Persists (Priority: P1)

**Goal**: Administrators can create a valid product through the existing admin flow, receive the created product, and observe it in the catalog after restart; invalid input and failed storage never produce a false success.

**Independent Test**: Submit a valid `POST /admin/products`, verify the `201` response and catalog visibility, submit invalid and duplicate values, and verify `400`/`409` failures leave no partial or duplicate record. Then run the configured-storage restart/readback check.

### Tests for User Story 2

- [X] T014 [P] [US2] Add API tests in `product-catalog-api/src/app.test.ts` for a valid `POST /admin/products`, verifying the `201` response envelope, returned product values, and subsequent catalog visibility.
- [X] T015 [P] [US2] Add API tests in `product-catalog-api/src/app.test.ts` for invalid/incomplete product data, duplicate slug, and configured-store write failure, verifying `400`/`409`/`503` responses and no partial or falsely reported saved product.

### Implementation for User Story 2

- [X] T016 [US2] Enforce create validation in `product-catalog-api/src/schemas/product.schema.ts` and `product-catalog-api/src/services/product.service.ts` so all required fields are present, `priceInr` is a non-negative integer, and no product is saved when validation fails.
- [X] T017 [US2] Implement repository-backed create behavior and preserve the existing `POST /admin/products` response/status mapping in `product-catalog-api/src/services/product.service.ts` and `product-catalog-api/src/app.ts`, including duplicate slug `409` and store failure `503`.
- [X] T018 [US2] Verify the existing admin create client remains compatible with the API contract in `product-catalog-web/src/features/admin/api/adminApi.ts`; update only request/error handling needed to preserve the current admin flow for `400`, `409`, and `503` responses.

**Checkpoint**: User Story 2 is independently functional and a successfully created product can be verified through the catalog before and after a durable-storage restart.

---

## Phase 5: User Story 3 - Update a Product That Persists (Priority: P2)

**Goal**: Administrators can update an existing product, retain the changed values after restart, and receive clear errors without mutating unrelated records when the target is invalid or missing.

**Independent Test**: Patch an existing product, verify the `200` response and changed catalog/detail values, then test invalid, duplicate, and missing-target updates and confirm the expected failure response and state preservation.

### Tests for User Story 3

- [X] T019 [P] [US3] Add an API test in `product-catalog-api/src/app.test.ts` for a valid `PATCH /admin/products/:id`, verifying the `200` response, updated catalog/detail values, and persistence through application recreation.
- [X] T020 [P] [US3] Add API tests in `product-catalog-api/src/app.test.ts` for invalid update data, duplicate slug, missing product, and configured-store update failure, verifying `400`/`409`/`404`/`503` responses and that no unrelated product changes.

### Implementation for User Story 3

- [X] T021 [US3] Enforce update validation in `product-catalog-api/src/schemas/product.schema.ts` and `product-catalog-api/src/services/product.service.ts`, preserving the invariants that required fields cannot be omitted from a resulting saved product, `priceInr` is a non-negative integer, and invalid updates leave the existing product unchanged.
- [X] T022 [US3] Implement repository-backed update behavior and preserve the existing `PATCH /admin/products/:id` response/status mapping in `product-catalog-api/src/services/product.service.ts` and `product-catalog-api/src/app.ts`, including missing target `404`, duplicate slug `409`, and store failure `503`.
- [X] T023 [US3] Verify the existing admin update client remains compatible with the API contract in `product-catalog-web/src/features/admin/api/adminApi.ts`; update only request/error handling needed to preserve the current admin flow for `404`, `409`, and `503` responses.

**Checkpoint**: User Story 3 is independently functional and updated values survive the configured durable-storage restart/readback check.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm compatibility, security boundaries, and evidence across all stories.

- [X] T024 [P] Review and, where needed, add or update regression coverage in `product-catalog-api/src/app.test.ts`, `product-catalog-web/src/features/products/api/fetchProducts.ts`, `product-catalog-web/src/features/cart/api/cartApi.ts`, and `product-catalog-web/src/features/checkout/pages/CheckoutPage.tsx` to confirm the camelCase product shape remains compatible with catalog, cart, and checkout journeys.
- [X] T025 [P] Review `product-catalog-api/src/lib/supabase.ts` and `product-catalog-api/src/app.ts` for secret-safe logging and safe error responses; ensure raw credentials, provider URLs, and database diagnostics are not returned to clients or written to logs.
- [X] T026 Run `npm run build` and `npm test` from `product-catalog-api/`, then record the observed output and any limitations in `specs/001-persistent-product-catalog-storage/quickstart.md`.
- [X] T027 Run `npm run build` from `product-catalog-web/` and record frontend compatibility evidence in `specs/001-persistent-product-catalog-storage/quickstart.md`.
- [ ] T028 Execute the optional configured-Supabase create, update, stop, restart, and readback scenario from `specs/001-persistent-product-catalog-storage/quickstart.md`, recording whether durable restart evidence was obtained without claiming local fallback as proof.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No implementation dependency; tasks can run in parallel.
- **Foundational (Phase 2)**: Depends on the setup baseline and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2; independently testable.
- **User Story 2 (Phase 4)**: Depends on Phase 2; independently testable and can run in parallel with US1 after the repository boundary is complete.
- **User Story 3 (Phase 5)**: Depends on Phase 2 and an existing seeded or test product; it does not require US1 or US2 code, but is recommended after the read/create contracts are stable.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### Dependency Graph

```text
Phase 1 Setup
    ↓
Phase 2 Foundational
    ├──→ Phase 3 US1: Browse after restart
    ├──→ Phase 4 US2: Publish and persist
    └──→ Phase 5 US3: Update and persist
              ↓
       Phase 6 Polish and evidence
```

### Within Each User Story

- Tests are written before the corresponding implementation tasks.
- Repository/service behavior is implemented before route/client integration changes.
- Each story checkpoint must pass before it is considered independently complete.
- Durable restart claims require the configured-Supabase quickstart scenario; in-memory recreation tests are not sufficient evidence by themselves.

## Parallel Execution Examples

### User Story 1

```text
Parallel after Phase 2:
- T011: list-after-recreation API test in product-catalog-api/src/app.test.ts
- T012: detail-after-recreation and read-failure API test in product-catalog-api/src/app.test.ts

Then:
- T013: repository-backed read implementation and route mapping
```

### User Story 2

```text
Parallel after Phase 2:
- T014: successful create API test in product-catalog-api/src/app.test.ts
- T015: invalid, duplicate, and store-failure API tests in product-catalog-api/src/app.test.ts

Then:
- T016: create validation
- T017: repository-backed create route behavior
- T018: admin client compatibility review after the API contract is stable
```

### User Story 3

```text
Parallel after Phase 2:
- T019: successful update/recreation API test in product-catalog-api/src/app.test.ts
- T020: invalid, duplicate, missing, and store-failure API tests in product-catalog-api/src/app.test.ts

Then:
- T021: update validation
- T022: repository-backed update route behavior
- T023: admin client compatibility review after the API contract is stable
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational repository and test boundary.
3. Complete Phase 3 User Story 1: browse retained products after restart.
4. Validate the read contract independently and record the limitation that only configured Supabase proves durable process restart.
5. Add Phase 4 User Story 2 for administrator publishing and persistence.

### Incremental Delivery

1. Setup plus foundational boundary → deterministic testable storage.
2. US1 → retained catalog browsing and detail reads.
3. US2 → durable administrator publishing.
4. US3 → durable administrator updates.
5. Polish → compatibility, security review, builds, and evidence.

### Parallel Team Strategy

After Phase 2 is complete:

- Developer A can implement US1 read behavior and tests.
- Developer B can implement US2 create behavior and tests.
- Developer C can prepare US3 update tests and behavior, using the seeded product baseline.

Because several tasks touch `product-catalog-api/src/app.test.ts` and `product-catalog-api/src/services/product.service.ts`, parallel work should be split by logical commits or coordinated to avoid same-file conflicts.

## Completion Criteria

- Every task above is checked off or explicitly deferred with a reason.
- All three user stories have independent acceptance evidence.
- API tests and builds pass without live database credentials.
- Frontend build remains compatible with the existing product shape.
- Durable restart/readback evidence is recorded when configured Supabase is available.
- The linked GitHub Issue and pull request identify the final spec, plan, tasks, and verification evidence.
