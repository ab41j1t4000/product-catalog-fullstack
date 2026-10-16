<!--
Sync Impact Report
- Version change: unratified template -> 1.0.0
- Modified principles: none; all seven core principles are newly adopted
- Added sections: Architectural and Security Constraints; Development Workflow and Quality Gates
- Removed sections: none
- Follow-up TODOs: none
-->

# Product Catalog Fullstack Constitution

## Core Principles

### I. Contract-First Development

Every feature MUST begin with a durable product contract before implementation. The contract
MUST identify the user outcome, scope, non-goals, observable acceptance criteria, important
failure behavior, and affected interfaces or data. The GitHub Issue is the entry point for
product intent and approval status; the corresponding Spec Kit artifacts hold the detailed
specification, plan, and tasks. The constitution governs project-wide behavior and MUST NOT be
used as a substitute for feature-specific acceptance criteria.

Rationale: separating durable intent from implementation reduces ambiguous work and gives the
developer and coding agent a shared basis for deciding whether a change is complete.

### II. Vertical Full-Stack Slices

User-facing features MUST be delivered as coherent vertical slices across the layers they
actually affect: React UI, HTTP/API behavior, domain logic, persistence, and verification.
Frontend-only or backend-only changes are acceptable when the approved feature contract proves
that the other layers are unaffected. Existing product, cart, admin, and checkout behavior MUST
remain compatible unless the feature contract explicitly approves a breaking change.

Rationale: the repository is one ecommerce product even though its frontend and backend live in
separate folders; feature value and regressions cross that boundary.

### III. Server-Owned Commerce Truth

The backend MUST own authoritative product prices, totals, shipping rules, inventory or
availability decisions, order snapshots, payment outcomes, and other commerce state. Client
requests MUST be treated as untrusted input. The server MUST validate request data, reload
authoritative catalog data when calculating commerce results, and return explicit error outcomes.
The frontend MAY calculate display-only estimates but MUST NOT be the authority for final values.

Rationale: a browser can be modified or retried, while orders and money-related decisions need
one authoritative source of truth.

### IV. Acceptance and Failure-Path Testing

Every acceptance criterion MUST map to a test or another explicitly recorded verification method.
New behavior MUST cover its meaningful failure paths, including invalid input, unavailable data,
declined operations, retries, idempotency conflicts, and state preservation after failure when
those cases apply. Existing flows and compatibility requirements MUST be regression-tested when
they are touched. A passing happy path alone MUST NOT qualify a feature as complete.

Rationale: ecommerce correctness depends on what happens when requests fail or repeat, not only
on the successful browser journey.

### V. Secure Data Boundaries

Secrets, privileged database credentials, and payment-sensitive data MUST remain on the server
and MUST NOT be committed or written to logs. API boundaries MUST validate external input and
return safe error details. Persistence changes MUST use explicit migrations or an equivalent
reviewable change. Authentication, authorization, privacy, and transactional guarantees MUST be
addressed before an MVP limitation is represented as production-ready behavior.

Rationale: local fallbacks and simulated integrations are useful for learning, but they MUST be
clearly separated from production security and durability claims.

### VI. Minimal Maintainable Architecture

The project MUST preserve clear frontend/backend/domain boundaries and prefer the simplest
design that satisfies the approved contract. New work MUST NOT introduce microservices,
event-driven infrastructure, search systems, or framework layers without a documented
requirement and a reviewed migration or operational reason. Existing React, Fastify, and
Supabase-oriented structure SHOULD be extended consistently before a new abstraction is added.

Rationale: the repository's stated scale-up path is from a simple modular application toward
persistence and scale, not premature distributed complexity.

### VII. Evidence-Based Completion

A feature MUST NOT be marked complete until its acceptance criteria, implementation, and
verification evidence are traceable. The pull request MUST link the GitHub Issue and identify
the relevant Spec Kit artifacts. Completion evidence MUST state what was tested, what was
observed locally, and which limitations remain. Local verification MUST NOT be described as
production validation unless production behavior was actually verified.

Rationale: traceable evidence keeps the issue, specification, code, tests, and release decision
consistent for both human review and future agent work.

## Architectural and Security Constraints

- The frontend uses React, TypeScript, Vite, Chakra UI, TanStack Query, and React Router.
- The backend uses Fastify and TypeScript, with Supabase/PostgreSQL as the persistence path when
  configured and an in-memory fallback only where the approved local or test context permits it.
- The backend owns request validation, business logic, and persistence orchestration; the
  frontend owns presentation and request-lifecycle state.
- Existing MVP limitations, such as process-local carts or orders, no authentication, and
  simulated payments, MUST remain explicit in the relevant feature specification and MUST NOT be
  silently presented as production capabilities.
- Database, payment, inventory, authentication, and order changes MUST document consistency,
  retry, and failure behavior before implementation.

## Development Workflow and Quality Gates

1. A GitHub Issue records the feature intent, owner, priority, scope, non-goals, and acceptance
   criteria.
2. Spec Kit produces and maintains the feature specification, implementation plan, and ordered
   tasks under the repository's feature-artifact directory.
3. The developer MUST review and approve the specification before planning, and MUST review and
   approve the plan and tasks before implementation begins.
4. Implementation MUST occur through a linked branch and pull request. The pull request MUST
   identify affected frontend, backend, persistence, and test surfaces.
5. Pull-request review MUST check constitutional compliance, acceptance-criterion coverage,
   security boundaries, regression risk, and the accuracy of the verification evidence.
6. The implementation MUST pass the applicable backend tests, frontend checks, builds, and
   acceptance verification before the issue is moved to Done.
7. After implementation, convergence MUST compare the codebase against the approved spec, plan,
   and tasks. Any remaining work MUST be recorded before completion is claimed.

## Governance

This constitution defines project-wide engineering rules. A GitHub Issue and its Spec Kit
artifacts define feature-specific behavior; they MAY add detail but MUST NOT silently contradict
this constitution. If a feature requires an exception, the exception MUST be documented in the
feature's issue or pull request, include its scope and expiry or follow-up, and receive explicit
developer review.

Amendments MUST be made through a reviewed pull request that includes a Sync Impact Report,
the reason for the change, affected specifications or workflows, and any migration work needed
for existing features. The amendment MUST update the version and last-amended date.

Versioning follows semantic versioning:

- MAJOR: remove or redefine a principle in a backward-incompatible way.
- MINOR: add a principle or materially expand project-wide governance.
- PATCH: clarify wording, fix an error, or make a non-semantic refinement.

Constitution compliance MUST be reviewed during specification approval, plan approval, pull
request review, and final convergence. The constitution takes precedence over undocumented local
habit. The constitution itself MUST remain concise enough to be read before starting a feature.

**Version**: 1.0.0 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-16
