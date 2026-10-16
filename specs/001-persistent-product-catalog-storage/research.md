# Research: Persistent Product Catalog Storage

## Decision 1: Use the existing durable store and preserve the local fallback

- **Decision**: Use Supabase/PostgreSQL as the durable product store when both server
  credentials are configured. Preserve the in-memory store for deterministic local and test
  execution.
- **Rationale**: The repository already contains a product migration, seed data, a server-only
  Supabase client, and a product service that maps database fields to the existing product
  shape. Replacing this path would add risk without improving the feature outcome.
- **Alternatives considered**:
  - A new database or ORM: rejected because it conflicts with the existing persistence path and
    adds unnecessary migration and runtime complexity.
  - A live remote database for the default test suite: rejected because it requires credentials,
    network access, remote state, and mutable shared data.

## Decision 2: Introduce a narrow product repository boundary

- **Decision**: Separate product persistence behind a small `ProductRepository` boundary with
  Supabase and in-memory implementations. Keep validation and product behavior in the service;
  do not introduce a generic repository framework.
- **Rationale**: The current service embeds the two storage paths in one global module. A narrow
  boundary makes test fixtures and dependency control explicit while preserving the current
  route and service behavior.
- **Alternatives considered**:
  - Keep all storage branching in `product.service.ts`: smallest diff, but it keeps persistence
    and test setup tightly coupled.
  - Add a generic repository or ORM layer: rejected as premature abstraction.

## Decision 3: Treat configured-storage failures as failures

- **Decision**: If durable storage is configured but unavailable, reads and writes return the
  existing safe database error contract. The service MUST NOT silently fall back to in-memory
  data in that mode.
- **Rationale**: Silent fallback could make the administrator believe a product was saved when
  it would disappear after restart. It also prevents the catalog from switching authority
  without an explicit configuration decision.
- **Alternatives considered**:
  - Fall back after any remote error: rejected because it violates server-owned catalog truth.
  - Return raw database errors: rejected because credentials and provider details must not leak.

## Decision 4: Keep tests deterministic and separate from live persistence

- **Decision**: Default tests use the in-memory repository with resettable fixtures. Repository
  contract tests cover equivalent list, detail, create, update, duplicate, invalid-input, and
  missing-product behavior. Live Supabase verification is an optional environment check, not a
  prerequisite for the default suite.
- **Rationale**: This satisfies the feature contract without depending on credentials or remote
  state. A live database cannot be replaced by an in-memory test for restart durability, so the
  quickstart also documents an explicit configured-storage restart check.
- **Alternatives considered**:
  - Claim restart durability from an in-memory test: rejected because process-local data cannot
    prove persistence across process boundaries.
  - Require local PostgreSQL/Supabase for every test: rejected because it increases setup cost
    and is unnecessary for unit and route contract coverage.

## Resolved risks and remaining boundaries

- Partial storage configuration MUST produce a typed configuration failure mapped to a safe
  service-unavailable response rather than a generic unexpected error.
- Duplicate-slug checks MUST be authoritative for the selected repository; the in-memory array
  MUST NOT pre-validate a request when the Supabase repository is active.
- The current database migration and seed remain the schema/data baseline. The plan verifies
  them but does not claim that a remote project has been migrated unless that environment is
  explicitly exercised.
- Authentication, authorization, numeric inventory, and multi-user persistence remain outside
  this feature.
