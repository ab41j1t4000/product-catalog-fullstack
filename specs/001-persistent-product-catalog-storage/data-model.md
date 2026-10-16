# Data Model: Persistent Product Catalog Storage

## Product

Represents one catalog item shown to shoppers and maintained by an administrator.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `id` | string in API; numeric identity in durable storage | yes after save | Stable identifier; returned as a string at the API boundary |
| `slug` | string | yes | Non-empty and unique within the catalog |
| `name` | string | yes | Non-empty |
| `priceInr` | non-negative integer | yes | Represents whole INR units for the current MVP |
| `shortDescription` | string | yes | Non-empty |
| `imageUrl` | string | yes | Non-empty URL value accepted by the current product contract |
| `maskType` | string | yes | Non-empty taxonomy value |
| `inStock` | boolean | yes | Availability flag; numeric inventory is out of scope |
| `createdAt` | timestamp | storage-only | Set when the durable record is created; not required in the current API shape |
| `updatedAt` | timestamp | storage-only | Updated when the durable record changes; not required in the current API shape |

## Catalog

The catalog is the collection of saved product records. It has no separate user-managed
identifier in this feature.

Relationships:

- A catalog contains many products.
- Each product belongs to the single catalog supported by the current MVP.
- Product slug uniqueness is enforced within that catalog.

## Product persistence state

The selected repository determines where the catalog is read and written:

- **Durable mode**: all successful product reads and writes use the configured persistent store.
- **Fallback mode**: controlled in-memory fixtures are used only when durable storage is not
  configured for local or test execution.
- **Unavailable mode**: a configured but unreachable store produces a safe failure; it MUST NOT
  be treated as fallback mode.

## State transitions

```text
new input --valid create--> saved product
new input --invalid create--> rejected; no record
saved product --valid update--> updated product
saved product --invalid update--> unchanged product
missing product --update--> not-found; no unrelated record changed
configured store --unavailable--> safe failure; no false success
```

## Validation invariants

- A product cannot be saved without all required fields.
- A product price cannot be negative or fractional in the current MVP.
- Two products cannot share a slug.
- An update cannot mutate a different product when the requested identifier is missing.
- The API product shape remains camelCase even when durable storage uses snake_case columns.
