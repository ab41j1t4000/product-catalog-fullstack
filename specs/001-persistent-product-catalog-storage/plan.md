# Implementation Plan: Persistent Product Catalog Storage

**Branch**: `001-persistent-product-catalog-storage`  
**Date**: 2026-10-16  
**Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-persistent-product-catalog-storage/spec.md`

## Summary

The repository already contains partial Supabase persistence, an in-memory fallback, product routes, and a products migration/seed baseline. This implementation will make that behavior explicit and testable by introducing a narrow `ProductRepository` boundary with Supabase and in-memory implementations. The API response shapes and existing frontend consumers will remain compatible while product create, update, list, detail, duplicate-slug, validation, missing-record, and configured-storage failure behavior are covered by deterministic tests.

The default test path will not require a live database. Supabase/PostgreSQL will remain the durable source of truth when configured; the in-memory repository will be used deliberately for local fallback and isolated tests. A separate quickstart will document the optional restart/readback smoke check against configured Supabase.

## Technical Context

**Language/Version**: TypeScript 6.x on Node.js; React/TypeScript frontend remains the compatibility surface  
**Primary Dependencies**: Fastify 5, `@supabase/supabase-js`, `tsx`, Node.js test runner, React/Vite client  
**Storage**: Supabase/PostgreSQL in durable mode; in-memory repository only as a deliberate local/test mode  
**Testing**: Node built-in test runner through `tsx`, Fastify injection, API build, frontend build, and an optional configured-Supabase persistence smoke check  
**Target Platform**: Node.js Fastify API plus browser React application  
**Project Type**: Full-stack web application with a Fastify API and React frontend  
**Performance Goals**: Preserve current local API responsiveness and avoid extra network calls per product operation; no new throughput target is required for this MVP  
**Constraints**: Default tests must not require a live database; server-only secrets; no silent fallback when configured storage fails; preserve existing route response shapes and checkout/cart compatibility; no authentication, inventory, or multi-user scope  
**Scale/Scope**: One catalog for the current local MVP, covering product list/detail and admin create/update operations with the existing seed products as the baseline

## Constitution Check

### Before Phase 0

1. **Contract-First Development** — PASS. GitHub Issue #16 and the feature specification define observable routes, response shapes, persistence behavior, and failure outcomes before implementation.
2. **Vertical Full-Stack Slices** — PASS. The work follows product create/update/read behavior through the API and existing frontend/admin consumers without introducing a disconnected data-layer-only feature.
3. **Server-Owned Commerce Truth** — PASS. The selected repository owns product persistence and authoritative product values; the client remains a consumer of API responses.
4. **Acceptance and Failure-Path Testing** — PASS. The plan covers restart/readback, validation, duplicate slug, missing product, and configured-storage failure behavior in addition to successful paths.
5. **Secure Data Boundaries** — PASS. Supabase credentials remain server-only, errors are mapped to safe API responses, and the migration remains the schema authority.
6. **Minimal Maintainable Architecture** — PASS. A narrow repository boundary is justified by the existing two storage modes and the need for deterministic tests; no generic ORM or framework is introduced.
7. **Evidence-Based Completion** — PASS. Completion evidence will include targeted tests, builds, and the documented optional durable-storage smoke check.

**Gate**: PASS. No constitution violations or waivers are required before research and design work.

## Design Decisions

- Keep Supabase/PostgreSQL as the durable implementation when the required configuration is present.
- Keep an in-memory implementation for isolated tests and an intentional local fallback; do not silently switch to it after a configured Supabase operation fails.
- Move storage selection and persistence operations behind a small `ProductRepository` interface rather than expanding service-level branching.
- Make duplicate-slug checks use the active repository so Supabase and in-memory behavior have the same authority.
- Preserve the current public product JSON shape and route status semantics unless an acceptance test exposes an incompatibility.
- Treat the committed migration and seed data as the schema/data baseline; live remote database state is verified only through the optional smoke check.

## Project Structure

```text
specs/001-persistent-product-catalog-storage/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── product-catalog-api.md

product-catalog-api/
└── src/
    ├── app.ts
    ├── app.test.ts
    ├── lib/
    │   └── supabase.ts
    ├── repositories/
    │   ├── product.repository.ts
    │   ├── in-memory-product.repository.ts
    │   ├── supabase-product.repository.ts
    │   └── product.repository.test.ts
    ├── schemas/
    │   └── product.schema.ts
    └── services/
        └── product.service.ts

product-catalog-web/
└── src/features/
    ├── products/api/
    └── admin/api/

supabase/
├── migrations/20260923000000_create_products.sql
└── seed.sql
```

The monorepo structure and existing route/service locations are retained. The main implementation change is an API-side repository seam and its tests. Frontend code changes are not planned unless contract validation identifies a compatibility defect in an existing consumer.

## Implementation Sequence

1. Define the repository interface and product persistence types from the existing API contract and migration.
2. Implement the in-memory repository with deterministic reset/isolation behavior for tests.
3. Implement the Supabase repository with snake_case/camelCase mapping, repository-owned duplicate detection, and typed handling for configured-storage failures.
4. Update service wiring so storage selection happens once at the boundary and routes retain their current response/status behavior.
5. Add repository/service/API tests for success paths and failure paths, including duplicate slug, invalid input, missing product, and storage failure.
6. Run the API tests/build and frontend build, then perform the optional configured-Supabase create/update/restart/readback smoke check when credentials are available.
7. Record evidence and any remaining limitations before marking the feature complete.

## Test Strategy

- Use an in-memory repository for the default unit and API tests so test runs are deterministic and network-independent.
- Verify the repository contract for list, get, create, update, duplicate slug, missing product, and reset/isolation behavior.
- Verify API status codes and response envelopes for valid and invalid requests.
- Verify configured Supabase failures are surfaced as safe `503` responses rather than silently switching to in-memory state.
- Keep live Supabase verification optional and explicitly separate from the default automated test suite.
- Use the quickstart evidence checklist to distinguish local deterministic proof from actual durable restart/readback proof.

## Constitution Check (Post-Design)

1. **Contract-first** — PASS. Design artifacts are derived from Issue #16 and the feature spec; implementation starts after the API contract is recorded.
2. **Vertical slices** — PASS. The sequence validates product persistence through the existing API boundary and preserves the consuming frontend paths.
3. **Server-owned truth** — PASS. Repository selection and product values stay server-owned; no client-side authority is added.
4. **Acceptance/failure testing** — PASS. The test strategy explicitly covers acceptance paths and failure paths, including configured-storage errors.
5. **Secure boundaries** — PASS. Credentials stay in server configuration and safe error mapping is part of the design.
6. **Minimal architecture** — PASS. The only new abstraction is the narrow repository interface required for two storage modes and deterministic testing.
7. **Evidence** — PASS. Build/test commands and an optional durable smoke check are defined in [quickstart.md](quickstart.md).

**Post-design gate**: PASS. No new constitution violations were introduced by the research or design artifacts.

## Complexity Tracking

No constitution violations require a waiver. The `ProductRepository` boundary is the smallest structural addition that separates the existing durable and in-memory modes, makes the active storage authoritative for duplicate checks, and enables deterministic tests without requiring a live database. A generic repository framework, ORM, or new frontend state layer is intentionally excluded.
